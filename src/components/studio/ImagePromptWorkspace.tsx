'use client';

import React, { useState } from 'react';
import {
  ImageReference,
  ImageControls,
  PromptEngineResponse,
  ModifyAction,
} from '@/types/prompt';
import { ReferenceUploadCard } from './ReferenceUploadCard';
import { CreativeDirectionInput } from './CreativeDirectionInput';
import { AdvancedImageControls } from './AdvancedImageControls';
import { PromptOutputCard } from './PromptOutputCard';
import { LoadingState } from './LoadingState';
import { createMicroThumbnail } from '@/lib/validation/image-utils';
import { Sparkles, AlertCircle } from 'lucide-react';

interface ImagePromptWorkspaceProps {
  onPromptGenerated: (
    response: PromptEngineResponse,
    creativeDirection: string,
    thumbnail?: string
  ) => void;
  activePromptResponse: PromptEngineResponse | null;
  setActivePromptResponse: (res: PromptEngineResponse | null) => void;
}

export const ImagePromptWorkspace: React.FC<ImagePromptWorkspaceProps> = ({
  onPromptGenerated,
  activePromptResponse,
  setActivePromptResponse,
}) => {
  // Reference States
  const [modelRef, setModelRef] = useState<ImageReference | null>(null);
  const [fashionRef, setFashionRef] = useState<ImageReference | null>(null);
  const [locationRef, setLocationRef] = useState<ImageReference | null>(null);

  // Creative Direction State
  const [creativeDirection, setCreativeDirection] = useState('');

  // Controls State
  const [controls, setControls] = useState<ImageControls>({
    composition: 'Auto',
    camera: 'Auto',
    lighting: 'Auto',
    aspectRatio: 'Auto',
    visualStyle: 'Photorealistic',
  });

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [activeAction, setActiveAction] = useState<ModifyAction | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    model?: string;
    fashion?: string;
    direction?: string;
    general?: string;
  }>({});

  const validate = (): boolean => {
    const errors: typeof validationErrors = {};
    if (!modelRef) {
      errors.model = 'Model reference required (identity anchor)';
    }
    if (!fashionRef) {
      errors.fashion = 'Fashion reference required (garment source)';
    }
    if (!creativeDirection.trim()) {
      errors.direction = 'Tell us what you want to create first.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getCustomHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('aisha_custom_gemini_key');
      const savedModel = localStorage.getItem('aisha_custom_gemini_model');
      if (savedKey) headers['x-gemini-api-key'] = savedKey;
      if (savedModel) headers['x-gemini-model'] = savedModel;
    }
    return headers;
  };

  const handleGenerate = async () => {
    if (!validate()) return;

    setIsLoading(true);
    setValidationErrors({});

    try {
      const res = await fetch('/api/generate-image-prompt', {
        method: 'POST',
        headers: getCustomHeaders(),
        body: JSON.stringify({
          modelReference: modelRef,
          fashionReference: fashionRef,
          locationReference: locationRef,
          creativeDirection,
          controls,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate image prompt.');
      }

      setActivePromptResponse(data);
      const microThumb = modelRef?.dataUrl ? await createMicroThumbnail(modelRef.dataUrl) : undefined;
      onPromptGenerated(data, creativeDirection, microThumb);
    } catch (err: unknown) {
      const error = err as Error;
      setValidationErrors({
        general:
          error.message ||
          'Prompt generation failed. Check your API configuration and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModify = async (action: ModifyAction) => {
    if (!activePromptResponse?.prompt) return;

    setIsModifying(true);
    setActiveAction(action);
    setValidationErrors({});

    try {
      const res = await fetch('/api/modify-prompt', {
        method: 'POST',
        headers: getCustomHeaders(),
        body: JSON.stringify({
          currentPrompt: activePromptResponse.prompt,
          mode: 'image',
          action,
          creativeDirection,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to ${action} prompt.`);
      }

      setActivePromptResponse(data);
      const microThumb = modelRef?.dataUrl ? await createMicroThumbnail(modelRef.dataUrl) : undefined;
      onPromptGenerated(data, creativeDirection, microThumb);
    } catch (err: unknown) {
      const error = err as Error;
      setValidationErrors({
        general: error.message || `Failed to ${action} prompt. Please retry.`,
      });
    } finally {
      setIsModifying(false);
      setActiveAction(null);
    }
  };

  const handleStartOver = () => {
    setModelRef(null);
    setFashionRef(null);
    setLocationRef(null);
    setCreativeDirection('');
    setActivePromptResponse(null);
    setValidationErrors({});
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
      {/* LEFT COLUMN: Creative Workspace & References */}
      <div className="lg:col-span-6 xl:col-span-6 space-y-5">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">
              Creative Input & References
            </h2>
            <span className="text-xs text-zinc-400">Step 1 of 2</span>
          </div>

          {/* Model Reference Card */}
          <ReferenceUploadCard
            label="Model Reference"
            description="The identity source. Facial characteristics, skin undertone, and natural proportions to preserve."
            isRequired
            value={modelRef}
            onChange={setModelRef}
            sampleType="model"
            sampleLabel="Use Aisha Model"
            hasError={!!validationErrors.model}
            errorMessage={validationErrors.model}
          />

          {/* Fashion Reference Card */}
          <ReferenceUploadCard
            label="Fashion / Garment Reference"
            description="The clothing source. The prompt will instruct downstream AI to reproduce this garment accurately."
            isRequired
            value={fashionRef}
            onChange={setFashionRef}
            sampleType="fashion"
            sampleLabel="Use Silk Gown"
            hasError={!!validationErrors.fashion}
            errorMessage={validationErrors.fashion}
          />

          {/* Location Reference Card */}
          <ReferenceUploadCard
            label="Location / Environment Reference"
            description="Optional scenery reference. If omitted, the environment is inferred exclusively from your description."
            isRequired={false}
            value={locationRef}
            onChange={setLocationRef}
            sampleType="location"
            sampleLabel="Use Villa Terrace"
          />

          {/* Creative Direction Textarea */}
          <CreativeDirectionInput
            value={creativeDirection}
            onChange={setCreativeDirection}
            mode="image"
            hasError={!!validationErrors.direction}
            errorMessage={validationErrors.direction}
          />

          {/* Advanced Controls Accordion */}
          <AdvancedImageControls controls={controls} onChange={setControls} />

          {/* Global Error Banner */}
          {validationErrors.general && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{validationErrors.general}</p>
            </div>
          )}

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || isModifying}
            className="w-full py-4 px-6 rounded-2xl font-extrabold text-sm sm:text-base text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 shadow-xl shadow-indigo-600/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className={`w-5 h-5 text-white ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Engineering Image Prompt...' : 'Generate Image Prompt'}</span>
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: Output Laboratory Workspace */}
      <div className="lg:col-span-6 xl:col-span-6 lg:sticky lg:top-24">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">
              Generated Prompt Workspace
            </h2>
            <span className="text-xs text-zinc-400">Step 2 of 2</span>
          </div>

          {isLoading ? (
            <LoadingState mode="image" />
          ) : (
            <PromptOutputCard
              mode="image"
              response={activePromptResponse}
              isLoading={isLoading}
              onModify={handleModify}
              onStartOver={handleStartOver}
              isModifying={isModifying}
              activeAction={activeAction}
            />
          )}
        </div>
      </div>
    </div>
  );
};
