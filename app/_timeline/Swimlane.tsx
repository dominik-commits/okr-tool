import styles from './timeline.module.css';
import { SwimlaneDef } from './constants';
import { VacationEntry } from './types';
import { trackWidth } from './utils';
import EntryBar from './EntryBar';

export const ROW_PADDING = 8;
export const TRACK_GAP = 6;

interface SwimlaneTrackProps {
  lane: SwimlaneDef;
  entries: VacationEntry[];
  laneOf: Record<string, number>;
  height: number;
  onOpenEntry: (entry: VacationEntry) => void;
}

export default function SwimlaneTrack({ lane, entries, laneOf, height, onOpenEntry }: SwimlaneTrackProps) {
  return (
    <div className={styles.laneTrack} style={{ width: trackWidth, height }}>
      {entries.map((entry) => (
        <EntryBar
          key={entry.id}
          entry={entry}
          lane={lane}
          top={ROW_PADDING + (laneOf[entry.id] || 0) * (lane.barHeight + TRACK_GAP)}
          onOpen={() => onOpenEntry(entry)}
        />
      ))}
    </div>
  );
}
