import styles from './okrs.module.css';
import KrListRow from './KrListRow';
import ProgressBar from './ProgressBar';
import StatusChip from './StatusChip';
import { KeyResult, Objective } from './types';
import { computeKrStatus, computeObjectiveStatus, objProgress } from './utils';

interface ObjectiveDetailViewProps {
  objective: Objective;
  index: number;
  expectedProgress: number;
  onOpenKr: (kr: KeyResult) => void;
}

export default function ObjectiveDetailView({ objective, index, expectedProgress, onOpenKr }: ObjectiveDetailViewProps) {
  const status = computeObjectiveStatus(objective, expectedProgress);
  const progress = Math.round(objProgress(objective));

  return (
    <div>
      <div className={styles.objDetailHead}>
        <span className={`${styles.objDetailId} ${styles.mono}`}>O{index + 1}</span>
        <h1 className={styles.objDetailTitle}>{objective.title}</h1>

        <div className={styles.objDetailStats}>
          <div>
            <div className={styles.objDetailStatLabel}>Owner</div>
            <div className={styles.objDetailStatValue}>{objective.owner || '—'}</div>
          </div>
          <div>
            <div className={styles.objDetailStatLabel}>Progress</div>
            <div className={`${styles.objDetailStatValueBig} ${styles.mono}`}>{progress}%</div>
          </div>
          <div>
            <div className={styles.objDetailStatLabel}>Expected Progress</div>
            <div className={`${styles.objDetailStatValueBigMuted} ${styles.mono}`}>{Math.round(expectedProgress)}%</div>
          </div>
          <div>
            <div className={styles.objDetailStatLabel}>Status</div>
            <div className={styles.objDetailStatusWrap}>
              <StatusChip status={status} size="md" />
            </div>
          </div>
        </div>

        <div className={styles.objDetailBarWrap}>
          <ProgressBar value={progress} status={status} expected={expectedProgress} height={6} />
        </div>
      </div>

      <div className={styles.sectionTitle}>Key Results</div>
      <div className={styles.krListWrap}>
        {objective.krs.map((kr) => (
          <KrListRow
            key={kr.id}
            kr={kr}
            status={computeKrStatus(kr, expectedProgress)}
            expectedProgress={expectedProgress}
            onOpen={() => onOpenKr(kr)}
          />
        ))}
      </div>
    </div>
  );
}
