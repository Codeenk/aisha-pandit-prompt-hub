'use client';

import React from 'react';
import { Sparkles, X, Lightbulb } from 'lucide-react';

interface CreativeDirectionInputProps {
  value: string;
  onChange: (val: string) => void;
  mode: 'image' | 'video';
  hasError?: boolean;
  errorMessage?: string;
}

const IMAGE_INSPIRATIONS = [
  'Wearing this silk dress in a sunlit architectural garden during golden hour, natural and elegant, subtle poised smile.',
  'Editorial luxury lookbook for a high-fashion campaign, studio softbox lighting, clean background, confident relaxed pose.',
  'Walking along an Italian villa terrace at sunset, gentle breeze swaying the fabric, shallow depth of field.',
];

const VIDEO_INSPIRATIONS = [
  'Showroom wardrobe presentation: holding a smartphone naturally while turning smoothly to display the dress silhouette with graceful poise.',
  'Walking gracefully towards camera in slow motion through a modern boutique, glancing with an elegant, candid smile.',
  'Adjusting sunglasses, spinning gently once to display the outfit drape, natural fashion editorial movement.',
];

export const CreativeDirectionInput: React.FC<CreativeDirectionInputProps> = ({
  value,
  onChange,
  mode,
  hasError,
  errorMessage,
}) => {
  const inspirations = mode === 'image' ? IMAGE_INSPIRATIONS : VIDEO_INSPIRATIONS;

  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        hasError
          ? 'border-rose-500/60 bg-rose-950/10'
          : 'border-zinc-800/80 bg-zinc-900/40 focus-within:border-indigo-500/80 focus-within:bg-zinc-900/60'
      }`}
    >
      {/* Header */}
      <div className="p-4 sm:p-4.5 border-b border-zinc-800/60 bg-zinc-950/40 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-zinc-100">Creative Direction</h4>
            <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30">
              Required
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            {mode === 'image'
              ? "Describe what you have in mind — even if it's vague. Don't worry about prompt engineering."
              : 'Describe the action, movement, emotion, and pacing you want to see.'}
          </p>
        </div>

        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            title="Clear text"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Textarea */}
      <div className="p-4">
        <textarea
          rows={4}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={
            mode === 'image'
              ? 'e.g. I want Aisha wearing this emerald dress standing on a luxury sunlit terrace, smiling slightly. Make it feel like a high-end Vogue shoot.'
              : 'e.g. I want her to do a mirror selfie fit check with an iPhone in her hand, showing the dress from different angles, smiling and looking happy.'
          }
          className="w-full bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none resize-none leading-relaxed"
        />

        {/* Quick Inspiration Chips */}
        <div className="mt-3 pt-3 border-t border-zinc-800/60">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 mb-2">
            <Lightbulb className="w-3 h-3 text-amber-400" />
            <span>Creative Starters:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {inspirations.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onChange(chip)}
                className="text-left text-[11px] px-2.5 py-1 rounded-lg bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors line-clamp-1 max-w-full"
              >
                <Sparkles className="w-2.5 h-2.5 inline mr-1 text-indigo-400" />
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Error message */}
        {hasError && errorMessage && (
          <p className="mt-2 text-xs text-rose-400">{errorMessage}</p>
        )}
      </div>
    </div>
  );
};
