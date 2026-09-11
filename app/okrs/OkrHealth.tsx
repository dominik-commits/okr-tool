import styles from './okrs.module.css';
import ProgressBar from './ProgressBar';
import { STATUS_LABEL } from './constants';
import { StatusValue } from './types';
import { nextWeekdayLabel } from './utils';

interface OkrHealthProps {
  overall: number;
  cycleLabel: string;
  objectiveBreakdown: Partial<Record<StatusValue, number>>;
  objectiveCount: number;
  krCount: number;
  krNeedingAttention: number;
}

const BREAKDOWN_ORDER: StatusValue[] = ['on', 'risk', 'off', 'needs_update', 'not_started'];

export default function OkrHealth({ overall, cycleLabel, objectiveBreakdown, objectiveCount, krCount, krNeedingAttention }: OkrHealthProps) {
  return (
    <div className={styles.healthCard}>
      <div className={styles.healthRow}>
        <div>
          <div className={`${styles.healthScore} ${styles.mono}`}>{overall}%</div>
          <div className={styles.healthLabel}>OKR Health · {cycleLabel}</div>
          <div className={styles.healthBarWrap}>
            <ProgressBar value={overall} accent height={5} />
          </div>
        </div>

        <div className={styles.healthStats}>
          <div>
            <div className={styles.healthStatValue}>{objectiveCount}</div>
            <div className={styles.healthStatLabel}>Objectives</div>
            <div className={styles.healthBreakdown}>
              {BREAKDOWN_ORDER.filter((s) => (objectiveBreakdown[s] || 0) > 0).map((s) => (
                <div key={s} className={styles.healthBreakdownLine}>
                  <span className={styles.healthDot} data-status={s} />
                  {objectiveBreakdown[s]} {STATUS_LABEL[s]}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.healthDivider} />

          <div>
            <div className={styles.healthStatValue}>{krCount}</div>
            <div className={styles.healthStatLabel}>Key Results</div>
            {krNeedingAttention > 0 && (
              <div className={styles.healthAttentionNote}>{krNeedingAttention} erfordern Aufmerksamkeit</div>
            )}
          </div>

          <div className={styles.healthDivider} />

          <div>
            <div className={styles.healthStatLabel}>Nächste Review</div>
            <div className={styles.healthReviewDate}>{nextWeekdayLabel()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
