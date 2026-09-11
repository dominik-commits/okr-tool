import styles from './okrs.module.css';
import KrEditRow from './KrEditRow';
import { KeyResult, Objective } from './types';

interface ObjectiveEditCardProps {
  objective: Objective;
  index: number;
  onChange: (patch: Partial<Objective>) => void;
  onDelete: () => void;
  onAddKr: () => void;
  onKrChange: (krId: string, patch: Partial<KeyResult>) => void;
  onKrDelete: (krId: string) => void;
}

export default function ObjectiveEditCard({ objective, index, onChange, onDelete, onAddKr, onKrChange, onKrDelete }: ObjectiveEditCardProps) {
  const krWeightSum = objective.krs.reduce((s, k) => s + Number(k.weight || 0), 0);

  return (
    <div className={styles.editObjectiveCard}>
      <div className={styles.editObjectiveHead}>
        <span className={`${styles.objectiveNum} ${styles.mono}`}>{String(index + 1).padStart(2, '0')}</span>
        <button type="button" className={styles.objDel} title="Objective entfernen" onClick={onDelete}>
          ×
        </button>
      </div>

      <div className={styles.editObjectiveFields}>
        <input
          type="text"
          className={`${styles.formInput} ${styles.editObjectiveTitle}`}
          value={objective.title}
          placeholder="Objective-Titel"
          onChange={(e) => onChange({ title: e.target.value })}
        />
        <input
          type="text"
          className={styles.formInput}
          value={objective.shortTitle}
          placeholder="Kurzbezeichnung fürs Cockpit"
          onChange={(e) => onChange({ shortTitle: e.target.value })}
        />
        <div className={styles.editObjectiveRow2}>
          <div className={styles.krEditMetaField}>
            <label className={styles.formLabel}>Owner</label>
            <input type="text" className={styles.formInput} value={objective.owner} onChange={(e) => onChange({ owner: e.target.value })} />
          </div>
          <div className={styles.krEditMetaField} style={{ maxWidth: 100 }}>
            <label className={styles.formLabel}>Gewicht (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              className={styles.formInput}
              value={objective.weight}
              onChange={(e) => onChange({ weight: Number(e.target.value) || 0 })}
            />
          </div>
        </div>
      </div>

      <div className={styles.editKrList}>
        {objective.krs.map((kr) => (
          <KrEditRow key={kr.id} kr={kr} onChange={(patch) => onKrChange(kr.id, patch)} onDelete={() => onKrDelete(kr.id)} />
        ))}
      </div>

      {objective.krs.length > 0 && (
        <div className={styles.krWeightHint} data-warn={krWeightSum !== 100}>
          KR-Gewichte: {krWeightSum}% {krWeightSum !== 100 && '(sollten 100% ergeben)'}
        </div>
      )}

      <button type="button" className={styles.addKr} onClick={onAddKr}>
        + Key Result hinzufügen
      </button>
    </div>
  );
}
