import { ArrowLeft } from 'lucide-react';
import LogoutButton from '../../components/LogoutButton';
import styles from './okrs.module.css';
import { CYCLES } from './constants';
import { CycleId } from './types';

interface HeaderProps {
  onCockpit: boolean;
  onBack: () => void;
  activeCycle: CycleId;
  onCycleChange: (id: CycleId) => void;
}

export default function Header({ onCockpit, onBack, activeCycle, onCycleChange }: HeaderProps) {
  const cycleIndex = CYCLES.findIndex((c) => c.id === activeCycle);
  const cycleLabel = CYCLES[cycleIndex]?.label ?? '';

  function cycleNext() {
    const next = CYCLES[(cycleIndex + 1) % CYCLES.length];
    onCycleChange(next.id);
  }

  return (
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        {!onCockpit && (
          <button type="button" className={styles.backBtn} onClick={onBack} aria-label="Zurück">
            <ArrowLeft size={16} />
          </button>
        )}
        <span className={styles.brand}>OKR Command Center</span>
      </div>
      {onCockpit && (
        <div className={styles.headerRight}>
          <button type="button" className={styles.pill} onClick={cycleNext} title="Zyklus wechseln">
            {cycleLabel}
          </button>
          <span className={`${styles.pill} ${styles.pillMuted}`}>Marketing</span>
          <button type="button" className={styles.reviewBtn}>
            Start OKR Review
          </button>
          <LogoutButton />
        </div>
      )}
    </div>
  );
}
