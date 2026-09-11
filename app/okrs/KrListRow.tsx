import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import styles from './okrs.module.css';
import ProgressBar from './ProgressBar';
import StatusChip from './StatusChip';
import { KeyResult, StatusValue } from './types';
import { computeKrProgress, krTrend } from './utils';

function TrendIcon({ trend }: { trend: number }) {
  if (trend > 0) return <TrendingUp size={13} color="var(--on)" />;
  if (trend < 0) return <TrendingDown size={13} color="var(--off)" />;
  return <Minus size={13} color="var(--faint)" />;
}

interface KrListRowProps {
  kr: KeyResult;
  status: StatusValue;
  expectedProgress: number;
  onOpen: () => void;
}

export default function KrListRow({ kr, status, expectedProgress, onOpen }: KrListRowProps) {
  const progress = Math.round(computeKrProgress(kr));
  const trend = krTrend(kr);

  return (
    <button type="button" className={styles.krListRow} onClick={onOpen}>
      <div className={styles.krListMain}>
        <div className={styles.krListTitle}>{kr.shortTitle}</div>
        <div className={`${styles.krListValues} ${styles.mono}`}>
          {kr.current || '–'} <span className={styles.krValueSep}>/</span> {kr.target || '–'}
        </div>
      </div>
      <div className={styles.krListRight}>
        <div className={styles.krListProgress}>
          <ProgressBar value={progress} status={status} expected={expectedProgress} height={5} />
        </div>
        <span className={`${styles.krListPct} ${styles.mono}`}>{progress}%</span>
        <TrendIcon trend={trend} />
        <StatusChip status={status} />
      </div>
    </button>
  );
}
