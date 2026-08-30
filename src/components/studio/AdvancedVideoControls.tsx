'use client';

import React, { useState } from 'react';
import {
  VideoControls,
  DurationOption,
  CameraMovementOption,
  MotionStyleOption,
  PacingOption,
} from '@/types/prompt';
import {
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Clock,
  Video,
  Activity,
  Zap,
} from 'lucide-react';

interface AdvancedVideoControlsProps {
  controls: VideoControls;
  onChange: (controls: VideoControls) => void;
}

export const AdvancedVideoControls: React.FC<AdvancedVideoControlsProps> = ({
  controls,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleReset = () => {
    onChange({
      duration: 'Auto',
      cameraMovement: 'Auto',
      motionStyle: 'Auto',
      pacing: 'Auto',
    });
  };

  const isModified =
    controls.duration !== 'Auto' ||
    controls.cameraMovement !== 'Auto' ||
    controls.motionStyle !== 'Auto' ||
    controls.pacing !== 'Auto';

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden transition-all">
      {/* Accordion Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 sm:p-4.5 bg-zinc-950/40 hover:bg-zinc-950/70 flex items-center justify-between transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-zinc-800 text-fuchsia-400">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-zinc-100">Advanced Video Controls</h4>
              {isModified && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              Optional duration, camera trajectory, motion aesthetic, and pacing overrides
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isModified && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                handleReset();
              }}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              title="Reset to Defaults"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-zinc-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          )}
        </div>
      </button>

      {/* Accordion Body */}
      {isOpen && (
        <div className="p-5 border-t border-zinc-800/60 space-y-4 bg-zinc-950/20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Duration */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-fuchsia-400" />
                Target Duration
              </label>
              <select
                value={controls.duration}
                onChange={(e) =>
                  onChange({ ...controls, duration: e.target.value as DurationOption })
                }
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-fuchsia-500 font-medium"
              >
                <option value="Auto">Auto (Optimal for scene)</option>
                <option value="5 seconds">5 seconds</option>
                <option value="8 seconds">8 seconds</option>
                <option value="10 seconds">10 seconds</option>
                <option value="User specified">User specified</option>
              </select>
              {controls.duration === 'User specified' && (
                <input
                  type="text"
                  value={controls.customDuration || ''}
                  onChange={(e) => onChange({ ...controls, customDuration: e.target.value })}
                  placeholder="e.g. 6-second seamless loop"
                  className="w-full mt-1.5 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500"
                />
              )}
            </div>

            {/* Camera Movement */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-indigo-400" />
                Camera Movement
              </label>
              <select
                value={controls.cameraMovement}
                onChange={(e) =>
                  onChange({
                    ...controls,
                    cameraMovement: e.target.value as CameraMovementOption,
                  })
                }
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-fuchsia-500 font-medium"
              >
                <option value="Auto">Auto (Inferred by AI)</option>
                <option value="Static">Static tripod / lock-off</option>
                <option value="Slow push-in">Slow push-in / dolly zoom</option>
                <option value="Pull-back">Pull-back reveal</option>
                <option value="Pan">Pan (horizontal)</option>
                <option value="Tilt">Tilt (vertical)</option>
                <option value="Handheld">Organic handheld micro-drift</option>
                <option value="Tracking">Tracking follow shot</option>
                <option value="User specified">User specified</option>
              </select>
              {controls.cameraMovement === 'User specified' && (
                <input
                  type="text"
                  value={controls.customCameraMovement || ''}
                  onChange={(e) =>
                    onChange({ ...controls, customCameraMovement: e.target.value })
                  }
                  placeholder="e.g. 180-degree orbital sweep"
                  className="w-full mt-1.5 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500"
                />
              )}
            </div>

            {/* Motion Style */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-violet-400" />
                Motion Style
              </label>
              <select
                value={controls.motionStyle}
                onChange={(e) =>
                  onChange({ ...controls, motionStyle: e.target.value as MotionStyleOption })
                }
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-fuchsia-500 font-medium"
              >
                <option value="Auto">Auto (Inferred by AI)</option>
                <option value="Natural">Natural & organic</option>
                <option value="Cinematic">Cinematic 24fps fluid</option>
                <option value="Social media">Social media / TikTok / Reel</option>
                <option value="Fashion">Fashion runway / lookbook</option>
                <option value="Energetic">Energetic & snappy</option>
                <option value="Slow / elegant">Slow / elegant grace</option>
              </select>
            </div>

            {/* Pacing */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Pacing & Rhythm
              </label>
              <select
                value={controls.pacing}
                onChange={(e) =>
                  onChange({ ...controls, pacing: e.target.value as PacingOption })
                }
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-fuchsia-500 font-medium"
              >
                <option value="Auto">Auto</option>
                <option value="Natural">Natural cadence</option>
                <option value="Slow">Slow motion / deliberate</option>
                <option value="Energetic">Brisk & dynamic</option>
              </select>
            </div>

            {/* Target Video Model & Anti-Refusal Tuning */}
            <div className="space-y-1.5 sm:col-span-2 pt-2 border-t border-zinc-800/50">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
                Target Video Model & Policy Tuning
              </label>
              <select
                value={controls.targetEngine || 'Auto'}
                onChange={(e) =>
                  onChange({
                    ...controls,
                    targetEngine: e.target.value as typeof controls.targetEngine,
                  })
                }
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-fuchsia-500 font-medium"
              >
                <option value="Auto">Auto (Balanced Cinematic & Physics)</option>
                <option value="Google Veo (Structured Cinematic)">Google Veo (Structured Render & Lighting Data)</option>
                <option value="Kling AI (Character & Physics)">Kling AI (Natural Human Motion & Fabric)</option>
                <option value="Runway Gen-3 (Kinetic Camera)">Runway Gen-3 (Explicit Camera & Kinetic Control)</option>
                <option value="ChatGPT / Sora (Strict Anti-Refusal)">ChatGPT / Sora (Strict Anti-Refusal Commercial Framing)</option>
              </select>
              <p className="text-[11px] text-zinc-500">
                Optimizes phrasing for downstream safety filters to prevent &quot;I can&apos;t make videos of real people&quot; refusals.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
