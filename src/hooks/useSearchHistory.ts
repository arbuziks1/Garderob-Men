import { useCallback, useState } from 'react';

const HISTORY_KEY = 'gm_search_history';
const MAX_HISTORY = 5;

function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: string[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    // ignore storage errors (private browsing, quota)
  }
}

interface SearchHistoryValue {
  history: string[];
  push: (query: string) => void;
  clear: () => void;
}

/** Persists the last 5 distinct search queries (most recent first, no duplicates — pushing
 *  an existing query moves it to the front) to localStorage. Each hook instance keeps its
 *  own React state copy, so callers that need to both read and write the history in sync
 *  should share a single instance rather than mounting the hook twice. */
export function useSearchHistory(): SearchHistoryValue {
  const [history, setHistory] = useState<string[]>(loadHistory);

  const push = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setHistory((prev) => {
      const next = [trimmed, ...prev.filter((q) => q.toLowerCase() !== trimmed.toLowerCase())].slice(
        0,
        MAX_HISTORY
      );
      saveHistory(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, []);

  return { history, push, clear };
}
