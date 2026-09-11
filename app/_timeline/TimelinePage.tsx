'use client';

import { useMemo, useRef, useState } from 'react';
import { Info } from 'lucide-react';
import styles from './timeline.module.css';
import { LABEL_WIDTH } from './constants';
import { defaultFilterState } from './FilterPopover';
import Header from './Header';
import PeriodPills from './PeriodPills';
import LegendPopover from './LegendPopover';
import StatusLine from './StatusLine';
import TimelineGrid from './TimelineGrid';
import EntryDrawer from './EntryDrawer';
import { useTimelineState } from './useTimelineState';
import { CycleId, FilterState, VacationEntry } from './types';
import { CYCLES } from './constants';
import { isoOf, px } from './utils';

type Selection = { mode: 'create' | 'view'; entry: VacationEntry | null };

export default function TimelinePage() {
  const { state, status, mutate } = useTimelineState();
  const [filters, setFilters] = useState<FilterState>(defaultFilterState());
  const [filterOpen, setFilterOpen] = useState(false);
  const [legendOpen, setLegendOpen] = useState(false);
  const [activePeriod, setActivePeriod] = useState<CycleId | 'all'>('all');
  const [selection, setSelection] = useState<Selection | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredEntries = useMemo(() => {
    return state.vacations.filter((e) => {
      if ((e.type === 'l1' || e.type === 'l2' || e.type === 'l3' || e.type === 'l4') && !filters.levels.includes(e.type)) return false;
      if ((e.type === 'vacation' || e.type === 'project') && !filters.kinds.includes(e.type)) return false;
      const statusKey = e.status ?? 'none';
      if (!filters.statuses.includes(statusKey)) return false;
      if (filters.owner.trim() && !(e.owner || '').toLowerCase().includes(filters.owner.trim().toLowerCase())) return false;
      return true;
    });
  }, [state.vacations, filters]);

  function handleSelectPeriod(id: CycleId | 'all') {
    setActivePeriod(id);
    const container = scrollRef.current;
    if (!container) return;
    if (id === 'all') {
      container.scrollLeft = 0;
      return;
    }
    const cycle = CYCLES.find((c) => c.id === id);
    if (cycle) container.scrollLeft = Math.max(px(cycle.start) - 12, 0);
  }

  function handleToday() {
    const container = scrollRef.current;
    if (!container) return;
    const todayIso = isoOf(new Date());
    const target = px(todayIso) - container.clientWidth / 2;
    container.scrollLeft = Math.max(target, 0);
  }

  function handleCreateNew(entry: VacationEntry) {
    mutate((draft) => {
      draft.vacations.push(entry);
    });
  }

  function handleUpdate(id: string, patch: Partial<VacationEntry>) {
    mutate((draft) => {
      const e = draft.vacations.find((v) => v.id === id);
      if (e) Object.assign(e, patch);
    });
    setSelection((sel) => (sel && sel.entry?.id === id ? { mode: 'view', entry: { ...sel.entry!, ...patch } } : sel));
  }

  function handleDelete(id: string) {
    mutate((draft) => {
      draft.vacations = draft.vacations.filter((v) => v.id !== id);
    });
  }

  return (
    <div className={styles.page} style={{ ['--label-width' as string]: `${LABEL_WIDTH}px` }}>
      <div className={styles.inner}>
        <Header
          filters={filters}
          onFiltersChange={setFilters}
          filterOpen={filterOpen}
          onToggleFilter={() => setFilterOpen((v) => !v)}
          onToday={handleToday}
          onCreate={() => setSelection({ mode: 'create', entry: null })}
        />

        <div className={styles.toolbar}>
          <PeriodPills active={activePeriod} onSelect={handleSelectPeriod} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <StatusLine entries={filteredEntries} />
            <div className={styles.popoverWrap}>
              {legendOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 29 }} onClick={() => setLegendOpen(false)} />}
              <button type="button" className={styles.iconBtn} title="Legende" onClick={() => setLegendOpen((v) => !v)}>
                <Info size={15} />
              </button>
              {legendOpen && <LegendPopover />}
            </div>
          </div>
        </div>

        <TimelineGrid entries={filteredEntries} onOpenEntry={(entry) => setSelection({ mode: 'view', entry })} scrollRef={scrollRef} />

        <div className={styles.toolbar} style={{ marginTop: 14, marginBottom: 0 }}>
          <span className={styles.saveStatus}>{status}</span>
        </div>
      </div>

      {selection && (
        <EntryDrawer
          key={selection.entry?.id ?? 'create'}
          mode={selection.mode}
          entry={selection.entry}
          allEntries={state.vacations}
          onClose={() => setSelection(null)}
          onSaveNew={handleCreateNew}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
