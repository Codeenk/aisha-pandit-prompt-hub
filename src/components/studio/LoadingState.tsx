'use client';

import React, { useState, useEffect } from 'react';
import { StudioMode } from '@/types/prompt';
import { Sparkles, Scan, BrainCircuit, Wand2 } from 'lucide-react';

interface LoadingStateProps {
  mode: StudioMode;
}

const IMAGE_STEPS = [
  { icon: Scan, text: 'Analyzing visual reference images...' },
  { icon: BrainCircuit, text: 'Structuring identity, garment & lighting direction...' },
  { icon: Wand2, text: 'Engineering downstream photorealistic prompt...' },
];

const VIDEO_STEPS = [
  { icon: Scan, text: 'Analyzing source image anchor...' },
  { icon: BrainCircuit, text: 'Structuring temporal motion & camera choreography...' },
  { icon: Wand2, text: 'Engineering downstream video prompt...' },
];

export const LoadingState: React.FC<LoadingStateProps> = ({ mode }) => {
  const steps = mode === 'image' ? IMAGE_STEPS : VIDEO_STEPS;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="h-full rounded-2xl border border-indigo-500/30 bg-zinc-900/60 p-8 flex flex-col items-center justify-center text-center min-h-[420px] shadow-xl relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-fuchsia-500/5 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-sm">
        {/* Animated Spinner with Sparkle */}
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-fuchsia-600 p-[2px] animate-spin">
            <div className="w-full h-full bg-zinc-950 rounded-[14px]" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-indigo-400 animate-pulse" />
          </div>
        </div>

        <h3 className="text-base font-bold text-zinc-100">
          Engineering {mode === 'image' ? 'Image' : 'Video'} Prompt
        </h3>
        <p className="text-xs text-zinc-400 mt-1">
          Reasoning over references and creative directives...
        </p>

        {/* Step Progress Indicators */}
        <div className="w-full mt-6 space-y-2.5">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs transition-all duration-300 ${
                  isCurrent
                    ? 'bg-indigo-950/40 border-indigo-500/40 text-indigo-200 shadow-sm'
                    : isCompleted
                    ? 'bg-zinc-950/60 border-zinc-800 text-zinc-400'
                    : 'bg-zinc-950/20 border-zinc-900 text-zinc-600'
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg ${
                    isCurrent
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : isCompleted
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-zinc-900 text-zinc-600'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'animate-pulse' : ''}`} />
                </div>
                <span className="font-medium text-left truncate">{step.text}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
