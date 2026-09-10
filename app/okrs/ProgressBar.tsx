import styles from './okrs.module.css';
import { StatusValue } from './types';

interface ProgressBarProps {
  value: number;
  status: StatusValue;
  height?: number;
  expected?: number;
}

export default function ProgressBar({ value, status, height = 6, expected }: ProgressBarProps) {
  return (
    <div className={styles.progressTrack} style={{ height }}>
      <div className={styles.progressFill} data-status={status} style={{ width: `${Math.min(value, 100)}%`, height }} />
      {expected != null && (
        <div
          className={styles.progressExpected}
          style={{ left: `${Math.min(expected, 100)}%`, height: height + 6 }}
          title={`Erwarteter Fortschritt: ${Math.round(expected)}%`}
        />
      )}
    </div>
  );
}
