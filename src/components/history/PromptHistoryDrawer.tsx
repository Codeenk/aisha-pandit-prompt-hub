'use client';

import React, { useState } from 'react';
import { HistoryItem, StudioMode } from '@/types/prompt';
import {
  X,
  History,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Image as ImageIcon,
  Film,
  Search,
  Gauge,
  Sparkles,
} from 'lucide-react';

interface PromptHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectPrompt: (item: HistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export const PromptHistoryDrawer: React.FC<PromptHistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectPrompt,
  onDeleteItem,
  onClearAll,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'image' | 'video'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) => {
    if (filterMode !== 'all' && item.mode !== filterMode) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inPrompt = item.prompt.toLowerCase().includes(q);
      const inCreative = item.creativeDirection.toLowerCase().includes(q);
      const inSummary = item.summary?.toLowerCase().includes(q) || false;
      return inPrompt || inCreative || inSummary;
    }
    return true;
  });

  const handleCopy = async (e: React.MouseEvent, item: HistoryItem) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(item.prompt);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-zinc-900 border-l border-zinc-800 shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="px-6 py-4.5 border-b border-zinc-800 bg-zinc-950/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-100">Prompt History</h3>
                <p className="text-xs text-zinc-400">Locally saved prompts & recipes</p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close prompt history"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Bar & Search */}
          <div className="p-4 border-b border-zinc-800 space-y-3 bg-zinc-950/30">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search history..."
                className="w-full pl-9 pr-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-medium"
              />
            </div>

            {/* Mode Filter Tabs */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                {(['all', 'image', 'video'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setFilterMode(m)}
                    className={`px-3 py-1 rounded-md text-[11px] font-semibold capitalize transition-colors ${
                      filterMode === m
                        ? 'bg-zinc-800 text-white'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {history.length > 0 && (
                <button
                  type="button"
                  onClick={onClearAll}
                  className="text-[11px] font-medium text-rose-400 hover:text-rose-300 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredHistory.length === 0 ? (
              <div className="py-16 text-center text-zinc-500 flex flex-col items-center">
                <Sparkles className="w-8 h-8 mb-2 text-zinc-600" />
                <p className="text-sm font-semibold">No prompts found</p>
                <p className="text-xs text-zinc-400 mt-1">
                  Generated prompts will automatically appear here.
                </p>
              </div>
            ) : (
              filteredHistory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectPrompt(item);
                    onClose();
                  }}
                  className="group relative p-4 rounded-xl border border-zinc-800/80 bg-zinc-950/40 hover:bg-zinc-950/90 hover:border-zinc-700 transition-all cursor-pointer space-y-2.5"
                >
                  {/* Item Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`p-1 rounded-md text-xs font-bold flex items-center gap-1 ${
                          item.mode === 'image'
                            ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
                            : 'bg-fuchsia-500/15 text-fuchsia-400 border border-fuchsia-500/20'
                        }`}
                      >
                        {item.mode === 'image' ? (
                          <ImageIcon className="w-3 h-3" />
                        ) : (
                          <Film className="w-3 h-3" />
                        )}
                        <span className="capitalize text-[10px]">{item.mode}</span>
                      </span>

                      <span className="text-[10px] text-zinc-400 font-mono">
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                        <Gauge className="w-2.5 h-2.5" />
                        <span>{item.quality_score}</span>
                      </div>
                    </div>
                  </div>

                  {/* Creative Snippet */}
                  <p className="text-xs text-zinc-300 font-medium line-clamp-2">
                    &ldquo;{item.creativeDirection}&rdquo;
                  </p>

                  {/* Prompt Snippet */}
                  <div className="p-2 rounded-lg bg-zinc-900/90 border border-zinc-800 text-[11px] font-mono text-zinc-400 line-clamp-3 leading-relaxed">
                    {item.prompt}
                  </div>

                  {/* Card Actions Footer */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-indigo-400 group-hover:underline flex items-center gap-1 font-semibold">
                      Load into Editor <ExternalLink className="w-2.5 h-2.5" />
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleCopy(e, item)}
                        className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors"
                        title="Copy prompt"
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteItem(item.id);
                        }}
                        className="p-1.5 rounded-lg bg-zinc-900 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-300 border border-zinc-800 transition-colors"
                        title="Delete from history"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
