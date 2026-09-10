import styles from './okrs.module.css';
import KeyResultRow from './KeyResultRow';
import { objProgress } from './utils';
import { KeyResult, Objective } from './types';

export interface ObjectiveActions {
  onTitleChange: (value: string) => void;
  onWeightChange: (value: number) => void;
  onDelete: () => void;
  onAddKr: () => void;
  onKrChange: (kid: string, patch: Partial<Pick<KeyResult, 'text' | 'owner' | 'department' | 'dependsOn' | 'project'>>) => void;
  onKrWeightChange: (kid: string, value: number) => void;
  onKrProgressChange: (kid: string, value: number) => void;
  onKrDelete: (kid: string) => void;
  onKrStatusCycle: (kid: string) => void;
  onToggleUpdates: (kid: string) => void;
  onAddUpdate: (kid: string, text: string) => void;
  onDeleteUpdate: (kid: string, updateId: string) => void;
}

interface ObjectiveCardProps {
  objective: Objective;
  actions: ObjectiveActions;
}

export default function ObjectiveCard({ objective, actions }: ObjectiveCardProps) {
  const prog = Math.round(objProgress(objective));

  return (
    <div className={styles.objective}>
      <div className={styles.objHead}>
        <div className={styles.objTitleRow}>
          <input
            type="text"
            className={`${styles.input} ${styles.focusRing} ${styles.objTitleInput}`}
            value={objective.title}
            placeholder="Objective"
            onChange={(e) => actions.onTitleChange(e.target.value)}
          />
        </div>
        <div className={styles.objWeight}>
          Gewicht{' '}
          <input
            type="number"
            min={0}
            max={100}
            className={`${styles.input} ${styles.focusRing} ${styles.objWeightInput}`}
            value={objective.weight}
            onChange={(e) => actions.onWeightChange(Number(e.target.value) || 0)}
          />
          %
        </div>
        <button type="button" className={styles.objDel} title="Objective entfernen" onClick={actions.onDelete}>
          ×
        </button>
      </div>
      <div className={styles.objProgressRow}>
        <div className={`${styles.barTrack} ${styles.barTrackThin}`}>
          <div className={styles.barFill} style={{ width: `${prog}%` }} />
        </div>
        <div className={styles.objPct}>{prog}%</div>
      </div>
      {objective.krs.map((k) => (
        <KeyResultRow
          key={k.id}
          kr={k}
          expanded={!!objective.expandedUpdates?.[k.id]}
          onChange={(patch) => actions.onKrChange(k.id, patch)}
          onWeightChange={(value) => actions.onKrWeightChange(k.id, value)}
          onProgressChange={(value) => actions.onKrProgressChange(k.id, value)}
          onDelete={() => actions.onKrDelete(k.id)}
          onStatusCycle={() => actions.onKrStatusCycle(k.id)}
          onToggleUpdates={() => actions.onToggleUpdates(k.id)}
          onAddUpdate={(text) => actions.onAddUpdate(k.id, text)}
          onDeleteUpdate={(updateId) => actions.onDeleteUpdate(k.id, updateId)}
        />
      ))}
      <button type="button" className={styles.addKr} onClick={actions.onAddKr}>
        + Key Result
      </button>
    </div>
  );
}
