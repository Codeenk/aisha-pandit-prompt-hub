'use client';

import React, { useState } from 'react';
import {
  ImageReference,
  MotionTransferControls,
  MotionTargetEngine,
  PromptEngineResponse,
  ModifyAction,
} from '@/types/prompt';
import { ReferenceUploadCard } from './ReferenceUploadCard';
import { LoadingState } from './LoadingState';
import { MotionVideoUpload } from './MotionVideoUpload';
import { DownstreamWorkflowGuide } from './DownstreamWorkflowGuide';
import { PromptOutputCard } from './PromptOutputCard';
import { createMicroThumbnail } from '@/lib/validation/image-utils';
import {
  Wand2,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Video,
  AlignLeft,
  Zap,
} from 'lucide-react';

interface MotionTransferWorkspaceProps {
  onPromptGenerated: (response: PromptEngineResponse, creativeDirection: string, thumbnail?: string) => void;
  activePromptResponse: PromptEngineResponse | null;
  setActivePromptResponse: (r: PromptEngineResponse | null) => void;
}

const DEFAULT_CONTROLS: MotionTransferControls = {
  motionInputMode: 'video-upload',
  customWardrobe: '',
  customEnvironment: '',
  cinematographyStyle: '',
  targetEngine: 'Auto (Veo 3.1 / Kling AI / Runway)',
};

const PRESET_WARDROBES = [
  'Holographic silver oversized bomber jacket, matte black cropped top, high-waisted utility cargo trousers',
  'Maroon lace long-sleeve dress with elegant neckline',
  'Pastel co-ord set with wide-leg trousers and bralette top',
  'Black leather biker jacket, white vintage tee, dark denim jeans',
  'Ivory silk satin slip dress with thin straps and subtle sheen',
];

const PRESET_ENVIRONMENTS = [
  'Minimalist futuristic glass showroom in Tokyo at twilight, soft cyber-blue ambient strip lighting',
  'Warmly lit sunlit Mediterranean courtyard, travertine tiles, whitewashed arch, distant sea haze',
  'Luxury high-fashion Parisian boutique with marble floors, champagne ambient light, gold accents',
  'Industrial loft studio with exposed brick, large skylights, neutral gray tones',
  'Rooftop terrace at golden hour, city skyline in soft bokeh, warm directional sunlight',
];

const PRESET_CINEMATOGRAPHY = [
  'Ultra-realistic 4K, anamorphic lens, smooth orbital tracking shot, volumetric ambient lighting',
  'Cinematic 24fps, 85mm f/1.4 portrait lens, slow dolly push-in, shallow depth of field',
  'Social media 9:16 vertical, natural handheld camera drift, warm influencer-grade ring fill',
  'Fashion editorial, top-down bird eye transitioning to eye-level, clean sharp shadows',
];

