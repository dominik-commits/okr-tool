import { Check } from 'lucide-react';
import styles from './timeline.module.css';
import { CATEGORY_COLOR, CATEGORY_OPTIONS, SWIMLANES } from './constants';

export default function LegendPopover() {
  return (
    <div className={`${styles.popover} ${styles.popoverLegend}`}>
      <div className={styles.popoverTitle}>Kategorie (Balkenfarbe)</div>
      {CATEGORY_OPTIONS.map((category) => (
        <div key={category} className={styles.legendRow}>
          <span className={styles.legendDot} style={{ background: CATEGORY_COLOR[category].color }} />
          {category}
        </div>
      ))}

      <div className={styles.popoverTitle}>Status (Rand/Symbol)</div>
      <div className={styles.legendRow}>
        <span className={styles.legendStatusSample} style={{ borderStyle: 'dashed' }} />
        Geplant / Idee
      </div>
      <div className={styles.legendRow}>
        <span className={styles.legendStatusSample} style={{ borderStyle: 'solid' }} />
        In Umsetzung
      </div>
      <div className={styles.legendRow}>
        <span className={styles.legendStatusSample} style={{ borderStyle: 'solid', position: 'relative' }}>
          <span className={styles.legendDoneBadge}>
            <Check size={8} strokeWidth={3} color="#0d0f13" />
          </span>
        </span>
        Abgeschlossen
      </div>
      <div className={styles.legendRow}>
        <span className={styles.legendStatusSample} style={{ borderStyle: 'solid', opacity: 0.5 }} />
        Abgesagt / pausiert
      </div>

      <div className={styles.popoverTitle}>Ebenen (Zeile, Höhe, Typografie)</div>
      {SWIMLANES.map((lane) => (
        <div key={lane.id} className={styles.legendRow}>
          <span className={styles.legendIconSwatch}>{lane.icon}</span>
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
