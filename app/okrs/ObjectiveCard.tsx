import styles from './okrs.module.css';
import KrTableRow from './KrTableRow';
import ProgressBar from './ProgressBar';
import StatusChip from './StatusChip';
import { KeyResult, Objective } from './types';
import { computeKrStatus, computeObjectiveStatus, objProgress } from './utils';

interface ObjectiveCardProps {
  objective: Objective;
  index: number;
  expectedProgress: number;
  onOpenKr: (kr: KeyResult) => void;
}

export default function ObjectiveCard({ objective, index, expectedProgress, onOpenKr }: ObjectiveCardProps) {
  const status = computeObjectiveStatus(objective, expectedProgress);
  const progress = Math.round(objProgress(objective));

  return (
    <div className={styles.objectiveCard}>
      <div className={styles.objectiveHeader}>
        <div className={styles.objectiveHeaderLeft}>
          <div className={styles.objectiveBadge} data-status={status}>
            O{index + 1}
          </div>
          <div>
            <div className={styles.objectiveTitle}>{objective.title}</div>
            <div className={styles.objectiveMeta}>
              <span>{objective.owner || '—'}</span>
              <span className={styles.attentionMetaDot}>·</span>
              <span>Weight {objective.weight}%</span>
            </div>
          </div>
        </div>
        <div className={styles.objectiveHeaderRight}>
          <StatusChip status={status} size="md" />
          <span className={`${styles.objectiveScore} ${styles.mono}`}>{progress}%</span>
        </div>
      </div>
      <div className={styles.objectiveProgressWrap}>
        <ProgressBar value={progress} status={status} height={5} />
      </div>
      <div className={styles.objectiveTableWrap}>
        <table className={styles.krTable}>
          <thead>
            <tr>
              <th>Key Result</th>
              <th>Current / Target</th>
              <th>Progress</th>
              <th>Trend</th>
              <th>Status</th>
              <th>Owner</th>
              <th>Last Update</th>
            </tr>
          </thead>
          <tbody>
            {objective.krs.map((kr) => (
              <KrTableRow
                key={kr.id}
                kr={kr}
                status={computeKrStatus(kr, expectedProgress)}
                expectedProgress={expectedProgress}
                onOpen={() => onOpenKr(kr)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
