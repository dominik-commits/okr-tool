'use client';

import styles from './okrs.module.css';
import Header from './Header';
import ObjectiveEditCard from './ObjectiveEditCard';
import { useOkrState } from './useOkrState';
import { DEPARTMENTS } from './constants';
import { uid } from './utils';
import { KeyResult, Objective } from './types';

export default function ObjectivesManager() {
  const { state, status, mutate, setActiveCycle } = useOkrState();
  const objectives = state.objectives[state.activeCycle] || [];
  const weightSum = objectives.reduce((s, o) => s + Number(o.weight || 0), 0);

  function findObjective(draft: typeof state, oid: string): Objective | undefined {
    return draft.objectives[draft.activeCycle]?.find((o) => o.id === oid);
  }

  function addObjective() {
    mutate((draft) => {
      draft.objectives[draft.activeCycle].push({
        id: uid(),
        title: '',
        shortTitle: '',
        weight: 0,
        owner: '',
        krs: [],
        expandedUpdates: {},
      });
    });
  }

  function deleteObjective(oid: string) {
    if (!confirm('Dieses Objective inklusive aller Key Results wirklich löschen?')) return;
    mutate((draft) => {
      draft.objectives[draft.activeCycle] = draft.objectives[draft.activeCycle].filter((o) => o.id !== oid);
    });
  }

  function updateObjective(oid: string, patch: Partial<Objective>) {
    mutate((draft) => {
      const o = findObjective(draft, oid);
      if (o) Object.assign(o, patch);
    });
  }

  function addKr(oid: string) {
    mutate((draft) => {
      const o = findObjective(draft, oid);
      if (!o) return;
      o.krs.push({
        id: uid(),
        text: '',
        shortTitle: '',
        weight: 0,
        progress: 0,
        owner: '',
        department: '',
        dependsOn: '',
        project: '',
        history: [],
        updates: [],
        krType: 'percentage',
        current: '',
        currentValue: null,
        target: '',
        targetValue: null,
        confidence: 'Medium',
        blocker: '',
        nextAction: '',
        initiatives: [],
      });
    });
  }

  function deleteKr(oid: string, kid: string) {
    if (!confirm('Dieses Key Result wirklich löschen?')) return;
    mutate((draft) => {
      const o = findObjective(draft, oid);
      if (o) o.krs = o.krs.filter((k) => k.id !== kid);
    });
  }

  function updateKr(oid: string, kid: string, patch: Partial<KeyResult>) {
    mutate((draft) => {
      const o = findObjective(draft, oid);
      const k = o?.krs.find((item) => item.id === kid);
      if (k) Object.assign(k, patch);
    });
  }

  return (
    <div className={styles.cockpit}>
      <div className={styles.inner}>
        <Header activeNav="Objectives" showTopControls activeCycle={state.activeCycle} onCycleChange={setActiveCycle} />

        <div className={styles.sectionTitle}>Objectives verwalten</div>

        {objectives.length > 0 && (
          <div className={styles.weightHint} data-warn={weightSum !== 100}>
            Gewichtungssumme der Objectives: {weightSum}% {weightSum !== 100 && '(sollte 100% ergeben)'}
          </div>
        )}

        {objectives.length === 0 && <div className={styles.emptyState}>Für diesen Zyklus liegen noch keine Objectives vor.</div>}

        <div className={styles.editObjectiveList}>
          {objectives.map((o, i) => (
            <ObjectiveEditCard
              key={o.id}
              objective={o}
              index={i}
              onChange={(patch) => updateObjective(o.id, patch)}
              onDelete={() => deleteObjective(o.id)}
              onAddKr={() => addKr(o.id)}
              onKrChange={(kid, patch) => updateKr(o.id, kid, patch)}
              onKrDelete={(kid) => deleteKr(o.id, kid)}
            />
          ))}
        </div>

        <button type="button" className={styles.addObj} onClick={addObjective}>
          + Objective hinzufügen
        </button>

        <div className={styles.footer}>
          <span className={styles.saveStatus}>{status}</span>
        </div>

        <datalist id="deptList">
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d} />
          ))}
        </datalist>
      </div>
    </div>
  );
}
