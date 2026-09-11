import styles from './okrs.module.css';
import { StatusValue } from './types';

interface ProgressBarProps {
  value: number;
  status?: StatusValue;
  /** Use the interactive accent color instead of a status color (e.g. the overall OKR Health bar). */
  accent?: boolean;
  height?: number;
}

export default function ProgressBar({ value, status, accent, height = 6 }: ProgressBarProps) {
  return (
    <div className={styles.progressTrack} style={{ height }}>
      <div
        className={`${styles.progressFill} ${accent ? styles.progressFillAccent : ''}`}
        data-status={accent ? undefined : status}
        style={{ width: `${Math.min(value, 100)}%`, height }}
      />
    </div>
  );
}
