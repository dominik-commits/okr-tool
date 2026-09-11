'use client';

import styles from './timeline.module.css';
import { CATEGORY_OPTIONS, STATUS_LABEL, STATUS_OPTIONS, SWIMLANES } from './constants';
import { EntryCategory, EntryStatus, FilterState, KindType, LevelType } from './types';

const LEVELS: LevelType[] = ['l1', 'l2', 'l3', 'l4'];
const KINDS: { value: KindType; label: string }[] = [
  { value: 'vacation', label: 'Ferienzeitraum' },
  { value: 'project', label: 'Projekt' },
];

interface FilterPopoverProps {
  filters: FilterState;
  onChange: (next: FilterState) => void;
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export default function FilterPopover({ filters, onChange }: FilterPopoverProps) {
  return (
    <div className={styles.popover}>
      <div className={styles.popoverTitle}>Ebene</div>
      {LEVELS.map((level) => {
        const lane = SWIMLANES.find((s) => s.id === level);
        return (
          <label key={level} className={styles.checkRow}>
            <input type="checkbox" checked={filters.levels.includes(level)} onChange={() => onChange({ ...filters, levels: toggle(filters.levels, level) })} />
            {lane?.label ?? level}
          </label>
        );
      })}

      <div className={styles.popoverTitle}>Art (Sonderzeiträume)</div>
      {KINDS.map((kind) => (
        <label key={kind.value} className={styles.checkRow}>
          <input type="checkbox" checked={filters.kinds.includes(kind.value)} onChange={() => onChange({ ...filters, kinds: toggle(filters.kinds, kind.value) })} />
          {kind.label}
        </label>
      ))}

      <div className={styles.popoverTitle}>Kategorie</div>
      {CATEGORY_OPTIONS.map((category) => (
        <label key={category} className={styles.checkRow}>
          <input
            type="checkbox"
            checked={filters.categories.includes(category)}
            onChange={() => onChange({ ...filters, categories: toggle(filters.categories, category) })}
          />
          {category}
        </label>
      ))}
      <label className={styles.checkRow}>
        <input type="checkbox" checked={filters.categories.includes('none')} onChange={() => onChange({ ...filters, categories: toggle(filters.categories, 'none') })} />
        Nicht kategorisiert
      </label>

      <div className={styles.popoverTitle}>Status</div>
      {STATUS_OPTIONS.map((status) => (
        <label key={status} className={styles.checkRow}>
          <input type="checkbox" checked={filters.statuses.includes(status)} onChange={() => onChange({ ...filters, statuses: toggle(filters.statuses, status) })} />
          {STATUS_LABEL[status]}
        </label>
      ))}
      <label className={styles.checkRow}>
        <input type="checkbox" checked={filters.statuses.includes('none')} onChange={() => onChange({ ...filters, statuses: toggle(filters.statuses, 'none') })} />
        Ohne Status
      </label>

      <div className={styles.popoverTitle}>Owner</div>
      <input
        type="text"
        className={styles.filterOwnerInput}
        placeholder="Name enthält…"
        value={filters.owner}
        onChange={(e) => onChange({ ...filters, owner: e.target.value })}
      />
    </div>
  );
}

export function defaultFilterState(): FilterState {
  return {
    levels: ['l1', 'l2', 'l3', 'l4'],
    kinds: ['vacation', 'project'],
    statuses: [...STATUS_OPTIONS, 'none'] as (EntryStatus | 'none')[],
    categories: [...CATEGORY_OPTIONS, 'none'] as (EntryCategory | 'none')[],
    owner: '',
  };
}

export function countActiveFilters(filters: FilterState): number {
  let count = 0;
  count += 4 - filters.levels.length;
  count += 2 - filters.kinds.length;
  count += STATUS_OPTIONS.length + 1 - filters.statuses.length;
  count += CATEGORY_OPTIONS.length + 1 - filters.categories.length;
  if (filters.owner.trim()) count += 1;
  return count;
}
