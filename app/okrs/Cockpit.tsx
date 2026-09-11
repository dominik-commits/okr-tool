'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './okrs.module.css';
import Header from './Header';
import OkrHealth from './OkrHealth';
import ManagementInsightPanel from './ManagementInsightPanel';
import YourAttention from './YourAttention';
import ObjectiveCard from './ObjectiveCard';
import ObjectiveDetailView from './ObjectiveDetailView';
import KrDrawer from './KrDrawer';
import { KrUpdateSubmission } from './UpdateKrForm';
import { AttentionItem, buildAttentionItems } from './attention';
import { buildManagementInsight } from './managementInsight';
import { CYCLES, EMPTY_STATE, SEED_H2_2026_ID } from './constants';
import { seedH2_2026 } from './seed';
import {
  clone,
  computeKrProgress,
  computeKrStatus,
  computeObjectiveStatus,
  expectedProgressForCycle,
  migrateObjective,
  overallScore,
  todayISO,
  todayStr,
  uid,
} from './utils';
import { CycleId, KeyResult, Objective, OkrState, StatusValue } from './types';

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

type Screen = { type: 'cockpit' } | { type: 'objective'; objectiveId: string };

interface Selection {
  objectiveId: string;
  krId: string;
  openForm: boolean;
}

export default function Cockpit() {
  const [state, setState] = useState<OkrState>(EMPTY_STATE);
  const [status, setStatus] = useState('Lädt…');
  const [screen, setScreen] = useState<Screen>({ type: 'cockpit' });
  const [selection, setSelection] = useState<Selection | null>(null);
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

  function setActiveCycle(id: CycleId) {
    setScreen({ type: 'cockpit' });
    mutate((draft) => {
      draft.activeCycle = id;
    });
  }

  function openObjective(objectiveId: string) {
    setScreen({ type: 'objective', objectiveId });
  }

  function backToCockpit() {
    setScreen({ type: 'cockpit' });
  }

  function openKr(objectiveId: string, krId: string, openForm = false) {
    setSelection({ objectiveId, krId, openForm });
  }

  function closeKr() {
    setSelection(null);
  }

  function submitKrUpdate(objectiveId: string, krId: string, submission: KrUpdateSubmission) {
    mutate((draft) => {
      const o = draft.objectives[draft.activeCycle].find((obj) => obj.id === objectiveId);
      const k = o?.krs.find((item) => item.id === krId);
      if (!k) return;

      k.confidence = submission.confidence;
      k.blocker = submission.blocker;
      k.nextAction = submission.nextAction;
      k.current = submission.current;
      if (submission.currentValue !== undefined) k.currentValue = submission.currentValue;
      if (submission.progress !== undefined) k.progress = submission.progress;

      const newProgress = computeKrProgress(k);
      if (!k.history) k.history = [];
      const today = todayISO();
      const last = k.history[k.history.length - 1];
      if (last && last.date === today) {
        last.progress = newProgress;
      } else {
        k.history.push({ date: today, progress: newProgress });
      }
      if (k.history.length > 90) k.history.splice(0, k.history.length - 90);

      const text = submission.whatChanged.trim();
      if (text) {
        if (!k.updates) k.updates = [];
        k.updates.push({ id: uid(), date: todayStr(), text });
      }
    });
  }

  const objectives = state.objectives[state.activeCycle] || [];
  const expectedProgress = useMemo(() => expectedProgressForCycle(state.activeCycle), [state.activeCycle]);
  const cycleLabel = CYCLES.find((c) => c.id === state.activeCycle)?.label ?? '';
  const overall = Math.round(overallScore(objectives));

  const flatKrs = useMemo(() => objectives.flatMap((o) => o.krs), [objectives]);
  const krNeedingAttention = flatKrs.filter((kr) => {
    const s = computeKrStatus(kr, expectedProgress);
    return s === 'off' || s === 'risk' || s === 'needs_update';
  }).length;

  const objectiveBreakdown = useMemo(() => {
    const counts: Partial<Record<StatusValue, number>> = {};
    objectives.forEach((o) => {
      const s = computeObjectiveStatus(o, expectedProgress);
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [objectives, expectedProgress]);

  const attentionItems = useMemo(() => buildAttentionItems(objectives, expectedProgress), [objectives, expectedProgress]);
  const managementInsight = useMemo(() => buildManagementInsight(objectives, expectedProgress), [objectives, expectedProgress]);

  const currentObjectiveIndex = screen.type === 'objective' ? objectives.findIndex((o) => o.id === screen.objectiveId) : -1;
  const currentObjective = currentObjectiveIndex >= 0 ? objectives[currentObjectiveIndex] : undefined;

  const selectedObjective = selection ? objectives.find((o) => o.id === selection.objectiveId) : undefined;
  const selectedKr = selectedObjective && selection ? selectedObjective.krs.find((k) => k.id === selection.krId) : undefined;
  const selectedStatus = selectedKr ? computeKrStatus(selectedKr, expectedProgress) : 'not_started';

  function handleAttentionOpen(item: AttentionItem) {
    openKr(item.objective.id, item.kr.id, item.status === 'needs_update');
  }

  function handleKrRowOpen(kr: KeyResult) {
    if (!currentObjective) return;
    openKr(currentObjective.id, kr.id);
  }

  return (
    <div className={styles.cockpit}>
      <div className={styles.inner}>
        <Header onCockpit={screen.type === 'cockpit'} onBack={backToCockpit} activeCycle={state.activeCycle} onCycleChange={setActiveCycle} />

        {screen.type === 'cockpit' ? (
          <>
            <OkrHealth
              overall={overall}
              cycleLabel={cycleLabel}
              objectiveBreakdown={objectiveBreakdown}
              objectiveCount={objectives.length}
              krCount={flatKrs.length}
              krNeedingAttention={krNeedingAttention}
            />
            <ManagementInsightPanel insight={managementInsight} />
            <YourAttention items={attentionItems} expectedProgress={expectedProgress} onOpen={handleAttentionOpen} />

            <div className={styles.sectionTitle}>Objectives</div>
            {objectives.length === 0 ? (
              <div className={styles.emptyState}>Für diesen Zyklus liegen noch keine Objectives vor.</div>
            ) : (
              <div className={styles.objectiveGrid}>
                {objectives.map((o, i) => (
                  <ObjectiveCard key={o.id} objective={o} index={i} expectedProgress={expectedProgress} onOpen={() => openObjective(o.id)} />
                ))}
              </div>
            )}
          </>
        ) : currentObjective ? (
          <ObjectiveDetailView
            objective={currentObjective}
            index={currentObjectiveIndex}
            expectedProgress={expectedProgress}
            onOpenKr={handleKrRowOpen}
          />
        ) : null}

        <div className={styles.footer}>
          <span className={styles.saveStatus}>{status}</span>
        </div>
      </div>

      {selectedKr && (
        <KrDrawer
          key={selectedKr.id}
          kr={selectedKr}
          status={selectedStatus}
          expectedProgress={expectedProgress}
          initialShowForm={selection?.openForm}
          onClose={closeKr}
          onSubmitUpdate={(submission) => {
            if (selection) submitKrUpdate(selection.objectiveId, selection.krId, submission);
          }}
        />
      )}
    </div>
  );
}
