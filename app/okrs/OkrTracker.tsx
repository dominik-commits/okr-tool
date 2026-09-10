'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './okrs.module.css';
import CycleTabs from './CycleTabs';
import ObjectiveCard, { ObjectiveActions } from './ObjectiveCard';
import EvaluationPanel from './EvaluationPanel';
import Sparkline from './Sparkline';
import { DEPARTMENTS, EMPTY_STATE, SEED_H2_2026_ID, STATUS_ORDER } from './constants';
import { seedH2_2026 } from './seed';
import { clone, overallScore, todayISO, todayStr, uid } from './utils';
import { CycleId, KeyResult, Objective, OkrState } from './types';

function applySeeds(draft: OkrState): boolean {
  if (!draft.seeds) draft.seeds = [];
  if (draft.seeds.includes(SEED_H2_2026_ID)) return false;
  draft.objectives.c2026h2 = seedH2_2026();
  draft.seeds.push(SEED_H2_2026_ID);
  return true;
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

export default function OkrTracker() {
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

  const mutateLocal = useCallback((fn: (draft: OkrState) => void) => {
    setState((prev) => {
      const draft = clone(prev);
      fn(draft);
      return draft;
    });
  }, []);

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
        const changed = applySeeds(draft);
        setState(draft);
        if (changed) scheduleSave(draft);
        setStatus('Gespeichert — geteilt mit allen');
      } catch {
        const draft = clone(EMPTY_STATE);
        applySeeds(draft);
        setState(draft);
        setStatus('Neu — noch nichts gespeichert');
      }
    })();
  }, [scheduleSave]);

  function findObjective(draft: OkrState, oid: string): Objective | undefined {
    return draft.objectives[draft.activeCycle]?.find((o) => o.id === oid);
  }

  function findKr(draft: OkrState, oid: string, kid: string): KeyResult | undefined {
    return findObjective(draft, oid)?.krs.find((k) => k.id === kid);
  }

  function setActiveCycle(id: CycleId) {
    mutate((draft) => {
      draft.activeCycle = id;
    });
  }

  function addObjective() {
    mutate((draft) => {
      draft.objectives[draft.activeCycle].push({ id: uid(), title: '', weight: 0, krs: [], expandedUpdates: {} });
    });
  }

  function deleteObjective(oid: string) {
    mutate((draft) => {
      draft.objectives[draft.activeCycle] = draft.objectives[draft.activeCycle].filter((o) => o.id !== oid);
    });
  }

  function updateObjectiveTitle(oid: string, value: string) {
    mutate((draft) => {
      const o = findObjective(draft, oid);
      if (o) o.title = value;
    });
  }

  function updateObjectiveWeight(oid: string, value: number) {
    mutate((draft) => {
      const o = findObjective(draft, oid);
      if (o) o.weight = value;
    });
  }

  function addKr(oid: string) {
    mutate((draft) => {
      const o = findObjective(draft, oid);
      if (o) {
        o.krs.push({
          id: uid(),
          text: '',
          weight: 0,
          progress: 0,
          status: 'on',
          owner: '',
          department: '',
          dependsOn: '',
          project: '',
          history: [],
          updates: [],
        });
      }
    });
  }

  function deleteKr(oid: string, kid: string) {
    mutate((draft) => {
      const o = findObjective(draft, oid);
      if (o) o.krs = o.krs.filter((k) => k.id !== kid);
    });
  }

  function updateKr(oid: string, kid: string, patch: Partial<Pick<KeyResult, 'text' | 'owner' | 'department' | 'dependsOn' | 'project'>>) {
    mutate((draft) => {
      const k = findKr(draft, oid, kid);
      if (k) Object.assign(k, patch);
    });
  }

  function updateKrWeight(oid: string, kid: string, value: number) {
    mutate((draft) => {
      const k = findKr(draft, oid, kid);
      if (k) k.weight = value;
    });
  }

  function updateKrProgress(oid: string, kid: string, value: number) {
    mutate((draft) => {
      const k = findKr(draft, oid, kid);
      if (!k) return;
      k.progress = value;
      if (!k.history) k.history = [];
      const today = todayISO();
      const last = k.history[k.history.length - 1];
      if (last && last.date === today) {
        last.progress = value;
      } else {
        k.history.push({ date: today, progress: value });
      }
      if (k.history.length > 90) k.history.splice(0, k.history.length - 90);
    });
  }

  function cycleKrStatus(oid: string, kid: string) {
    mutate((draft) => {
      const k = findKr(draft, oid, kid);
      if (k) {
        const idx = STATUS_ORDER.indexOf(k.status);
        k.status = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
      }
    });
  }

  function toggleUpdates(oid: string, kid: string) {
    mutateLocal((draft) => {
      const o = findObjective(draft, oid);
      if (o) {
        if (!o.expandedUpdates) o.expandedUpdates = {};
        o.expandedUpdates[kid] = !o.expandedUpdates[kid];
      }
    });
  }

  function addUpdate(oid: string, kid: string, text: string) {
    if (!text.trim()) return;
    mutate((draft) => {
      const k = findKr(draft, oid, kid);
      if (k) {
        if (!k.updates) k.updates = [];
        k.updates.push({ id: uid(), date: todayStr(), text: text.trim() });
      }
    });
  }

  function deleteUpdate(oid: string, kid: string, updateId: string) {
    mutate((draft) => {
      const k = findKr(draft, oid, kid);
      if (k) k.updates = (k.updates || []).filter((u) => u.id !== updateId);
    });
  }

  function resetAll() {
    if (!confirm('Wirklich alle OKRs in diesem Tracker löschen?')) return;
    mutate((draft) => {
      draft.objectives = { c2026h2: [], c2027h1: [], c2027h2: [] };
      draft.cycleHistory = { c2026h2: [], c2027h1: [], c2027h2: [] };
    });
  }

  function buildActions(oid: string): ObjectiveActions {
    return {
      onTitleChange: (value) => updateObjectiveTitle(oid, value),
      onWeightChange: (value) => updateObjectiveWeight(oid, value),
      onDelete: () => deleteObjective(oid),
      onAddKr: () => addKr(oid),
      onKrChange: (kid, patch) => updateKr(oid, kid, patch),
      onKrWeightChange: (kid, value) => updateKrWeight(oid, kid, value),
      onKrProgressChange: (kid, value) => updateKrProgress(oid, kid, value),
      onKrDelete: (kid) => deleteKr(oid, kid),
      onKrStatusCycle: (kid) => cycleKrStatus(oid, kid),
      onToggleUpdates: (kid) => toggleUpdates(oid, kid),
      onAddUpdate: (kid, text) => addUpdate(oid, kid, text),
      onDeleteUpdate: (kid, updateId) => deleteUpdate(oid, kid, updateId),
    };
  }

  const objectives = state.objectives[state.activeCycle] || [];
  const score = overallScore(objectives);
  const historyScores = (state.cycleHistory[state.activeCycle] || []).map((h) => h.score);

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h1 className={styles.title}>OKR-Tracker</h1>
        <div className={styles.sub}>
          Objectives, Key Results, Gewichtung, Status und Fortschritt — mit Abteilungs-Zuordnung, Abhängigkeiten,
          Projekt-Verknüpfung und grafischer Auswertung. Zurück zum{' '}
          <a href="/" className={styles.inlineLink}>
            Zeitstrahl
          </a>
          .
        </div>
      </header>

      <CycleTabs activeCycle={state.activeCycle} onChange={setActiveCycle} />

      <div className={styles.overall}>
        <div className={styles.overallLabel}>Gesamtfortschritt (gewichtet)</div>
        <div className={styles.barTrack}>
          <div className={styles.barFill} style={{ width: `${Math.round(score)}%` }} />
        </div>
        <div className={styles.overallScoreValue}>{Math.round(score)}%</div>
        <Sparkline points={historyScores} width={120} height={28} color="var(--gold)" className={styles.overallSpark} />
      </div>

      <div>
        {objectives.length === 0 && <div className={styles.empty}>Noch keine Objectives für diesen Zyklus.</div>}
        {objectives.map((o) => (
          <ObjectiveCard key={o.id} objective={o} actions={buildActions(o.id)} />
        ))}
        <button type="button" className={styles.addObj} onClick={addObjective}>
          + Objective hinzufügen
        </button>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Auswertung</h2>
        <div className={styles.evalPanel}>
          <EvaluationPanel objectives={objectives} />
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.status}>{status}</div>
        <button type="button" className={styles.btnGhost} onClick={resetAll}>
          Alle Eingaben zurücksetzen
        </button>
      </footer>

      <datalist id="deptList">
        {DEPARTMENTS.map((d) => (
          <option key={d} value={d} />
        ))}
      </datalist>
    </div>
  );
}
