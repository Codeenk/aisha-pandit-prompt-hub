import { HistoryItem, PromptEngineResponse, StudioMode } from '@/types/prompt';

const STORAGE_KEY = 'aisha_pandit_prompt_history_v1';
const MAX_HISTORY_ITEMS = 30;

export function loadHistory(): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Failed to load history from localStorage:', err);
    return [];
  }
}

/**
 * Safely store history with multi-tier quota management
 */
function safeSetStorage(items: HistoryItem[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch (err: unknown) {
    console.warn('Quota exceeded on standard write, applying storage compaction...', err);

    // Tier 1: Strip all thumbnails from items
    try {
      const stripped = items.map((item) => ({ ...item, thumbnail: undefined }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stripped));
      return true;
    } catch {
      // Tier 2: Keep only top 10 newest items without thumbnails
      try {
        const reduced = items
          .slice(0, 10)
          .map((item) => ({ ...item, thumbnail: undefined }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reduced));
        return true;
      } catch {
        // Tier 3: Keep only top 3 items
        try {
          const minimal = items
            .slice(0, 3)
            .map((item) => ({ ...item, thumbnail: undefined }));
          localStorage.setItem(STORAGE_KEY, JSON.stringify(minimal));
          return true;
        } catch (finalErr) {
          console.error('Critical localStorage quota exhaustion:', finalErr);
          return false;
        }
      }
    }
  }
}

export function savePromptToHistory(
  mode: StudioMode,
  response: PromptEngineResponse,
  creativeDirection: string,
  thumbnail?: string
): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = loadHistory();

    // Sanitize thumbnail: only allow if it's very small (< 15KB)
    let sanitizedThumb: string | undefined = undefined;
    if (thumbnail && thumbnail.length < 15000) {
      sanitizedThumb = thumbnail;
    }

    const newItem: HistoryItem = {
      id: crypto.randomUUID ? crypto.randomUUID() : `item-${Date.now()}-${Math.random().toString(36).substring(2)}`,
      mode,
      prompt: response.prompt,
      quality_score: response.quality_score,
      timestamp: Date.now(),
      creativeDirection,
      summary: response.analysis?.summary,
      tags: response.tags,
      thumbnail: sanitizedThumb,
    };

    const updated = [newItem, ...current].slice(0, MAX_HISTORY_ITEMS);
    safeSetStorage(updated);
    return updated;
  } catch (err) {
    console.warn('Could not persist prompt to history:', err);
    return loadHistory();
  }
}

export function deleteHistoryItem(id: string): HistoryItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const current = loadHistory();
    const updated = current.filter((item) => item.id !== id);
    safeSetStorage(updated);
    return updated;
  } catch (err) {
    console.warn('Failed to delete history item:', err);
    return loadHistory();
  }
}

export function clearAllHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Failed to clear history:', err);
  }
}

