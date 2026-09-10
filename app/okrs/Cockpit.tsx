'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './okrs.module.css';
import TopNav from './TopNav';
import QuarterSelector from './QuarterSelector';
import KpiCard from './KpiCard';
import AttentionRow from './AttentionRow';
import ObjectiveCard from './ObjectiveCard';
import AiInsightsPanel from './AiInsightsPanel';
import KrDrawer from './KrDrawer';
import { KrUpdateSubmission } from './UpdateKrForm';
import { buildInsights } from './aiInsights';
import { EMPTY_STATE, SEED_H2_2026_ID } from './constants';
import { seedH2_2026 } from './seed';
import {
  clone,
  computeKrProgress,
  computeKrStatus,
  expectedProgressForCycle,
  krIsOverdue,
  migrateObjective,
  overallScore,
  todayISO,
  todayStr,
  uid,
} from './utils';
import { CycleId, KeyResult, Objective, OkrState } from './types';

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

interface Selection {
  objectiveId: string;
  krId: string;
}

export default function Cockpit() {
  const [state, setState] = useState<OkrState>(EMPTY_STATE);
  const [status, setStatus] = useState('Lädt…');
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
    mutate((draft) => {
      draft.activeCycle = id;
    });
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
  const overall = Math.round(overallScore(objectives));

  const flatKrs = useMemo(
    () => objectives.flatMap((o) => o.krs.map((kr) => ({ kr, obj: o }))),
    [objectives]
  );

  const onCount = flatKrs.filter(({ kr }) => computeKrStatus(kr, expectedProgress) === 'on').length;
  const riskCount = flatKrs.filter(({ kr }) => computeKrStatus(kr, expectedProgress) === 'risk').length;
  const offCount = flatKrs.filter(({ kr }) => computeKrStatus(kr, expectedProgress) === 'off').length;
  const overdueCount = flatKrs.filter(({ kr }) => krIsOverdue(kr)).length;

  const attention = flatKrs
    .filter(({ kr }) => {
      const s = computeKrStatus(kr, expectedProgress);
      return s === 'risk' || s === 'off';
    })
    .sort((a, b) => {
      const sa = computeKrStatus(a.kr, expectedProgress);
      const sb = computeKrStatus(b.kr, expectedProgress);
      if (sa === sb) return 0;
      return sa === 'off' ? -1 : 1;
    });

  const insights = useMemo(() => buildInsights(objectives, expectedProgress), [objectives, expectedProgress]);

  function openKr(obj: Objective, kr: KeyResult) {
    setSelection({ objectiveId: obj.id, krId: kr.id });
  }

  const selectedObjective = selection ? objectives.find((o) => o.id === selection.objectiveId) : undefined;
  const selectedKr = selectedObjective && selection ? selectedObjective.krs.find((k) => k.id === selection.krId) : undefined;
  const selectedStatus = selectedKr ? computeKrStatus(selectedKr, expectedProgress) : 'nodata';

  return (
    <div className={styles.cockpit}>
      <div className={styles.inner}>
        <TopNav />

        <div className={styles.headerRow}>
          <QuarterSelector activeCycle={state.activeCycle} onChange={setActiveCycle} />
          <div className={styles.filterGroup}>
            {['Department', 'Owner', 'Status'].map((f) => (
              <button key={f} type="button" className={styles.filterBtn}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {objectives.length === 0 ? (
          <div className={styles.emptyQuarter}>Für diesen Zyklus liegen noch keine Objectives vor.</div>
        ) : (
          <>
            <div className={styles.kpiRow}>
              <KpiCard label="Overall Progress" value={`${overall}%`} sub="gewichtet über alle Objectives" color="var(--accent)" />
              <KpiCard label="On Track Key Results" value={onCount} sub={`von ${flatKrs.length} Key Results`} color="var(--on)" />
              <KpiCard label="At Risk Key Results" value={riskCount} sub="benötigen Beobachtung" color="var(--risk)" />
              <KpiCard label="Overdue Updates" value={overdueCount} sub="seit über 7 Tagen kein Update" color="var(--off)" />
            </div>

            <div className={styles.layoutGrid}>
              <div className={styles.mainCol}>
                {attention.length > 0 && (
                  <div>
                    <div className={styles.sectionHeader}>
                      <span className={styles.sectionTitle}>Attention Required</span>
                      <span className={styles.sectionCount}>{attention.length} Key Results</span>
                    </div>
                    <div className={styles.attentionList}>
                      {attention.map(({ kr, obj }) => (
                        <AttentionRow
                          key={kr.id}
                          kr={kr}
                          status={computeKrStatus(kr, expectedProgress)}
                          onOpen={() => openKr(obj, kr)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className={styles.objectiveList}>
                  {objectives.map((o, i) => (
                    <ObjectiveCard
                      key={o.id}
                      objective={o}
                      index={i}
                      expectedProgress={expectedProgress}
                      onOpenKr={(kr) => openKr(o, kr)}
                    />
                  ))}
                </div>
              </div>

              <div className={styles.sideCol}>
                <AiInsightsPanel insights={insights} />
              </div>
            </div>
          </>
        )}

        <div className={styles.footer}>
          <span className={styles.saveStatus}>{status}</span>
        </div>
      </div>

      {selectedKr && (
        <KrDrawer
          kr={selectedKr}
          status={selectedStatus}
          expectedProgress={expectedProgress}
          onClose={() => setSelection(null)}
          onSubmitUpdate={(submission) => {
            if (selection) submitKrUpdate(selection.objectiveId, selection.krId, submission);
          }}
        />
      )}
    </div>
  );
}
