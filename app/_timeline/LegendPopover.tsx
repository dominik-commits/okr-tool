import styles from './timeline.module.css';
import { SWIMLANES } from './constants';

export default function LegendPopover() {
  return (
    <div className={`${styles.popover} ${styles.popoverLegend}`}>
      <div className={styles.popoverTitle}>Ebenen</div>
      {SWIMLANES.map((lane) => (
        <div key={lane.id} className={styles.legendRow}>
          <span className={styles.legendSwatch} style={{ background: lane.soft, color: lane.color }}>
            {lane.icon}
          </span>
          {lane.label}
        </div>
      ))}

      <div className={styles.popoverTitle}>Hintergrund</div>
      <div className={styles.legendRow}>
        <span className={styles.legendDot} style={{ background: '#C9973E' }} />
        Gesetzlicher Feiertag
      </div>
      <div className={styles.legendRow}>
        <span className={styles.legendSwatch} style={{ background: 'rgba(193,89,75,0.18)', border: '1px solid rgba(193,89,75,0.4)' }} />
        Black Week / Black Friday / Cyber Monday
      </div>
      <div className={styles.legendRow}>
        <span className={styles.legendSwatch} style={{ background: 'rgba(139,121,217,0.12)' }} />
        Kampagnenstart / Sonderberichte
      </div>
    </div>
  );
}
