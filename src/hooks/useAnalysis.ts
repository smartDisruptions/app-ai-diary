'use client';

import { useCallback, useRef, useState } from 'react';
import type { Entry } from '@/types';
import { getProfile, saveProfile } from '@/lib/storage/profile';
import { getSettings } from '@/lib/storage/settings';
import { analyzeEntry, fullRecompute } from '@/lib/ai/analysis';
import { getEntries } from '@/lib/storage/entries';

export function useAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerAnalysis = useCallback((entry: Entry) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      const settings = getSettings();
      if (!settings.apiKey) return;

      setAnalyzing(true);
      setError(null);

      try {
        const profile = getProfile();
        const updated = await analyzeEntry(profile, entry, settings);
        saveProfile(updated);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Profile analysis failed');
      } finally {
        setAnalyzing(false);
      }
    }, 5000);
  }, []);

  const triggerFullRecompute = useCallback(async () => {
    const settings = getSettings();
    if (!settings.apiKey) return;

    setAnalyzing(true);
    setError(null);

    try {
      const entries = getEntries();
      const updated = await fullRecompute(entries, settings);
      saveProfile(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Full recompute failed');
    } finally {
      setAnalyzing(false);
    }
  }, []);

  return { analyzing, error, triggerAnalysis, triggerFullRecompute };
}
