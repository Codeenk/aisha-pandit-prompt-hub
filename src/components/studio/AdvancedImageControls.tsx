'use client';

import React, { useState } from 'react';
import {
  ImageControls,
  CompositionOption,
  CameraOption,
  LightingOption,
  AspectRatioOption,
  VisualStyleOption,
} from '@/types/prompt';
import {
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  Camera,
  Sun,
  Maximize,
  Palette,
  Layout,
} from 'lucide-react';

interface AdvancedImageControlsProps {
  controls: ImageControls;
  onChange: (controls: ImageControls) => void;
}

export const AdvancedImageControls: React.FC<AdvancedImageControlsProps> = ({
  controls,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleReset = () => {
    onChange({
      composition: 'Auto',
      camera: 'Auto',
      lighting: 'Auto',
      aspectRatio: 'Auto',
      visualStyle: 'Photorealistic',
    });
  };

  const isModified =
    controls.composition !== 'Auto' ||
    controls.camera !== 'Auto' ||
    controls.lighting !== 'Auto' ||
    controls.aspectRatio !== 'Auto' ||
    controls.visualStyle !== 'Photorealistic';

  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden transition-all">
      {/* Accordion Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 sm:p-4.5 bg-zinc-950/40 hover:bg-zinc-950/70 flex items-center justify-between transition-colors text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-zinc-800 text-indigo-400">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-zinc-100">Advanced Creative Controls</h4>
              {isModified && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              Optional camera, lighting, framing, and aspect ratio overrides
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
            {/* Composition */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Layout className="w-3.5 h-3.5 text-indigo-400" />
                Composition
              </label>
              <select
                value={controls.composition}
                onChange={(e) =>
                  onChange({ ...controls, composition: e.target.value as CompositionOption })
                }
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="Auto">Auto (Inferred by AI)</option>
                <option value="Close-up">Close-up</option>
                <option value="Medium shot">Medium shot</option>
                <option value="Full body">Full body</option>
                <option value="Wide shot">Wide shot</option>
                <option value="Editorial composition">Editorial composition</option>
                <option value="User specified">User specified</option>
              </select>
              {controls.composition === 'User specified' && (
                <input
                  type="text"
                  value={controls.customComposition || ''}
                  onChange={(e) =>
                    onChange({ ...controls, customComposition: e.target.value })
                  }
                  placeholder="e.g. low-angle dutch tilt three-quarter framing"
                  className="w-full mt-1.5 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500"
                />
              )}
            </div>

            {/* Camera */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-violet-400" />
                Camera Type
              </label>
              <select
                value={controls.camera}
                onChange={(e) =>
                  onChange({ ...controls, camera: e.target.value as CameraOption })
                }
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="Auto">Auto (Inferred by AI)</option>
                <option value="Smartphone">Smartphone (Natural iPhone Look)</option>
                <option value="DSLR">DSLR</option>
                <option value="Mirrorless">Mirrorless</option>
                <option value="Cinematic">Cinematic 35mm / Anamorphic</option>
                <option value="Fashion editorial">Fashion editorial 85mm</option>
                <option value="User specified">User specified</option>
              </select>
              {controls.camera === 'User specified' && (
                <input
                  type="text"
                  value={controls.customCamera || ''}
                  onChange={(e) => onChange({ ...controls, customCamera: e.target.value })}
                  placeholder="e.g. Hasselblad H6D-100c medium format"
                  className="w-full mt-1.5 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500"
                />
              )}
            </div>

            {/* Lighting */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                Lighting
              </label>
              <select
                value={controls.lighting}
                onChange={(e) =>
                  onChange({ ...controls, lighting: e.target.value as LightingOption })
                }
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="Auto">Auto (Inferred by AI)</option>
                <option value="Natural">Natural daylight</option>
                <option value="Golden hour">Golden hour sunset</option>
                <option value="Soft studio">Soft studio / Profoto softbox</option>
                <option value="Hard sunlight">Hard direct sunlight</option>
                <option value="Overcast">Overcast / Diffused soft light</option>
                <option value="Night">Night / Moody ambient</option>
                <option value="User specified">User specified</option>
              </select>
              {controls.lighting === 'User specified' && (
                <input
                  type="text"
                  value={controls.customLighting || ''}
                  onChange={(e) => onChange({ ...controls, customLighting: e.target.value })}
                  placeholder="e.g. dramatic Rembrandt rim lighting"
                  className="w-full mt-1.5 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-200 placeholder-zinc-500"
                />
              )}
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Maximize className="w-3.5 h-3.5 text-emerald-400" />
                Aspect Ratio
              </label>
              <select
                value={controls.aspectRatio}
                onChange={(e) =>
                  onChange({ ...controls, aspectRatio: e.target.value as AspectRatioOption })
                }
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="Auto">Auto</option>
                <option value="1:1">1:1 (Square)</option>
                <option value="4:5">4:5 (Instagram Portrait)</option>
                <option value="3:4">3:4 (Standard Portrait)</option>
                <option value="9:16">9:16 (Stories / Reels / Mobile)</option>
                <option value="16:9">16:9 (Cinematic Landscape)</option>
              </select>
            </div>

            {/* Visual Style */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-fuchsia-400" />
                Visual Style
              </label>
              <select
                value={controls.visualStyle}
                onChange={(e) =>
                  onChange({ ...controls, visualStyle: e.target.value as VisualStyleOption })
                }
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 focus:outline-none focus:border-indigo-500 font-medium"
              >
                <option value="Photorealistic">Photorealistic (Natural & Authentic)</option>
                <option value="Fashion editorial">Fashion Editorial (High-fashion Magazine)</option>
                <option value="Luxury campaign">Luxury Campaign (Gucci / Chanel aesthetic)</option>
                <option value="Social media">Social Media Influencer (Candid iPhone)</option>
                <option value="Cinematic">Cinematic Film Still (Movie lighting & grade)</option>
                <option value="Lifestyle photography">Lifestyle Photography (Warm & organic)</option>
                <option value="Auto">Auto (Inferred by AI)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
