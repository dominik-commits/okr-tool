import { Check } from 'lucide-react';
import styles from './timeline.module.css';
import { STATUS_LABEL, TYPE_LABEL, TYPE_SHORT, categoryColor } from './constants';
import { SwimlaneDef } from './constants';
import { VacationEntry } from './types';
import { fmtDate, px, weekLabel } from './utils';

interface EntryBarProps {
  entry: VacationEntry;
  lane: SwimlaneDef;
  top: number;
  pxPerDay: number;
  onOpen: () => void;
}

export default function EntryBar({ entry, lane, top, pxPerDay, onOpen }: EntryBarProps) {
  const left = px(entry.start, pxPerDay);
  const width = Math.max(px(entry.end, pxPerDay) + pxPerDay - left, 20);

  const showLong = width >= 190;
  const showLabel = width >= 34;

  const { color, soft } = categoryColor(entry.category);
  const dashed = entry.status === 'Planned';
  const faded = entry.status === 'Blocked';
  const done = entry.status === 'Done';

  const tooltip = [
    entry.label,
    `Ebene: ${TYPE_LABEL[entry.type]}`,
    `Kategorie: ${entry.category ?? 'nicht kategorisiert'}`,
    `${fmtDate(entry.start)} – ${fmtDate(entry.end)}`,
    entry.status ? `Status: ${STATUS_LABEL[entry.status]}` : null,
    entry.owner ? `Owner: ${entry.owner}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  return (
    <button
      type="button"
      className={styles.entryBar}
      data-tooltip={tooltip}
      onClick={onOpen}
      style={{
        left,
        width,
        top,
        height: lane.barHeight,
        background: soft,
        borderColor: color,
        borderStyle: dashed ? 'dashed' : 'solid',
        color,
        opacity: faded ? 0.55 : 1,
        fontSize: lane.fontSize,
        fontWeight: lane.fontWeight,
      }}
    >
      {done && (
        <span className={styles.entryBarDoneBadge} style={{ background: color }}>
          <Check size={9} strokeWidth={3} color="#0d0f13" />
        </span>
      )}
      {showLabel && (
        <span className={styles.entryBarLabel}>
          {showLong ? (
            <>
              {entry.label}
              <span className={styles.entryBarMeta}>
                · {weekLabel(entry.start)} · {TYPE_SHORT[entry.type]}
              </span>
            </>
          ) : (
            entry.label
          )}
        </span>
      )}
    </button>
  );
}
