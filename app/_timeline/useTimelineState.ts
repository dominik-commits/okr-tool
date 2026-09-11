'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SEED_PROJECT_ID } from './constants';
import { TimelineData } from './types';
import { uid } from './utils';

const EMPTY_STATE: TimelineData = { vacations: [], seeds: [] };

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

/** Same seed-once marker/behavior as the original inline script — never re-seeds after the first run. */
function applySeeds(draft: TimelineData): boolean {
  if (!draft.seeds) draft.seeds = [];
  let changed = false;
  if (!draft.seeds.includes(SEED_PROJECT_ID)) {
    draft.vacations.push({ id: uid(), type: 'project', label: 'Indizes Bundling', start: '2026-09-28', end: '2026-10-07' });
    draft.seeds.push(SEED_PROJECT_ID);
    changed = true;
  }
  draft.vacations.forEach((v) => {
    if (v.label === 'Indizeswandel' || v.label === 'Wandel B' || v.label === 'Wandel Bundling') {
      v.label = 'Indizes Bundling';
      changed = true;
    }
  });
  return changed;
}

/**
 * Load/save infrastructure for /api/data (key "planungskompass-data") — unchanged endpoint and shape
 * from the original raw-HTML page, just consumed from React now.
 */
export function useTimelineState() {
  const [state, setState] = useState<TimelineData>(EMPTY_STATE);
  const [status, setStatus] = useState('Lädt…');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loaded = useRef(false);

  const scheduleSave = useCallback((next: TimelineData) => {
    setStatus('Speichert…');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        const res = await fetch('/api/data', {
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
    (fn: (draft: TimelineData) => void) => {
      setState((prev) => {
        const draft = clone(prev);
        fn(draft);
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
        const res = await fetch('/api/data');
        if (res.status === 401) {
          window.location.href = '/login';
          return;
        }
        const data = await res.json();
        const draft = clone(EMPTY_STATE);
        if (data && data.value) {
          const parsed = data.value;
          draft.vacations = Array.isArray(parsed.vacations) ? parsed.vacations : [];
          draft.seeds = Array.isArray(parsed.seeds) ? parsed.seeds : [];
        }
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

  return { state, status, mutate };
}