export const MotionTransferWorkspace: React.FC<MotionTransferWorkspaceProps> = ({
  onPromptGenerated,
  activePromptResponse,
  setActivePromptResponse,
}) => {
  const [influencerImage, setInfluencerImage] = useState<ImageReference | null>(null);
  const [wardrobeImage, setWardrobeImage] = useState<ImageReference | null>(null);
  const [environmentImage, setEnvironmentImage] = useState<ImageReference | null>(null);
  const [motionDescriptor, setMotionDescriptor] = useState('');
  const [controls, setControls] = useState<MotionTransferControls>(DEFAULT_CONTROLS);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [activeAction, setActiveAction] = useState<ModifyAction | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showControls, setShowControls] = useState(true);
  const [extractedMeta, setExtractedMeta] = useState<{ style: string; pacing: string; joints: string[] } | null>(null);

  const getCustomHeaders = () => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('aisha_custom_gemini_key');
      const savedModel = localStorage.getItem('aisha_custom_gemini_model');
      if (savedKey) headers['x-gemini-api-key'] = savedKey;
      if (savedModel) headers['x-gemini-model'] = savedModel;
    }
    return headers;
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!motionDescriptor.trim()) errs.motion = 'Motion descriptor required. Upload a video or enter manually.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleGenerate = async () => {
    if (!validate()) return;
    setIsGenerating(true);
    setActivePromptResponse(null);
    try {
      const res = await fetch('/api/generate-motion-prompt', {
        method: 'POST',
        headers: getCustomHeaders(),
        body: JSON.stringify({
          influencerImage: influencerImage
            ? { dataUrl: influencerImage.dataUrl, mimeType: influencerImage.mimeType }
            : null,
          wardrobeImage: wardrobeImage
            ? { dataUrl: wardrobeImage.dataUrl, mimeType: wardrobeImage.mimeType }
            : null,
          environmentImage: environmentImage
            ? { dataUrl: environmentImage.dataUrl, mimeType: environmentImage.mimeType }
            : null,
          motionDescriptor: motionDescriptor.trim(),
          customWardrobe: controls.customWardrobe,
          customEnvironment: controls.customEnvironment,
          cinematographyStyle: controls.cinematographyStyle,
          targetEngine: controls.targetEngine,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Generation failed.');
      }
      const data: PromptEngineResponse = await res.json();
      setActivePromptResponse(data);
      const primaryImage = influencerImage?.dataUrl || wardrobeImage?.dataUrl || environmentImage?.dataUrl;
      const thumb = primaryImage
        ? await createMicroThumbnail(primaryImage)
        : undefined;
      onPromptGenerated(data, motionDescriptor, thumb);
    } catch (err) {
      setErrors({ general: (err as Error).message || 'Generation failed. Please try again.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleModify = async (action: ModifyAction) => {
    if (!activePromptResponse?.prompt) return;
    setIsModifying(true);
    setActiveAction(action);
    setErrors({});
    try {
      const res = await fetch('/api/modify-prompt', {
        method: 'POST',
        headers: getCustomHeaders(),
        body: JSON.stringify({
          currentPrompt: activePromptResponse.prompt,
          mode: 'video',
          action,
          creativeDirection: motionDescriptor,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to ${action} prompt.`);
      }
      setActivePromptResponse(data);
      const primaryImage = influencerImage?.dataUrl || wardrobeImage?.dataUrl || environmentImage?.dataUrl;
      const thumb = primaryImage
        ? await createMicroThumbnail(primaryImage)
        : undefined;
      onPromptGenerated(data, motionDescriptor, thumb);
    } catch (err: unknown) {
      const error = err as Error;
      setErrors({
        general: error.message || `Failed to ${action} prompt. Please retry.`,
      });
    } finally {
      setIsModifying(false);
      setActiveAction(null);
    }
  };

  const handleStartOver = () => {
    setInfluencerImage(null);
    setWardrobeImage(null);
    setEnvironmentImage(null);
    setMotionDescriptor('');
    setActivePromptResponse(null);
    setErrors({});
    setExtractedMeta(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-6">
      {/* ── LEFT COLUMN: Inputs ── */}
      <div className="space-y-5">
        {/* AI Influencer Image */}
        <div className="space-y-2">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">
            Step 1 — AI Influencer Character
          </h2>
          <ReferenceUploadCard
            label="Influencer Character Image"
            description="Upload your AI influencer / avatar image. This anchors the identity in the Master Prompt."
            isRequired={false}
            value={influencerImage}
            onChange={setInfluencerImage}
            sampleType="model"
            sampleLabel="Use Sample Character"
          />
          <p className="text-[11px] text-zinc-500 pl-1">
            Optional but strongly recommended. Without it, the engine uses a generic character description.
          </p>
        </div>

        {/* Motion Source */}
        <div className="space-y-2">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">
            Step 2 — Motion Source
          </h2>

          {/* Mode Toggle */}
          <div className="flex rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950/40 p-1 gap-1">
            <button
              type="button"
              onClick={() => setControls((c) => ({ ...c, motionInputMode: 'video-upload' }))}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all
                ${controls.motionInputMode === 'video-upload'
                  ? 'bg-violet-600 text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <Video className="w-3.5 h-3.5" /> Video Upload
            </button>
            <button
              type="button"
              onClick={() => setControls((c) => ({ ...c, motionInputMode: 'manual-text' }))}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all
                ${controls.motionInputMode === 'manual-text'
                  ? 'bg-violet-600 text-white shadow'
                  : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              <AlignLeft className="w-3.5 h-3.5" /> Manual Text
            </button>
          </div>

          {controls.motionInputMode === 'video-upload' ? (
            <MotionVideoUpload
              onMotionExtracted={(descriptor, result) => {
                setMotionDescriptor(descriptor);
                setExtractedMeta({ style: result.motionStyle, pacing: result.pacing, joints: result.dominantJoints });
                setErrors((e) => ({ ...e, motion: '' }));
              }}
              targetEngine={controls.targetEngine}
              isExtracting={isExtracting}
              setIsExtracting={setIsExtracting}
            />
          ) : (
            <div className="space-y-2">
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Open <a href="https://gemini.google.com" target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">Gemini.google.com</a> → attach your video → use this prompt:
                <br/>
                <span className="italic text-zinc-400">&quot;Analyze the human motion in this video frame-by-frame. Convert it into a detailed skeletal motion description for an AI video generation prompt. Focus on joint movements, weight distribution, rotation, hand gestures, and pacing. Ignore original clothing and background.&quot;</span>
              </p>
              <textarea
                value={motionDescriptor}
                onChange={(e) => {
                  setMotionDescriptor(e.target.value);
                  if (e.target.value) setErrors((e2) => ({ ...e2, motion: '' }));
                }}
                placeholder="Paste your extracted skeletal motion descriptor here…"
                rows={6}
                className="w-full px-3 py-2.5 bg-zinc-950/60 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-violet-500"
              />
            </div>
          )}

          {/* Extracted motion descriptor preview */}
          {motionDescriptor && controls.motionInputMode === 'video-upload' && (
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-400">Motion Extracted ✓</span>
                {extractedMeta && (
                  <div className="flex gap-1 ml-auto">
                    {[extractedMeta.style, extractedMeta.pacing, ...(extractedMeta.joints.slice(0, 2))].map((tag) => (
                      <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-zinc-400 font-medium">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <textarea
                value={motionDescriptor}
                onChange={(e) => setMotionDescriptor(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-zinc-950/40 border border-zinc-800 rounded-lg text-[11px] text-zinc-300 resize-none focus:outline-none focus:border-violet-500"
              />
            </div>
          )}

          {errors.motion && (
            <p className="text-xs text-red-400 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> {errors.motion}
            </p>
          )}
        </div>
      </div>

      {/* ── RIGHT COLUMN: Controls + Output ── */}
      <div className="space-y-5">
        {/* Creative Controls */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowControls(!showControls)}
            className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-zinc-900/60 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-zinc-800 text-violet-400">
                <SlidersHorizontal className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100">Step 3 — Wardrobe, Environment & Style</h3>
                <p className="text-xs text-zinc-400">Custom outfit · Location · Cinematography · Target engine</p>
              </div>
            </div>
            {showControls ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
          </button>

          {showControls && (
            <div className="border-t border-zinc-800/60 p-4 space-y-4">
              {/* Wardrobe */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-300">Custom Wardrobe / Outfit</label>
                  <span className="text-[11px] text-zinc-500">Image Reference &amp; Styling</span>
                </div>
                <ReferenceUploadCard
                  label="Wardrobe Reference Image (Optional)"
                  description="Upload a garment, dress, or outfit lookbook image to clothe the character."
                  isRequired={false}
                  value={wardrobeImage}
                  onChange={setWardrobeImage}
                  sampleType="fashion"
                  sampleLabel="Use Sample Outfit"
                />
                <textarea
                  value={controls.customWardrobe}
                  onChange={(e) => setControls((c) => ({ ...c, customWardrobe: e.target.value }))}
                  placeholder={
                    wardrobeImage
                      ? "Optional: Add extra styling notes or color adjustments to the outfit above..."
                      : "e.g. Holographic silver bomber jacket, matte black cropped top, cargo trousers…"
                  }
                  rows={2}
                  className="w-full px-3 py-2 bg-zinc-950/60 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-violet-500"
                />
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_WARDROBES.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setControls((c) => ({ ...c, customWardrobe: p }))}
                      className="px-2 py-0.5 rounded-full bg-zinc-800 hover:bg-violet-600/20 text-[10px] text-zinc-400 hover:text-violet-300 border border-zinc-700/60 hover:border-violet-500/30 transition-colors"
                    >
                      {p.slice(0, 40)}…
                    </button>
                  ))}
                </div>
              </div>

              {/* Environment */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-300">Custom Environment / Location</label>
                  <span className="text-[11px] text-zinc-500">Image Reference &amp; Atmosphere</span>
                </div>
                <ReferenceUploadCard
                  label="Environment Reference Image (Optional)"
                  description="Upload an architecture, setting, or room image for the scene."
                  isRequired={false}
                  value={environmentImage}
                  onChange={setEnvironmentImage}
                  sampleType="location"
                  sampleLabel="Use Sample Location"
                />
                <textarea
                  value={controls.customEnvironment}
                  onChange={(e) => setControls((c) => ({ ...c, customEnvironment: e.target.value }))}
                  placeholder={
                    environmentImage
                      ? "Optional: Add atmosphere, lighting, or background depth notes for the setting above..."
                      : "e.g. Minimalist Tokyo showroom at twilight, cyber-blue ambient strip lighting…"
                  }
                  rows={2}
                  className="w-full px-3 py-2 bg-zinc-950/60 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-violet-500"
                />
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_ENVIRONMENTS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setControls((c) => ({ ...c, customEnvironment: p }))}
                      className="px-2 py-0.5 rounded-full bg-zinc-800 hover:bg-violet-600/20 text-[10px] text-zinc-400 hover:text-violet-300 border border-zinc-700/60 hover:border-violet-500/30 transition-colors"
                    >
                      {p.slice(0, 40)}…
                    </button>
                  ))}
                </div>
              </div>

              {/* Cinematography */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Cinematography Style</label>
                <textarea
                  value={controls.cinematographyStyle}
                  onChange={(e) => setControls((c) => ({ ...c, cinematographyStyle: e.target.value }))}
                  placeholder="e.g. Ultra-realistic 4K, anamorphic lens, smooth orbital tracking shot…"
                  rows={2}
                  className="w-full px-3 py-2 bg-zinc-950/60 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-violet-500"
                />
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_CINEMATOGRAPHY.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setControls((c) => ({ ...c, cinematographyStyle: p }))}
                      className="px-2 py-0.5 rounded-full bg-zinc-800 hover:bg-violet-600/20 text-[10px] text-zinc-400 hover:text-violet-300 border border-zinc-700/60 hover:border-violet-500/30 transition-colors"
                    >
                      {p.slice(0, 40)}…
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Engine */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">Target Free Video Engine</label>
                <select
                  value={controls.targetEngine}
                  onChange={(e) => setControls((c) => ({ ...c, targetEngine: e.target.value as MotionTargetEngine }))}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-violet-500"
                >
                  <option value="Auto (Veo 3.1 / Kling AI / Runway)">Auto (Balanced for all engines)</option>
                  <option value="Google Veo 3.1 (Free via Google Vids / Morph Studio)">Google Veo 3.1 — Free via Google Vids / Morph Studio</option>
                  <option value="Kling AI (Free Daily Credits — Best Character Motion)">Kling AI — Free Daily Credits · Best Character Motion</option>
                  <option value="Runway Gen-3/4 (Free Tier — Kinetic Camera)">Runway Gen-3/4 — Free Tier · Kinetic Camera</option>
                  <option value="Hailuo / MiniMax AI (Free Tier — Cinematic Realism)">Hailuo / MiniMax AI — Free Tier · Cinematic Realism</option>
                  <option value="Viggle AI Mix (Free — Direct Video Character Swap)">Viggle AI Mix — Free · Direct Video Character Swap</option>
                </select>
                <p className="text-[10px] text-zinc-600">
                  Optimizes prompt dialect & phrasing for the selected engine.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || isExtracting}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-lg transition-all"
        >
          <Wand2 className="w-4 h-4" />
          Generate Veo 3.1 Master Prompt
        </button>

        {errors.general && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {errors.general}
          </div>
        )}

        {/* Prompt Output / Loading */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-zinc-400">
              Master Prompt Studio
            </h2>
            <span className="text-xs text-zinc-400">Veo 3.1 / Kling / Runway</span>
          </div>

          {isGenerating ? (
            <LoadingState mode="motion" />
          ) : (
            <div className="space-y-4">
              <PromptOutputCard
                mode="motion"
                response={activePromptResponse}
                isLoading={isGenerating}
                onModify={handleModify}
                onStartOver={handleStartOver}
                isModifying={isModifying}
                activeAction={activeAction}
              />

              {activePromptResponse && (
                <DownstreamWorkflowGuide
                  masterPrompt={activePromptResponse.prompt}
                  negativePrompt={activePromptResponse.negative_prompt}
                  targetEngine={controls.targetEngine}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
