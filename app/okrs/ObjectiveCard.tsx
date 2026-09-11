import styles from './okrs.module.css';
import ProgressBar from './ProgressBar';
import StatusChip from './StatusChip';
import { ATTENTION_STATUS_ORDER } from './constants';
import { Objective } from './types';
import { computeKrProgress, computeKrStatus, computeObjectiveStatus, objProgress } from './utils';

interface ObjectiveCardProps {
  objective: Objective;
  index: number;
  expectedProgress: number;
  onOpen: () => void;
}

export default function ObjectiveCard({ objective, index, expectedProgress, onOpen }: ObjectiveCardProps) {
  const status = computeObjectiveStatus(objective, expectedProgress);
  const progress = Math.round(objProgress(objective));

  const flagged = objective.krs
    .map((kr) => ({ kr, krStatus: computeKrStatus(kr, expectedProgress) }))
    .filter(({ krStatus }) => krStatus === 'off' || krStatus === 'risk' || krStatus === 'needs_update')
    .sort((a, b) => {
      const rank = ATTENTION_STATUS_ORDER.indexOf(a.krStatus) - ATTENTION_STATUS_ORDER.indexOf(b.krStatus);
      return rank !== 0 ? rank : computeKrProgress(a.kr) - computeKrProgress(b.kr);
    });

  return (
    <button type="button" className={styles.objectiveCard} onClick={onOpen}>
      <div className={styles.objectiveCardTop}>
        <span className={`${styles.objectiveNum} ${styles.mono}`}>{String(index + 1).padStart(2, '0')}</span>
        <StatusChip status={status} />
      </div>

      <div className={styles.objectiveCardTitle}>{objective.shortTitle}</div>

      <div className={styles.objectiveCardProgressRow}>
        <ProgressBar value={progress} status={status} expected={expectedProgress} height={6} />
      </div>
      <div className={styles.objectiveCardMetaRow}>
        <span className={`${styles.objectiveCardPct} ${styles.mono}`}>{progress}%</span>
        <span>Expected {Math.round(expectedProgress)}%</span>
      </div>

      {flagged.length > 0 && (
        <div className={styles.objectiveCardAttention}>
          {flagged.length} KR{flagged.length > 1 ? 's' : ''} benötig{flagged.length > 1 ? 'en' : 't'} Aufmerksamkeit
        </div>
      )}

      {flagged[0] && (
        <div className={styles.objectiveCardProblem}>
          <span className={styles.objectiveCardProblemLabel}>Hauptproblem: </span>
          {flagged[0].kr.shortTitle}
        </div>
      )}
    </button>
  );
}
