import { ChevronRight, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import styles from './okrs.module.css';
import StatusChip from './StatusChip';
import { KeyResult, StatusValue } from './types';
import { formatLastUpdateLabel, krTrend } from './utils';

function TrendIcon({ trend }: { trend: number }) {
  if (trend > 0) return <TrendingUp size={13} color="var(--on)" />;
  if (trend < 0) return <TrendingDown size={13} color="var(--off)" />;
  return <Minus size={13} color="var(--faint)" />;
}

interface AttentionRowProps {
  kr: KeyResult;
  status: StatusValue;
  onOpen: () => void;
}

export default function AttentionRow({ kr, status, onOpen }: AttentionRowProps) {
  const trend = krTrend(kr);
  return (
    <button type="button" className={styles.attentionRow} onClick={onOpen}>
      <div className={styles.attentionMain}>
        <div className={styles.attentionTitle}>{kr.text}</div>
        <div className={styles.attentionMeta}>
          <span>{kr.owner || '—'}</span>
          <span className={styles.attentionMetaDot}>·</span>
          <span>Update {formatLastUpdateLabel(kr)}</span>
        </div>
      </div>
      <div className={styles.attentionRight}>
        <div>
          <div className={`${styles.attentionValue} ${styles.mono}`}>
            {kr.current || '–'} <span className={styles.krValueSep}>/</span> {kr.target || '–'}
          </div>
          <div className={styles.attentionTrend}>
            <TrendIcon trend={trend} />
            {trend > 0 ? '+' : ''}
            {trend}%
          </div>
        </div>
        <StatusChip status={status} />
        <ChevronRight size={16} className={styles.chevron} />
      </div>
    </button>
  );
}
