import styles from './timeline.module.css';
import { CATEGORY_SHORT, STATUS_LABEL, TYPE_LABEL } from './constants';
import { SwimlaneDef } from './constants';
import { VacationEntry } from './types';
import { fmtDate, px, weekLabel } from './utils';

interface EntryBarProps {
  entry: VacationEntry;
  lane: SwimlaneDef;
  top: number;
  onOpen: () => void;
}

export default function EntryBar({ entry, lane, top, onOpen }: EntryBarProps) {
  const left = px(entry.start);
  const width = Math.max(px(entry.end) + 6 - left, 20);

  const showLong = width >= 190;
  const showLabel = width >= 34;

  const tooltip = [
    entry.label,
    `Ebene: ${TYPE_LABEL[entry.type]}`,
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
        background: lane.soft,
        borderColor: lane.color,
        color: lane.color,
        fontSize: lane.fontSize,
        fontWeight: lane.fontWeight,
      }}
    >
      {showLabel && (
        <span className={styles.entryBarLabel}>
          {showLong ? (
            <>
              {entry.label}
              <span className={styles.entryBarMeta}>
                · {weekLabel(entry.start)} · {CATEGORY_SHORT[entry.type]}
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
