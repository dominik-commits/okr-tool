import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import styles from './okrs.module.css';
import ProgressBar from './ProgressBar';
import StatusChip from './StatusChip';
import { KeyResult, StatusValue } from './types';
import { computeKrProgress, formatLastUpdateLabel, krTrend } from './utils';

function TrendIcon({ trend }: { trend: number }) {
  if (trend > 0) return <TrendingUp size={13} color="var(--on)" />;
  if (trend < 0) return <TrendingDown size={13} color="var(--off)" />;
  return <Minus size={13} color="var(--faint)" />;
}

interface KrTableRowProps {
  kr: KeyResult;
  status: StatusValue;
  expectedProgress: number;
  onOpen: () => void;
}

export default function KrTableRow({ kr, status, expectedProgress, onOpen }: KrTableRowProps) {
  const progress = Math.round(computeKrProgress(kr));
  const trend = krTrend(kr);

  return (
    <tr className={styles.krRow} onClick={onOpen}>
      <td>
        <div className={styles.krTextCell}>{kr.text}</div>
      </td>
      <td>
        <div className={`${styles.krValueCell} ${styles.mono}`}>
          {kr.current || '–'} <span className={styles.krValueSep}>/</span> {kr.target || '–'}
        </div>
      </td>
      <td className={styles.krProgressCell}>
        <div className={styles.krProgressRow}>
          <ProgressBar value={progress} status={status} expected={expectedProgress} />
          <span className={styles.krProgressPct}>{progress}%</span>
        </div>
      </td>
      <td className={styles.krTrendCell}>
        <div className={styles.krTrend}>
          <TrendIcon trend={trend} />
          {trend > 0 ? '+' : ''}
          {trend}%
        </div>
      </td>
      <td>
        <StatusChip status={status} />
      </td>
      <td className={styles.krOwnerCell}>{kr.owner || '—'}</td>
      <td className={styles.krLastUpdateCell}>{formatLastUpdateLabel(kr)}</td>
    </tr>
  );
}
