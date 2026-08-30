import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadHistory,
  savePromptToHistory,
  clearAllHistory,
} from '../src/lib/storage/history-store';
import { PromptEngineResponse } from '../src/types/prompt';

describe('History Store & Quota Management', () => {
  let store: Record<string, string> = {};

  beforeEach(() => {
    store = {};
    const mockLocalStorage = {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };

    Object.defineProperty(globalThis, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });
  });

  it('should save prompt and retrieve it from history', () => {
    const mockResponse: PromptEngineResponse = {
      prompt: 'Aisha in emerald gown with natural skin realism...',
      negative_prompt: 'plastic skin, bad anatomy',
      physics_and_realism_anchors: ['Subsurface scattering', 'Fabric gravity drape'],
      quality_score: 96,
      analysis: {
        summary: 'Micro-skin realism',
      },
      tags: ['Editorial'],
    };

    const history = savePromptToHistory(
      'image',
      mockResponse,
      'Aisha in emerald dress'
    );

    expect(history.length).toBe(1);
    expect(history[0].prompt).toBe(mockResponse.prompt);
    expect(history[0].quality_score).toBe(96);
  });

  it('should ignore massive base64 thumbnails exceeding safe size', () => {
    const mockResponse: PromptEngineResponse = {
      prompt: 'Prompt test',
      quality_score: 90,
      analysis: {},
    };

    const massiveThumbnail = 'data:image/jpeg;base64,' + 'A'.repeat(50000); // 50KB

    const history = savePromptToHistory(
      'video',
      mockResponse,
      'Video test',
      massiveThumbnail
    );

    expect(history[0].thumbnail).toBeUndefined();
  });
});
