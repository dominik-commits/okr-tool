'use client';

import styles from './timeline.module.css';
import { CYCLES } from './constants';
import { CycleId } from './types';

interface PeriodPillsProps {
  active: CycleId | 'all';
  onSelect: (id: CycleId | 'all') => void;
}

export default function PeriodPills({ active, onSelect }: PeriodPillsProps) {
  return (
    <div className={styles.periodPills}>
      <button type="button" className={`${styles.periodPill} ${active === 'all' ? styles.periodPillActive : ''}`} onClick={() => onSelect('all')}>
        Gesamt
      </button>
      {CYCLES.map((c) => (
        <button
          key={c.id}
          type="button"
          className={`${styles.periodPill} ${active === c.id ? styles.periodPillActive : ''}`}
          onClick={() => onSelect(c.id)}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
