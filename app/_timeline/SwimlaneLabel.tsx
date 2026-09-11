import styles from './timeline.module.css';
import { SwimlaneDef } from './constants';

interface SwimlaneLabelProps {
  lane: SwimlaneDef;
  count: number;
  height: number;
}

export default function SwimlaneLabel({ lane, count, height }: SwimlaneLabelProps) {
  return (
    <div className={styles.laneLabel} style={{ height }}>
      <span className={styles.laneIcon} style={{ fontSize: lane.fontSize + 3 }}>
        {lane.icon}
      </span>
      <span className={styles.laneLabelText} style={{ fontSize: lane.fontSize, fontWeight: lane.fontWeight }}>
        {lane.label}
        {count > 0 && <span className={styles.laneCount}> · {count}</span>}
      </span>
    </div>
  );
}
