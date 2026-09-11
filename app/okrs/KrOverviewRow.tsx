import styles from './okrs.module.css';
import { STATUS_ICON } from './StatusChip';
import { KeyResult, StatusValue } from './types';
import { computeKrProgress } from './utils';

interface KrOverviewRowProps {
  kr: KeyResult;
  status: StatusValue;
  onOpen: () => void;
}

export default function KrOverviewRow({ kr, status, onOpen }: KrOverviewRowProps) {
  const progress = Math.round(computeKrProgress(kr));
  const Icon = STATUS_ICON[status];

  return (
    <button type="button" className={styles.flatKrRow} onClick={onOpen}>
      <span className={styles.flatKrName}>{kr.shortTitle}</span>
      <span className={`${styles.flatKrPct} ${styles.statusValue} ${styles.mono}`} data-status={status}>
        <Icon size={13} />
        {progress}%
      </span>
    </button>
  );
}
