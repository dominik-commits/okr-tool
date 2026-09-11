'use client';

import { Filter, Plus } from 'lucide-react';
import LogoutButton from '../../components/LogoutButton';
import styles from './timeline.module.css';
import FilterPopover, { countActiveFilters } from './FilterPopover';
import { FilterState } from './types';

interface HeaderProps {
  filters: FilterState;
  onFiltersChange: (next: FilterState) => void;
  filterOpen: boolean;
  onToggleFilter: () => void;
  onToday: () => void;
  onCreate: () => void;
}

export default function Header({ filters, onFiltersChange, filterOpen, onToggleFilter, onToday, onCreate }: HeaderProps) {
  const activeFilterCount = countActiveFilters(filters);

  return (
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        <div className={styles.brandBlock}>
          <span className={styles.brand}>Planungskompass</span>
          <span className={styles.subtitle}>Zentrale Kampagnen- und Maßnahmenplanung · September 2026 – Dezember 2027</span>
        </div>
        <div className={styles.appTabs}>
          <span className={`${styles.appTab} ${styles.appTabActive}`}>Zeitstrahl</span>
          {/* Plain <a>, not next/link: keeps both switcher directions as real full navigations. */}
          <a href="/okrs" className={styles.appTab}>
            OKR Command Center
          </a>
        </div>
      </div>
      <div className={styles.headerRight}>
        <button type="button" className={styles.btnGhost} onClick={onToday}>
          Heute
        </button>
        <div className={styles.popoverWrap}>
          {filterOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 29 }} onClick={onToggleFilter} />}
          <button type="button" className={`${styles.btnGhost} ${filterOpen ? styles.btnGhostActive : ''}`} onClick={onToggleFilter}>
            <Filter size={13} style={{ marginRight: 6, marginBottom: -2 }} />
            Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </button>
          {filterOpen && <FilterPopover filters={filters} onChange={onFiltersChange} />}
        </div>
        <button type="button" className={styles.btnPrimary} onClick={onCreate}>
          <Plus size={14} style={{ marginRight: 6, marginBottom: -2 }} />
          Eintrag erstellen
        </button>
        <LogoutButton />
      </div>
    </div>
  );
}
