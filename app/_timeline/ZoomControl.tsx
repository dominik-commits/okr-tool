'use client';

import { Minus, Plus } from 'lucide-react';
import styles from './timeline.module.css';
import { DEFAULT_PX_PER_DAY, ZOOM_LEVELS } from './constants';

interface ZoomControlProps {
  pxPerDay: number;
  onChange: (next: number) => void;
}

export default function ZoomControl({ pxPerDay, onChange }: ZoomControlProps) {
  const index = ZOOM_LEVELS.indexOf(pxPerDay);
  const atMin = index <= 0;
  const atMax = index === -1 || index >= ZOOM_LEVELS.length - 1;
  const percent = Math.round((pxPerDay / DEFAULT_PX_PER_DAY) * 100);

  function step(dir: -1 | 1) {
    const next = Math.min(Math.max(index + dir, 0), ZOOM_LEVELS.length - 1);
    onChange(ZOOM_LEVELS[next]);
  }

  return (
    <div className={styles.zoomControl}>
      <button type="button" className={styles.zoomBtn} disabled={atMin} onClick={() => step(-1)} title="Rauszoomen">
        <Minus size={13} />
      </button>
      <span className={styles.zoomLabel}>{percent}%</span>
      <button type="button" className={styles.zoomBtn} disabled={atMax} onClick={() => step(1)} title="Reinzoomen">
        <Plus size={13} />
      </button>
    </div>
  );
}
