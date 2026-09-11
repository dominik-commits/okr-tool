import styles from './timeline.module.css';
import { BUSINESS_EVENTS, CAMPAIGN_EVENTS, HOLIDAYS } from './constants';
import { buildMonths, fmtDate, isoOf, px, toDate, trackWidthFor } from './utils';

const today = new Date();
today.setHours(0, 0, 0, 0);
const todayIso = isoOf(today);

interface BackgroundLayerProps {
  pxPerDay: number;
}

export default function BackgroundLayer({ pxPerDay }: BackgroundLayerProps) {
  const months = buildMonths(pxPerDay);
  const showToday = toDate(todayIso) >= toDate('2026-09-01') && toDate(todayIso) <= toDate('2027-12-31');

  return (
    <div className={styles.bgLayer} style={{ width: trackWidthFor(pxPerDay) }}>
      {months.map((m, i) => (
        <div
          key={`${m.y}-${m.m}`}
          className={`${styles.monthBg} ${i % 2 ? styles.monthBgOdd : ''}`}
          style={{ left: m.left, width: m.width }}
        />
      ))}

      {CAMPAIGN_EVENTS.map((ev, i) =>
        ev.type === 'band' ? (
          <div
            key={i}
            className={styles.campaignBandBg}
            style={{ left: px(ev.start, pxPerDay), width: px(ev.end, pxPerDay) + pxPerDay - px(ev.start, pxPerDay) }}
            title={`${ev.label} · ${fmtDate(ev.start)}–${fmtDate(ev.end)}`}
          />
        ) : (
          <div key={i} className={styles.campaignTickBg} style={{ left: px(ev.date, pxPerDay) }} title={`${ev.label} · ${fmtDate(ev.date)}`} />
        )
      )}

      {BUSINESS_EVENTS.map((ev, i) =>
        ev.type === 'band' ? (
          <div
            key={i}
            className={styles.businessBandBg}
            style={{ left: px(ev.start, pxPerDay), width: px(ev.end, pxPerDay) + pxPerDay - px(ev.start, pxPerDay) }}
            title={`${ev.label} · ${fmtDate(ev.start)}–${fmtDate(ev.end)}`}
          />
        ) : (
          <div key={i} className={styles.businessTickBg} style={{ left: px(ev.date, pxPerDay) }} title={`${ev.label} · ${fmtDate(ev.date)}`} />
        )
      )}

      {HOLIDAYS.map((h, i) => (
        <div key={i} className={styles.holidayBg} style={{ left: px(h.date, pxPerDay) }} title={`${h.name} · ${fmtDate(h.date)}`} />
      ))}

      {showToday && (
        <div className={styles.todayLine} style={{ left: px(todayIso, pxPerDay) }}>
          <span className={styles.todayLabel}>Heute</span>
        </div>
      )}
    </div>
  );
}
