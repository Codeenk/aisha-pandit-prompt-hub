'use client';

import React, { useState } from 'react';
import { PromptEngineResponse, StudioMode, ModifyAction } from '@/types/prompt';
import {
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Minimize2,
  Maximize2,
  RotateCcw,
  Gauge,
  Tag,
  ShieldCheck,
  Film,
  Image as ImageIcon,
  Scan,
} from 'lucide-react';

interface PromptOutputCardProps {
  mode: StudioMode;
  response: PromptEngineResponse | null;
  isLoading: boolean;
  onModify: (action: ModifyAction) => void;
  onStartOver: () => void;
  isModifying: boolean;
  activeAction: ModifyAction | null;
}

export const PromptOutputCard: React.FC<PromptOutputCardProps> = ({
  mode,
  response,
  isLoading,
  onModify,
  onStartOver,
  isModifying,
  activeAction,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedNegative, setCopiedNegative] = useState(false);

  const handleCopy = async () => {
    if (!response?.prompt) return;
    try {
      await navigator.clipboard.writeText(response.prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  if (!response) {
    return (
      <div className="h-full rounded-2xl border border-zinc-800/80 bg-zinc-900/20 p-8 flex flex-col items-center justify-center text-center min-h-[420px] relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4 shadow-xl">
          {mode === 'image' ? (
            <ImageIcon className="w-8 h-8 text-indigo-400/60" />
          ) : mode === 'motion' ? (
            <Scan className="w-8 h-8 text-violet-400/60" />
          ) : (
            <Film className="w-8 h-8 text-fuchsia-400/60" />
          )}
        </div>
        <h3 className="text-base font-bold text-zinc-200">
          {mode === 'image'
            ? 'Image Prompt Laboratory'
            : mode === 'motion'
            ? 'Motion Transfer Laboratory'
            : 'Video Prompt Laboratory'}
        </h3>
        <p className="text-xs text-zinc-400 max-w-sm mt-1.5 leading-relaxed">
          {mode === 'image'
            ? 'Upload your model and fashion references, describe what you want, and let the Prompt Hub engineer the rest.'
            : mode === 'motion'
            ? 'Extract skeletal motion choreography and map it onto your AI influencer with custom wardrobe and environment into a Veo 3.1 Master Prompt.'
            : 'Upload your final image and describe the movement, emotion, and choreography you want to create.'}
        </p>
        <div className="mt-6 flex items-center gap-2 text-[11px] text-zinc-400 bg-zinc-950/60 px-3 py-1.5 rounded-full border border-zinc-800/80">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Generates ready-to-use prompts for Imagen, ChatGPT, Kling & Veo</span>
        </div>
      </div>
    );
  }

  const scoreColor =
    response.quality_score >= 90
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
      : response.quality_score >= 75
      ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30'
      : 'text-amber-400 bg-amber-500/10 border-amber-500/30';

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-zinc-900/70 shadow-2xl shadow-indigo-500/5 overflow-hidden transition-all flex flex-col h-full">
      {/* Card Header */}
      <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-zinc-950/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-fuchsia-500/20 text-indigo-300 border border-indigo-500/30">
            {mode === 'image' ? (
              <ImageIcon className="w-4 h-4" />
            ) : mode === 'motion' ? (
              <Scan className="w-4 h-4 text-violet-300" />
            ) : (
              <Film className="w-4 h-4" />
            )}
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-100">
              {mode === 'image'
                ? 'Generated Image Prompt'
                : mode === 'motion'
                ? 'Veo 3.1 / Kling Master Prompt'
                : 'Generated Video Prompt'}
            </h3>
            <p className="text-xs text-zinc-400">
              Copy and paste directly into downstream generation tools
            </p>
          </div>
        </div>

        {/* Quality Score Meter */}
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${scoreColor}`}
            title="Internal prompt engineering completeness & fidelity score"
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>Quality Score: {response.quality_score} / 100</span>
          </div>
        </div>
      </div>

      {/* Analysis Summary Tag Bar */}
      {response.analysis?.summary && (
        <div className="px-5 py-2.5 bg-indigo-950/20 border-b border-indigo-500/10 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <p className="text-xs text-indigo-200/90 leading-relaxed">
            <span className="font-semibold text-indigo-300">Optimized for:</span>{' '}
            {response.analysis.summary}
          </p>
        </div>
      )}

      {/* Prompt Editor Display */}
      <div className="p-5 flex-1 flex flex-col bg-zinc-950/90 space-y-4">
        <div className="relative flex-1 group">
          <div className="flex items-center justify-between pb-1.5 text-xs text-zinc-400 font-semibold">
            <span>Primary Visual Directive</span>
            <span className="text-[10px] text-zinc-500 font-mono">Unified Master Prompt</span>
          </div>
          <textarea
            readOnly
            value={response.prompt}
            rows={8}
            className="w-full p-4 bg-zinc-900/90 border border-zinc-800/90 rounded-xl text-sm sm:text-base font-mono text-zinc-100 focus:outline-none resize-none leading-relaxed selection:bg-indigo-500 selection:text-white"
          />
        </div>

        {/* Realism & Physics Anchors */}
        {response.physics_and_realism_anchors && response.physics_and_realism_anchors.length > 0 && (
          <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/70 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Human Realism & Motion Physics Anchors:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {response.physics_and_realism_anchors.map((anchor, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-emerald-950/30 text-emerald-300 border border-emerald-500/20"
                >
                  ✓ {anchor}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Auto Negative Prompt Box */}
        {response.negative_prompt && (
          <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Auto-Engineered Negative Prompt:</span>
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (!response.negative_prompt) return;
                  await navigator.clipboard.writeText(response.negative_prompt);
                  setCopiedNegative(true);
                  setTimeout(() => setCopiedNegative(false), 2000);
                }}
                className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 transition-colors flex items-center gap-1"
              >
                {copiedNegative ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied Negative!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Negative Only</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs font-mono text-zinc-400 line-clamp-2 leading-relaxed">
              {response.negative_prompt}
            </p>
          </div>
        )}

        {/* Tags */}
        {response.tags && response.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <Tag className="w-3 h-3 text-zinc-400" />
            {response.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-900 text-zinc-400 border border-zinc-800"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Primary Actions Bar */}
      <div className="p-4 sm:p-5 border-t border-zinc-800/80 bg-zinc-950/80 space-y-3">
        {/* Copy Button */}
        <button
          type="button"
          onClick={handleCopy}
          className={`w-full py-3 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-lg ${
            copied
              ? 'bg-emerald-600 text-white shadow-emerald-600/30'
              : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/25 active:scale-[0.99]'
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-white animate-scale" />
              <span>Prompt Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Master Prompt</span>
            </>
          )}
        </button>

        {/* Prompt Laboratory Refinement Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {/* Regenerate */}
          <button
            type="button"
            onClick={() => onModify('regenerate')}
            disabled={isModifying || isLoading}
            className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            title="Produce a fresh creative alternative"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isModifying && activeAction === 'regenerate' ? 'animate-spin' : ''
              }`}
            />
            <span>Regenerate</span>
          </button>

          {/* Improve */}
          <button
            type="button"
            onClick={() => onModify('improve')}
            disabled={isModifying || isLoading}
            className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-indigo-300 hover:text-indigo-200 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            title="Elevate visual realism and specificity"
          >
            <Sparkles
              className={`w-3.5 h-3.5 text-indigo-400 ${
                isModifying && activeAction === 'improve' ? 'animate-pulse' : ''
              }`}
            />
            <span>Improve</span>
          </button>

          {/* Shorten */}
          <button
            type="button"
            onClick={() => onModify('shorten')}
            disabled={isModifying || isLoading}
            className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            title="Condense into a concise prompt"
          >
            <Minimize2
              className={`w-3.5 h-3.5 ${
                isModifying && activeAction === 'shorten' ? 'animate-pulse' : ''
              }`}
            />
            <span>Shorten</span>
          </button>

          {/* Expand */}
          <button
            type="button"
            onClick={() => onModify('expand')}
            disabled={isModifying || isLoading}
            className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            title="Elaborate on lighting and textures"
          >
            <Maximize2
              className={`w-3.5 h-3.5 ${
                isModifying && activeAction === 'expand' ? 'animate-pulse' : ''
              }`}
            />
            <span>Expand</span>
          </button>

          {/* Start Over */}
          <button
            type="button"
            onClick={onStartOver}
            disabled={isModifying || isLoading}
            className="col-span-2 sm:col-span-1 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-rose-950/40 border border-zinc-800 hover:border-rose-700/50 text-xs font-semibold text-zinc-400 hover:text-rose-300 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            title="Reset workspace"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start Over</span>
          </button>
        </div>
      </div>
    </div>
  );
};
