'use client';

import React from 'react';
import { StudioMode } from '@/types/prompt';
import {
  Sparkles,
  Film,
  Image as ImageIcon,
  History,
  Settings,
  Circle,
  Scan,
} from 'lucide-react';

interface HeaderProps {
  mode: StudioMode;
  onModeChange: (mode: StudioMode) => void;
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  historyCount: number;
  apiStatus: {
    configured: boolean;
    hasServerKey: boolean;
    hasCustomKey: boolean;
    model: string;
  };
}

export const Header: React.FC<HeaderProps> = ({
  mode,
  onModeChange,
  onOpenHistory,
  onOpenSettings,
  historyCount,
  apiStatus,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-fuchsia-600 p-[1px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-zinc-950 rounded-[11px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-zinc-100">
                  Aisha Pandit
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  PROMPT HUB
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-zinc-400 hidden sm:block">
                Turn creative intent into production-ready image & video prompts
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 shadow-inner">
            <button
              onClick={() => onModeChange('image')}
              className={`flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                mode === 'image'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Image Prompt</span>
            </button>
            <button
              onClick={() => onModeChange('video')}
              className={`flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                mode === 'video'
                  ? 'bg-gradient-to-r from-fuchsia-600 to-indigo-600 text-white shadow-md shadow-fuchsia-600/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Video Prompt</span>
            </button>
            <button
              onClick={() => onModeChange('motion')}
              className={`flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${
                mode === 'motion'
                  ? 'bg-gradient-to-r from-violet-600 to-pink-600 text-white shadow-md shadow-violet-600/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
            >
              <Scan className="w-4 h-4" />
              <span className="hidden sm:inline">Motion Transfer</span>
              <span className="sm:hidden">Motion</span>
            </button>
          </div>

          {/* Right Action Bar (History, Status, Settings) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* API Status Indicator Badge */}
            <button
              onClick={onOpenSettings}
              title={`API Status: ${apiStatus.configured ? 'Ready' : 'Setup Key Required'} (${apiStatus.model})`}
              className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-900/80 border border-zinc-800 text-[11px] font-medium text-zinc-300 hover:border-zinc-700 transition-colors"
            >
              <Circle
                className={`w-2 h-2 fill-current ${
                  apiStatus.configured ? 'text-emerald-400 animate-pulse' : 'text-amber-400'
                }`}
              />
              <span className="font-mono text-zinc-400 text-[10px] max-w-[110px] truncate">
                {apiStatus.model}
              </span>
            </button>

            {/* Prompt History Button */}
            <button
              onClick={onOpenHistory}
              aria-label="Open prompt history"
              className="relative p-2 sm:px-3 sm:py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-medium"
            >
              <History className="w-4 h-4 text-zinc-400" />
              <span className="hidden sm:inline">History</span>
              {historyCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  {historyCount}
                </span>
              )}
            </button>

            {/* Settings Button */}
            <button
              onClick={onOpenSettings}
              aria-label="Open settings"
              className="p-2 sm:p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
