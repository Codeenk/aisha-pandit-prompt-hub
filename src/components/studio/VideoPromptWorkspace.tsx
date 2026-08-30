'use client';

import React, { useState } from 'react';
import {
  ImageReference,
  VideoControls,
  PromptEngineResponse,
  ModifyAction,
} from '@/types/prompt';
import { ReferenceUploadCard } from './ReferenceUploadCard';
import { CreativeDirectionInput } from './CreativeDirectionInput';
import { AdvancedVideoControls } from './AdvancedVideoControls';
import { PromptOutputCard } from './PromptOutputCard';
import { LoadingState } from './LoadingState';
import { createMicroThumbnail } from '@/lib/validation/image-utils';
import { Film, AlertCircle } from 'lucide-react';

interface VideoPromptWorkspaceProps {
  onPromptGenerated: (
    response: PromptEngineResponse,
    creativeDirection: string,
    thumbnail?: string
  ) => void;
  activePromptResponse: PromptEngineResponse | null;
  setActivePromptResponse: (res: PromptEngineResponse | null) => void;
}

export const VideoPromptWorkspace: React.FC<VideoPromptWorkspaceProps> = ({
  onPromptGenerated,
  activePromptResponse,
  setActivePromptResponse,
}) => {
  // Reference State (Single Source Image)
  const [sourceImage, setSourceImage] = useState<ImageReference | null>(null);

  // Creative Direction State
  const [creativeDirection, setCreativeDirection] = useState('');

  // Video Controls State
  const [controls, setControls] = useState<VideoControls>({
    duration: 'Auto',
    cameraMovement: 'Auto',
    motionStyle: 'Auto',
    pacing: 'Auto',
  });

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [activeAction, setActiveAction] = useState<ModifyAction | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    source?: string;
    direction?: string;
    general?: string;
  }>({});

  const validate = (): boolean => {
    const errors: typeof validationErrors = {};
    if (!sourceImage) {
      errors.source = 'Source image required. Upload the final image to animate.';
    }
    if (!creativeDirection.trim()) {
      errors.direction = 'Tell us what should happen in the video.';
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
      const res = await fetch('/api/generate-video-prompt', {
        method: 'POST',
        headers: getCustomHeaders(),
        body: JSON.stringify({
          sourceImage,
          creativeDirection,
          controls,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate video prompt.');
      }

      setActivePromptResponse(data);
      const microThumb = sourceImage?.dataUrl ? await createMicroThumbnail(sourceImage.dataUrl) : undefined;
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
          mode: 'video',
          action,
          creativeDirection,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to ${action} prompt.`);
      }

      setActivePromptResponse(data);
      const microThumb = sourceImage?.dataUrl ? await createMicroThumbnail(sourceImage.dataUrl) : undefined;
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
    setSourceImage(null);
    setCreativeDirection('');
    setActivePromptResponse(null);
    setValidationErrors({});
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
      {/* LEFT COLUMN: Video Source & Motion Direction */}
      <div className="lg:col-span-6 xl:col-span-6 space-y-5">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">
              Source Frame & Motion Direction
            </h2>
            <span className="text-xs text-zinc-400">Step 1 of 2</span>
          </div>

          {/* Engine Compatibility & Anti-Refusal Tip */}
          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-zinc-300 flex items-start gap-2.5">
            <span className="text-indigo-400 font-bold text-sm">💡</span>
            <div className="space-y-0.5">
              <p className="font-semibold text-indigo-300">AI Influencer Video Engine Guidance:</p>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                If Google Veo blocks real human image uploads with &ldquo;real people&rdquo; warnings, use the generated prompt with <strong>Kling AI</strong>, <strong>Runway Gen-3</strong>, or <strong>Luma Dream Machine</strong> for seamless image-to-video character animation, or use Veo in Text-to-Video mode.
              </p>
            </div>
          </div>

          {/* Source Image Card (Required) */}
          <ReferenceUploadCard
            label="Source Image"
            description="The visual source of truth. Upload the final image you want the video model to animate."
            isRequired
            value={sourceImage}
            onChange={setSourceImage}
            sampleType="video-source"
            sampleLabel="Use Mirror Selfie Frame"
            hasError={!!validationErrors.source}
            errorMessage={validationErrors.source}
          />

          {/* Video Creative Direction Textarea */}
          <CreativeDirectionInput
            value={creativeDirection}
            onChange={setCreativeDirection}
            mode="video"
            hasError={!!validationErrors.direction}
            errorMessage={validationErrors.direction}
          />

          {/* Advanced Video Controls Accordion */}
          <AdvancedVideoControls controls={controls} onChange={setControls} />

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
            className="w-full py-4 px-6 rounded-2xl font-extrabold text-sm sm:text-base text-white bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 shadow-xl shadow-fuchsia-600/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 disabled:opacity-50 cursor-pointer"
          >
            <Film className={`w-5 h-5 text-white ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Engineering Video Prompt...' : 'Generate Video Prompt'}</span>
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: Output Laboratory Workspace */}
      <div className="lg:col-span-6 xl:col-span-6 lg:sticky lg:top-24">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">
              Generated Video Prompt Workspace
            </h2>
            <span className="text-xs text-zinc-400">Step 2 of 2</span>
          </div>

          {isLoading ? (
            <LoadingState mode="video" />
          ) : (
            <PromptOutputCard
              mode="video"
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
