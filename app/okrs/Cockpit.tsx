'use client';

import { useMemo, useState } from 'react';
import styles from './okrs.module.css';
import Header from './Header';
import OkrHealth from './OkrHealth';
import ManagementInsightPanel from './ManagementInsightPanel';
import ObjectiveOverviewBlock from './ObjectiveOverviewBlock';
import KrDrawer from './KrDrawer';
import { KrUpdateSubmission } from './UpdateKrForm';
import { useOkrState } from './useOkrState';
import { buildManagementInsight } from './managementInsight';
import { CYCLES } from './constants';
import { computeKrProgress, computeKrStatus, computeObjectiveStatus, expectedProgressForCycle, overallScore, todayISO, todayStr, uid } from './utils';
import { StatusValue } from './types';

interface Selection {
  objectiveId: string;
  krId: string;
}

export default function Cockpit() {
  const { state, status, mutate, setActiveCycle } = useOkrState();
  const [selection, setSelection] = useState<Selection | null>(null);
  const [insightOpen, setInsightOpen] = useState(false);

  function openKr(objectiveId: string, krId: string) {
    setSelection({ objectiveId, krId });
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

  const managementInsight = useMemo(() => buildManagementInsight(objectives, expectedProgress), [objectives, expectedProgress]);

  const selectedObjective = selection ? objectives.find((o) => o.id === selection.objectiveId) : undefined;
  const selectedKr = selectedObjective && selection ? selectedObjective.krs.find((k) => k.id === selection.krId) : undefined;
  const selectedStatus = selectedKr ? computeKrStatus(selectedKr, expectedProgress) : 'not_started';

  return (
    <div className={styles.cockpit}>
      <div className={styles.inner}>
        <Header activeNav="Cockpit" showTopControls activeCycle={state.activeCycle} onCycleChange={setActiveCycle} />

        <OkrHealth
          overall={overall}
          cycleLabel={cycleLabel}
          objectiveBreakdown={objectiveBreakdown}
          objectiveCount={objectives.length}
          krCount={flatKrs.length}
          krNeedingAttention={krNeedingAttention}
        />

        <ManagementInsightPanel insight={managementInsight} open={insightOpen} onToggle={() => setInsightOpen((v) => !v)} />

        <div className={styles.sectionTitle}>Objectives</div>
        {objectives.length === 0 ? (
          <div className={styles.emptyState}>Für diesen Zyklus liegen noch keine Objectives vor.</div>
        ) : (
          <div className={styles.flatList}>
            {objectives.map((o, i) => (
              <ObjectiveOverviewBlock
                key={o.id}
                objective={o}
                index={i}
                expectedProgress={expectedProgress}
                onOpenKr={(krId) => openKr(o.id, krId)}
              />
            ))}
          </div>
        )}

        <div className={styles.footer}>
          <span className={styles.saveStatus}>{status}</span>
        </div>
      </div>

      {selectedKr && (
        <KrDrawer
          key={selectedKr.id}
          kr={selectedKr}
          status={selectedStatus}
          onClose={closeKr}
          onSubmitUpdate={(submission) => {
            if (selection) submitKrUpdate(selection.objectiveId, selection.krId, submission);
          }}
        />
      )}
    </div>
  );
}
