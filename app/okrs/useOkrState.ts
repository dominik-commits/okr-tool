'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { EMPTY_STATE, SEED_H2_2026_ID } from './constants';
import { seedH2_2026 } from './seed';
import { clone, migrateObjective, overallScore, todayISO } from './utils';
import { CycleId, OkrState } from './types';

function applySeeds(draft: OkrState): boolean {
  if (!draft.seeds) draft.seeds = [];
  if (draft.seeds.includes(SEED_H2_2026_ID)) return false;
  draft.objectives.c2026h2 = seedH2_2026();
  draft.seeds.push(SEED_H2_2026_ID);
  return true;
}

function migrateAllObjectives(draft: OkrState): void {
  (Object.keys(draft.objectives) as CycleId[]).forEach((cid) => {
    draft.objectives[cid] = (draft.objectives[cid] || []).map(migrateObjective);
  });
}

function recordHistory(draft: OkrState): void {
  const cid = draft.activeCycle;
  if (!draft.cycleHistory[cid]) draft.cycleHistory[cid] = [];
  const hist = draft.cycleHistory[cid];
  const score = overallScore(draft.objectives[cid] || []);
  const today = todayISO();
  const last = hist[hist.length - 1];
  if (last && last.date === today) {
    last.score = score;
  } else {
    hist.push({ date: today, score });
  }
  if (hist.length > 90) hist.splice(0, hist.length - 90);
}

/**
 * Shared load/save/mutate infrastructure for /api/okr-data, used by both the Cockpit and the
 * Objectives management page so edits made on either always land in the same place and the other
 * page sees them on its next load.
 */
export function useOkrState() {
  const [state, setState] = useState<OkrState>(EMPTY_STATE);
  const [status, setStatus] = useState('Lädt…');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loaded = useRef(false);

  const scheduleSave = useCallback((next: OkrState) => {
    setStatus('Speichert…');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/okr-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(next),
        });
        if (res.status === 401) {
          window.location.href = '/login';
          return;
        }
        setStatus(res.ok ? 'Gespeichert — geteilt mit allen' : 'Speichern fehlgeschlagen');
      } catch {
        setStatus('Speichern fehlgeschlagen (Verbindung prüfen)');
      }
    }, 300);
  }, []);

  const mutate = useCallback(
    (fn: (draft: OkrState) => void) => {
      setState((prev) => {
        const draft = clone(prev);
        fn(draft);
        recordHistory(draft);
        scheduleSave(draft);
        return draft;
      });
    },
    [scheduleSave]
  );

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    (async () => {
      try {
        const res = await fetch('/api/okr-data');
        if (res.status === 401) {
          window.location.href = '/login';
          return;
        }
        const data = await res.json();
        const draft = clone(EMPTY_STATE);
        if (data && data.value) {
          const parsed = data.value;
          draft.objectives = Object.assign({ c2026h2: [], c2027h1: [], c2027h2: [] }, parsed.objectives || {});
          draft.cycleHistory = Object.assign({ c2026h2: [], c2027h1: [], c2027h2: [] }, parsed.cycleHistory || {});
          draft.seeds = parsed.seeds || [];
          draft.activeCycle = parsed.activeCycle || 'c2026h2';
        }
        migrateAllObjectives(draft);
        const seeded = applySeeds(draft);
        setState(draft);
        if (seeded) scheduleSave(draft);
        setStatus('Gespeichert — geteilt mit allen');
      } catch {
        const draft = clone(EMPTY_STATE);
        applySeeds(draft);
        setState(draft);
        setStatus('Neu — noch nichts gespeichert');
      }
    })();
  }, [scheduleSave]);

  const setActiveCycle = useCallback(
    (id: CycleId) => {
      mutate((draft) => {
        draft.activeCycle = id;
      });
    },
    [mutate]
  );

  return { state, status, mutate, setActiveCycle };
}
