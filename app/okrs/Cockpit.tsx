'use client';

import { useMemo, useState } from 'react';
import styles from './okrs.module.css';
import Header from './Header';
import OkrHealth from './OkrHealth';
import ManagementInsightPanel from './ManagementInsightPanel';
import YourAttention from './YourAttention';
import ObjectiveCard from './ObjectiveCard';
import ObjectiveDetailView from './ObjectiveDetailView';
import KrDrawer from './KrDrawer';
import { KrUpdateSubmission } from './UpdateKrForm';
import { useOkrState } from './useOkrState';
import { AttentionItem, buildAttentionItems } from './attention';
import { buildManagementInsight } from './managementInsight';
import { CYCLES } from './constants';
import { computeKrProgress, computeKrStatus, computeObjectiveStatus, expectedProgressForCycle, overallScore, todayISO, todayStr, uid } from './utils';
import { KeyResult, StatusValue } from './types';

type Screen = { type: 'cockpit' } | { type: 'objective'; objectiveId: string };

interface Selection {
  objectiveId: string;
  krId: string;
  openForm: boolean;
}

export default function Cockpit() {
  const { state, status, mutate, setActiveCycle } = useOkrState();
  const [screen, setScreen] = useState<Screen>({ type: 'cockpit' });
  const [selection, setSelection] = useState<Selection | null>(null);

  function changeCycle(id: Parameters<typeof setActiveCycle>[0]) {
    setScreen({ type: 'cockpit' });
    setActiveCycle(id);
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
        <Header
          activeNav="Cockpit"
          showTopControls={screen.type === 'cockpit'}
          showBack={screen.type !== 'cockpit'}
          onBack={backToCockpit}
          activeCycle={state.activeCycle}
          onCycleChange={changeCycle}
        />

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
