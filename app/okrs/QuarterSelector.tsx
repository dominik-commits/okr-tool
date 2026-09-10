import styles from './okrs.module.css';
import { CYCLES } from './constants';
import { CycleId } from './types';

interface QuarterSelectorProps {
  activeCycle: CycleId;
  onChange: (id: CycleId) => void;
}

export default function QuarterSelector({ activeCycle, onChange }: QuarterSelectorProps) {
  return (
    <div className={styles.quarterGroup}>
      {CYCLES.map((c) => (
        <button
          key={c.id}
          type="button"
          className={`${styles.quarterPill} ${c.id === activeCycle ? styles.quarterPillActive : ''}`}
          onClick={() => onChange(c.id)}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
