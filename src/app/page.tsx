'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { StudioMode, PromptEngineResponse, HistoryItem } from '@/types/prompt';
import { Header } from '@/components/navigation/Header';
import { SettingsModal } from '@/components/navigation/SettingsModal';
import { ImagePromptWorkspace } from '@/components/studio/ImagePromptWorkspace';
import { VideoPromptWorkspace } from '@/components/studio/VideoPromptWorkspace';
import { MotionTransferWorkspace } from '@/components/studio/MotionTransferWorkspace';
import { PromptHistoryDrawer } from '@/components/history/PromptHistoryDrawer';
import {
  loadHistory,
  savePromptToHistory,
  deleteHistoryItem,
  clearAllHistory,
} from '@/lib/storage/history-store';
import { Sparkles, Info, ArrowRight } from 'lucide-react';

export default function PromptHubPage() {
  const [mode, setMode] = useState<StudioMode>('image');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Active Outputs for each mode
  const [imagePromptResponse, setImagePromptResponse] =
    useState<PromptEngineResponse | null>(null);
  const [videoPromptResponse, setVideoPromptResponse] =
    useState<PromptEngineResponse | null>(null);
  const [motionPromptResponse, setMotionPromptResponse] =
    useState<PromptEngineResponse | null>(null);

  // API Status State
  const [apiStatus, setApiStatus] = useState({
    configured: false,
    hasServerKey: false,
    hasCustomKey: false,
    model: 'gemma-4-26b-a4b-it',
  });

  // Fetch API status on mount & settings change
  const refreshApiStatus = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      if (typeof window !== 'undefined') {
        const customKey = localStorage.getItem('aisha_custom_gemini_key');
        const customModel = localStorage.getItem('aisha_custom_gemini_model');
        if (customKey) headers['x-gemini-api-key'] = customKey;
        if (customModel) headers['x-gemini-model'] = customModel;
      }

      const res = await fetch('/api/status', { headers });
      if (res.ok) {
        const data = await res.json();
        setApiStatus({
          configured: data.configured,
          hasServerKey: data.hasServerKey,
          hasCustomKey: data.hasCustomKey,
          model: data.model || 'gemma-4-26b-a4b-it',
        });
      }
    } catch (err) {
      console.warn('Failed to fetch API status:', err);
    }
  }, []);

  useEffect(() => {
    setHistory(loadHistory());
    refreshApiStatus();
  }, [refreshApiStatus]);

  // Handler when a new prompt is generated
  const handlePromptGenerated = (
    response: PromptEngineResponse,
    creativeDirection: string,
    thumbnail?: string
  ) => {
    const updated = savePromptToHistory(mode, response, creativeDirection, thumbnail);
    setHistory(updated);
  };

  // Handler when a prompt is loaded from history
  const handleSelectFromHistory = (item: HistoryItem) => {
    setMode(item.mode);
    const restoredResponse: PromptEngineResponse = {
      prompt: item.prompt,
      quality_score: item.quality_score,
      analysis: {
        summary: item.summary,
      },
      tags: item.tags,
    };

    if (item.mode === 'image') {
      setImagePromptResponse(restoredResponse);
    } else if (item.mode === 'video') {
      setVideoPromptResponse(restoredResponse);
    } else {
      setMotionPromptResponse(restoredResponse);
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = deleteHistoryItem(id);
    setHistory(updated);
  };

  const handleClearHistory = () => {
    clearAllHistory();
    setHistory([]);
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 ${
        mode === 'image'
          ? 'studio-glow-image'
          : mode === 'motion'
          ? 'studio-glow-motion'
          : 'studio-glow-video'
      }`}
    >
      {/* Top Navigation */}
      <Header
        mode={mode}
        onModeChange={setMode}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        historyCount={history.length}
        apiStatus={apiStatus}
      />

      {/* Main Studio Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Banner Explainer Bar */}
        <div className="mb-6 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Info className="w-4 h-4" />
            </div>
            <p className="text-zinc-300">
              <span className="font-semibold text-zinc-100">AI Prompt Engineering Lab:</span>{' '}
              {mode === 'motion'
                ? 'Motion Transfer mode — Extract skeletal motion from any video and fuse it with your AI influencer, custom wardrobe, and environment into a Veo 3.1 Master Prompt.'
                : 'This platform designs structured prompts for external generators (ChatGPT Images, Gemini Imagen, & Gemini Veo).'}
            </p>
          </div>

          {!apiStatus.configured && (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-500/30 font-semibold transition-colors"
            >
              <span>Setup API Key</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Studio Workspace */}
        {mode === 'image' ? (
          <ImagePromptWorkspace
            onPromptGenerated={handlePromptGenerated}
            activePromptResponse={imagePromptResponse}
            setActivePromptResponse={setImagePromptResponse}
          />
        ) : mode === 'motion' ? (
          <MotionTransferWorkspace
            onPromptGenerated={handlePromptGenerated}
            activePromptResponse={motionPromptResponse}
            setActivePromptResponse={setMotionPromptResponse}
          />
        ) : (
          <VideoPromptWorkspace
            onPromptGenerated={handlePromptGenerated}
            activePromptResponse={videoPromptResponse}
            setActivePromptResponse={setVideoPromptResponse}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-medium text-zinc-400">
              Aisha Pandit Prompt Hub &mdash; Multimodal AI Visual Engineering
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-zinc-300 transition-colors"
            >
              Model: <span className="font-mono text-zinc-400">{apiStatus.model}</span>
            </button>
            <span>&bull;</span>
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="hover:text-zinc-300 transition-colors"
            >
              History ({history.length})
            </button>
          </div>
        </div>
      </footer>

      {/* History Slide-Over Drawer */}
      <PromptHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectPrompt={handleSelectFromHistory}
        onDeleteItem={handleDeleteHistoryItem}
        onClearAll={handleClearHistory}
      />

      {/* Settings & API Key Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiStatus={apiStatus}
        onSettingsSaved={refreshApiStatus}
      />
    </div>
  );
}
