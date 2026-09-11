import { TrendingDown } from 'lucide-react';
import styles from './okrs.module.css';
import StatusChip from './StatusChip';
import { AttentionItem } from './attention';
import { computeExpectedValueDisplay, consecutiveDeclineMagnitude, daysSince, describeGap, krLastUpdateDate } from './utils';

interface AttentionCardProps {
  item: AttentionItem;
  expectedProgress: number;
  onOpen: () => void;
}

export default function AttentionCard({ item, expectedProgress, onOpen }: AttentionCardProps) {
  const { kr, objective, objectiveIndex, status } = item;
  const objLabel = `O${objectiveIndex + 1} · ${objective.shortTitle}`;

  if (status === 'needs_update') {
    return (
      <button type="button" className={styles.attentionCard} onClick={onOpen}>
        <div className={styles.attentionTitle}>{kr.shortTitle}</div>
        <div className={styles.attentionObjLabel}>{objLabel}</div>
        <div className={styles.attentionChipRow}>
          <StatusChip status="needs_update" />
        </div>
        <div className={styles.attentionBody}>Seit {staleDaysLabel(kr)} kein Update.</div>
        <div className={styles.attentionUpdateCta}>Update</div>
      </button>
    );
  }

  const expectedToday = computeExpectedValueDisplay(kr, expectedProgress) ?? `${Math.round(expectedProgress)}%`;
  const gap = describeGap(kr, expectedProgress);
  const decline = consecutiveDeclineMagnitude(kr, 2);

  return (
    <button type="button" className={styles.attentionCard} onClick={onOpen}>
      <div className={styles.attentionTitle}>{kr.shortTitle}</div>
      <div className={styles.attentionObjLabel}>{objLabel}</div>

      <div className={styles.attentionValues}>
        <div>
          <div className={styles.attentionValueLabel}>Current</div>
          <div className={`${styles.attentionValueBig} ${styles.mono}`}>{kr.current || '–'}</div>
        </div>
        <div>
          <div className={styles.attentionValueLabel}>Expected Today</div>
          <div className={`${styles.attentionValueSmall} ${styles.mono}`}>{expectedToday}</div>
        </div>
        <div>
          <div className={styles.attentionValueLabel}>Target</div>
          <div className={`${styles.attentionValueSmall} ${styles.mono}`}>{kr.target || '–'}</div>
        </div>
      </div>

      {gap && (
        <div className={styles.attentionGap} data-status={status}>
          {gap}
        </div>
      )}
      {decline != null && (
        <div className={styles.attentionTrendText}>
          <TrendingDown size={12} color="var(--off)" />
          sinkt seit zwei Updates in Folge
        </div>
      )}

      <div className={styles.attentionChipRow}>
        <StatusChip status={status} />
      </div>
    </button>
  );
}

function staleDaysLabel(kr: AttentionItem['kr']): string {
  const last = krLastUpdateDate(kr);
  if (!last) return 'nie';
  const days = daysSince(last);
  return days === 1 ? '1 Tag' : `${days} Tagen`;
}
