import { RefObject, useMemo, useRef } from 'react';
import styles from './timeline.module.css';
import { LABEL_WIDTH, SWIMLANES } from './constants';
import { VacationEntry } from './types';
import { buildMonths, buildQuarters, computeLanes, entriesOfTypes, trackWidthFor } from './utils';
import SwimlaneTrack, { ROW_PADDING, TRACK_GAP } from './Swimlane';
import SwimlaneLabel from './SwimlaneLabel';
import BackgroundLayer from './BackgroundLayer';

interface TimelineGridProps {
  entries: VacationEntry[];
  pxPerDay: number;
  onOpenEntry: (entry: VacationEntry) => void;
  scrollRef: RefObject<HTMLDivElement>;
}

/**
 * Frozen header + frozen left column, implemented with two auxiliary scroll containers whose
 * scrollLeft/scrollTop are mirrored from the one the user actually interacts with — not CSS
 * `position: sticky`. Sticky stopped tracking correctly once the user scrolled far horizontally in
 * this app's target browser, silently leaving the header/labels behind; plain synced scrollTop/Left
 * has none of that fragility.
 */
export default function TimelineGrid({ entries, pxPerDay, onOpenEntry, scrollRef }: TimelineGridProps) {
  const months = useMemo(() => buildMonths(pxPerDay), [pxPerDay]);
  const quarters = useMemo(() => buildQuarters(pxPerDay), [pxPerDay]);
  const trackWidth = trackWidthFor(pxPerDay);
  const headerScrollRef = useRef<HTMLDivElement>(null);
  const labelScrollRef = useRef<HTMLDivElement>(null);

  const laneData = useMemo(
    () =>
      SWIMLANES.map((lane) => {
        const laneEntries = entriesOfTypes(entries, lane.types);
        const { laneOf, laneCount } = computeLanes(laneEntries);
        const height = laneCount * (lane.barHeight + TRACK_GAP) - TRACK_GAP + ROW_PADDING * 2;
        return { lane, entries: laneEntries, laneOf, height };
      }),
    [entries]
  );

  function handleScroll() {
    const main = scrollRef.current;
    if (!main) return;
    if (headerScrollRef.current) headerScrollRef.current.scrollLeft = main.scrollLeft;
    if (labelScrollRef.current) labelScrollRef.current.scrollTop = main.scrollTop;
  }

  return (
    <div className={styles.gridShell}>
      <div className={styles.gridTopRow}>
        <div className={styles.corner}>Ebene</div>
        <div className={styles.headerScroll} ref={headerScrollRef}>
          <div className={styles.quarterRow} style={{ width: trackWidth }}>
            {quarters.map((q, i) => (
              <div key={i} className={styles.quarterCell} style={{ left: q.left, width: q.width }}>
                {q.label}
              </div>
            ))}
          </div>
          <div className={styles.monthHeaderRow} style={{ width: trackWidth }}>
            {months.map((m) => (
              <div key={`${m.y}-${m.m}`} className={`${styles.monthCell} ${m.m === 0 ? styles.monthCellYearStart : ''}`} style={{ left: m.left, width: m.width }}>
                <span className={styles.monthLabel}>
                  {new Date(m.y, m.m, 1).toLocaleDateString('de-DE', { month: 'short' }).toUpperCase()} {String(m.y).slice(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.gridBody}>
        <div className={styles.labelScroll} ref={labelScrollRef}>
          {laneData.map(({ lane, entries: laneEntries, height }) => (
            <SwimlaneLabel key={lane.id} lane={lane} count={laneEntries.length} height={height} />
          ))}
        </div>

        <div className={styles.scrollArea} ref={scrollRef} onScroll={handleScroll}>
          <div className={styles.canvas} style={{ width: trackWidth }}>
            <BackgroundLayer pxPerDay={pxPerDay} />
            {laneData.map(({ lane, entries: laneEntries, laneOf, height }) => (
              <SwimlaneTrack key={lane.id} lane={lane} entries={laneEntries} laneOf={laneOf} height={height} pxPerDay={pxPerDay} onOpenEntry={onOpenEntry} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
