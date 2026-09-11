import Link from 'next/link';
import LogoutButton from '../../components/LogoutButton';
import styles from './okrs.module.css';
import { CYCLES, NAV_ITEMS } from './constants';
import { CycleId } from './types';

const NAV_HREF: Partial<Record<(typeof NAV_ITEMS)[number], string>> = {
  Cockpit: '/okrs',
  Objectives: '/okrs/objectives',
};

interface HeaderProps {
  activeNav: 'Cockpit' | 'Objectives';
  showTopControls: boolean;
  activeCycle: CycleId;
  onCycleChange: (id: CycleId) => void;
}

export default function Header({ activeNav, showTopControls, activeCycle, onCycleChange }: HeaderProps) {
  const cycleIndex = CYCLES.findIndex((c) => c.id === activeCycle);
  const cycleLabel = CYCLES[cycleIndex]?.label ?? '';

  function cycleNext() {
    const next = CYCLES[(cycleIndex + 1) % CYCLES.length];
    onCycleChange(next.id);
  }

  return (
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        <div className={styles.appTabs}>
          {/* Plain <a>, not next/link: "/" is a raw HTML+script page (dangerouslySetInnerHTML) whose
              inline <script> only runs on a real navigation — a client-side Link transition inserts it
              via innerHTML, which browsers never execute, leaving the timeline stuck on "Lädt…". */}
          <a href="/" className={styles.appTab}>
            Zeitstrahl
          </a>
          <span className={`${styles.appTab} ${styles.appTabActive}`}>OKR Command Center</span>
        </div>
        <nav className={styles.nav}>
          {NAV_ITEMS.map((item) => {
            const href = NAV_HREF[item];
            const isActive = item === activeNav;
            if (href) {
              return (
                <Link
                  key={item}
                  href={href}
                  className={`${styles.navItem} ${styles.navLink} ${isActive ? styles.navItemActive : ''}`}
                >
                  {item}
                </Link>
              );
            }
            return (
              <span key={item} className={styles.navItem}>
                {item}
              </span>
            );
          })}
        </nav>
      </div>
      {showTopControls && (
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
