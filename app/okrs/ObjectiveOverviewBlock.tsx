import styles from './okrs.module.css';
import KrOverviewRow from './KrOverviewRow';
import { STATUS_ICON } from './StatusChip';
import { Objective } from './types';
import { computeKrStatus, computeObjectiveStatus, objProgress } from './utils';

interface ObjectiveOverviewBlockProps {
  objective: Objective;
  index: number;
  expectedProgress: number;
  onOpenKr: (krId: string) => void;
}

export default function ObjectiveOverviewBlock({ objective, index, expectedProgress, onOpenKr }: ObjectiveOverviewBlockProps) {
  const status = computeObjectiveStatus(objective, expectedProgress);
  const progress = Math.round(objProgress(objective));
  const Icon = STATUS_ICON[status];

  return (
    <div className={styles.flatObjective}>
      <div className={styles.flatObjectiveHead}>
        <div className={styles.flatObjectiveTitleRow}>
          <span className={`${styles.flatObjectiveNum} ${styles.mono}`}>O{index + 1}</span>
          <span className={styles.flatObjectiveTitle}>{objective.shortTitle}</span>
        </div>
        <span className={`${styles.flatObjectivePct} ${styles.statusValue} ${styles.mono}`} data-status={status}>
          <Icon size={14} />
          {progress}%
        </span>
      </div>

      {objective.krs.length > 0 ? (
        <div className={styles.flatKrList}>
          {objective.krs.map((kr) => (
            <KrOverviewRow key={kr.id} kr={kr} status={computeKrStatus(kr, expectedProgress)} onOpen={() => onOpenKr(kr.id)} />
          ))}
        </div>
      ) : (
        <div className={styles.flatKrEmpty}>Keine Key Results.</div>
      )}
    </div>
  );
}
