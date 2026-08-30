'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiStatus: {
    configured: boolean;
    hasServerKey: boolean;
    hasCustomKey: boolean;
    model: string;
  };
  onSettingsSaved: () => void;
}

const PRESET_MODELS = [
  {
    id: 'gemma-4-26b-a4b-it',
    name: 'Gemma 4 26B A4B (Recommended)',
    desc: 'DeepMind 2026 Multimodal MoE, 3.8B active params, structured prompt reasoning',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    desc: 'High speed, multimodal intelligence, top visual fidelity',
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    desc: 'Ultra-fast multimodal vision & structured prompt reasoning',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    desc: 'Reliable low-latency multimodal reasoning',
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    desc: 'Deep contextual reasoning for complex visual prompts',
  },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  apiStatus,
  onSettingsSaved,
}) => {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemma-4-26b-a4b-it');
  const [customModelInput, setCustomModelInput] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('aisha_custom_gemini_key') || '';
      const savedModel = localStorage.getItem('aisha_custom_gemini_model') || apiStatus.model || 'gemma-4-26b-a4b-it';
      setApiKey(savedKey);
      
      const isPreset = PRESET_MODELS.some((m) => m.id === savedModel);
      if (isPreset) {
        setSelectedModel(savedModel);
      } else {
        setSelectedModel('custom');
        setCustomModelInput(savedModel);
      }
    }
  }, [isOpen, apiStatus.model]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      if (apiKey.trim()) {
        localStorage.setItem('aisha_custom_gemini_key', apiKey.trim());
      } else {
        localStorage.removeItem('aisha_custom_gemini_key');
      }

      const finalModel = selectedModel === 'custom' ? customModelInput.trim() : selectedModel;
      if (finalModel) {
        localStorage.setItem('aisha_custom_gemini_model', finalModel);
      }
    }
    onSettingsSaved();
    onClose();
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    const activeKey = apiKey.trim() || undefined;
    const finalModel = selectedModel === 'custom' ? customModelInput.trim() : selectedModel;

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (activeKey) headers['x-gemini-api-key'] = activeKey;
      if (finalModel) headers['x-gemini-model'] = finalModel;

      const res = await fetch('/api/status', {
        method: 'POST',
        headers,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: `Connected successfully with ${data.model}!`,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Connection failed. Please check your API key.',
        });
      }
    } catch (err: unknown) {
      const error = err as Error;
      setTestResult({
        success: false,
        message: error.message || 'Network error during connection test.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-100">LLM & Studio Settings</h3>
              <p className="text-xs text-zinc-400">Configure your Gemini / Gemma LLM API connection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings modal"
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Status Alert Banner */}
          <div
            className={`p-4 rounded-xl border flex items-start gap-3 ${
              apiStatus.configured
                ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-950/30 border-amber-500/30 text-amber-300'
            }`}
          >
            {apiStatus.configured ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            <div className="text-xs space-y-1">
              <p className="font-semibold text-sm">
                {apiStatus.configured
                  ? 'Gemini API is Ready'
                  : 'API Key Configuration Needed'}
              </p>
              <p className="text-zinc-400 leading-relaxed">
                {apiStatus.hasServerKey
                  ? 'Server-side key detected in environment variables (.env.local).'
                  : apiStatus.hasCustomKey
                  ? 'Custom API key saved in local browser storage.'
                  : 'You can configure your key in .env.local as GEMINI_API_KEY, or paste it below.'}
              </p>
            </div>
          </div>

          {/* Custom API Key Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="apiKeyInput" className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                Gemini API Key (Optional Override)
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
              >
                Get Key on Google AI Studio
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <input
              id="apiKeyInput"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={
                apiStatus.hasServerKey
                  ? '• • • • • • • • • • • • • • • • (Using server key from .env.local)'
                  : 'AIzaSy...'
              }
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono transition-all"
            />
            <p className="text-[11px] text-zinc-400">
              Keys entered here are securely stored in your browser session and sent via secure server-side headers.
            </p>
          </div>

          {/* Model Selector */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-violet-400" />
              Target LLM Model
            </label>
            <div className="space-y-2">
              {PRESET_MODELS.map((model) => (
                <label
                  key={model.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedModel === model.id
                      ? 'bg-indigo-950/30 border-indigo-500/50 shadow-sm shadow-indigo-500/10'
                      : 'bg-zinc-950/50 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="modelSelection"
                    checked={selectedModel === model.id}
                    onChange={() => setSelectedModel(model.id)}
                    className="mt-1 text-indigo-600 focus:ring-indigo-500 bg-zinc-900 border-zinc-700"
                  />
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">{model.name}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{model.desc}</p>
                  </div>
                </label>
              ))}

              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedModel === 'custom'
                    ? 'bg-indigo-950/30 border-indigo-500/50 shadow-sm'
                    : 'bg-zinc-950/50 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <input
                  type="radio"
                  name="modelSelection"
                  checked={selectedModel === 'custom'}
                  onChange={() => setSelectedModel('custom')}
                  className="mt-1 text-indigo-600 focus:ring-indigo-500 bg-zinc-900 border-zinc-700"
                />
                <div className="w-full">
                  <p className="text-xs font-semibold text-zinc-200">Custom Model Identifier</p>
                  {selectedModel === 'custom' && (
                    <input
                      type="text"
                      value={customModelInput}
                      onChange={(e) => setCustomModelInput(e.target.value)}
                      placeholder="e.g. gemma-4-26b-a4b-it or custom tuned model"
                      className="mt-2 w-full px-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Test Connection Button & Result */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="w-full py-2.5 px-4 rounded-xl border border-zinc-700 hover:border-zinc-600 bg-zinc-800 hover:bg-zinc-750 text-xs font-semibold text-zinc-200 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              {isTesting ? 'Testing Connection...' : 'Test API Connection'}
            </button>

            {testResult && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-950/40 text-rose-300 border border-rose-500/30'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span className="truncate">{testResult.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-800 bg-zinc-950/60">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
