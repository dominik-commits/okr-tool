import styles from './okrs.module.css';
import { CYCLES } from './constants';
import { CycleId } from './types';

interface CycleTabsProps {
  activeCycle: CycleId;
  onChange: (id: CycleId) => void;
}

export default function CycleTabs({ activeCycle, onChange }: CycleTabsProps) {
  return (
    <div className={styles.cycleTabs}>
      {CYCLES.map((c) => (
        <button
          key={c.id}
          type="button"
          className={`${styles.cycleTab} ${c.id === activeCycle ? styles.cycleTabActive : ''}`}
          onClick={() => onChange(c.id)}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
