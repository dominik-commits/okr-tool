'use client';

import { useState } from 'react';
import styles from './okrs.module.css';
import { CONFIDENCE_OPTIONS } from './constants';
import { Confidence, KeyResult } from './types';

export interface KrUpdateSubmission {
  whatChanged: string;
  confidence: Confidence;
  blocker: string;
  nextAction: string;
  current: string;
  currentValue: number | null;
  progress?: number;
}

interface UpdateKrFormProps {
  kr: KeyResult;
  onSubmit: (submission: KrUpdateSubmission) => void;
  onCancel: () => void;
}

const NUMERIC_TYPES = new Set(['numeric_increase', 'numeric_decrease', 'percentage']);

export default function UpdateKrForm({ kr, onSubmit, onCancel }: UpdateKrFormProps) {
  const [confidence, setConfidence] = useState<Confidence>(kr.confidence);
  const [whatChanged, setWhatChanged] = useState('');
  const [blocker, setBlocker] = useState(kr.blocker || '');
  const [nextAction, setNextAction] = useState(kr.nextAction || '');

  const [numericValue, setNumericValue] = useState(kr.currentValue != null ? String(kr.currentValue) : '');
  // For numeric types the display text starts blank so it can't silently go stale relative to a newly
  // entered number; for milestones it's the only value field, so prefill it with the current text.
  const [displayValue, setDisplayValue] = useState(kr.krType === 'milestone' ? kr.current || '' : '');
  const [milestoneProgress, setMilestoneProgress] = useState(kr.progress);
  const [achieved, setAchieved] = useState(kr.progress >= 100);

  function handleSubmit() {
    if (NUMERIC_TYPES.has(kr.krType)) {
      const parsed = numericValue.trim() === '' ? null : Number(numericValue.replace(',', '.'));
      onSubmit({
        whatChanged,
        confidence,
        blocker,
        nextAction,
        current: displayValue.trim() || (parsed != null ? String(parsed) : kr.current),
        currentValue: Number.isFinite(parsed) ? parsed : kr.currentValue,
      });
      return;
    }
    if (kr.krType === 'binary') {
      onSubmit({
        whatChanged,
        confidence,
        blocker,
        nextAction,
        current: achieved ? kr.target || 'Erreicht' : kr.baseline || 'Offen',
        currentValue: null,
        progress: achieved ? 100 : 0,
      });
      return;
    }
    // milestone
    onSubmit({
      whatChanged,
      confidence,
      blocker,
      nextAction,
      current: displayValue,
      currentValue: null,
      progress: clampPct(milestoneProgress),
    });
  }

  return (
    <div className={styles.updateForm}>
      {NUMERIC_TYPES.has(kr.krType) && (
        <div className={styles.formRow2}>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Aktueller Wert (Zahl)</label>
            <input
              type="number"
              className={styles.formInput}
              value={numericValue}
              onChange={(e) => setNumericValue(e.target.value)}
              placeholder={kr.targetValue != null ? String(kr.targetValue) : '0'}
            />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Anzeige (optional)</label>
            <input
              type="text"
              className={styles.formInput}
              value={displayValue}
              onChange={(e) => setDisplayValue(e.target.value)}
              placeholder={kr.current || 'z. B. 12,4 Mio. €'}
            />
          </div>
        </div>
      )}

      {kr.krType === 'milestone' && (
        <div className={styles.formRow2}>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Anzeige</label>
            <input
              type="text"
              className={styles.formInput}
              value={displayValue}
              onChange={(e) => setDisplayValue(e.target.value)}
              placeholder="z. B. Phase 3 / 4"
            />
          </div>
          <div className={styles.formField}>
            <label className={styles.formLabel}>Fortschritt (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              className={styles.formInput}
              value={milestoneProgress}
              onChange={(e) => setMilestoneProgress(Number(e.target.value) || 0)}
            />
          </div>
        </div>
      )}

      {kr.krType === 'binary' && (
        <div className={styles.formField}>
          <label className={styles.formLabel}>Status</label>
          <div className={styles.binaryToggleGroup}>
            <button
              type="button"
              className={`${styles.binaryToggleBtn} ${achieved ? styles.binaryToggleBtnActive : ''}`}
              onClick={() => setAchieved(true)}
            >
              Erreicht
            </button>
            <button
              type="button"
              className={`${styles.binaryToggleBtn} ${!achieved ? styles.binaryToggleBtnActive : ''}`}
              onClick={() => setAchieved(false)}
            >
              Nicht erreicht
            </button>
          </div>
        </div>
      )}

      <div className={styles.formField}>
        <label className={styles.formLabel}>Confidence</label>
        <div className={styles.confidenceGroup}>
          {CONFIDENCE_OPTIONS.map((c) => (
            <button
              key={c}
              type="button"
              className={`${styles.confidenceBtn} ${confidence === c ? styles.confidenceBtnActive : ''}`}
              onClick={() => setConfidence(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.formField}>
        <label className={styles.formLabel}>Was hat sich geändert?</label>
        <textarea
          rows={2}
          className={`${styles.formInput} ${styles.formTextarea}`}
          value={whatChanged}
          onChange={(e) => setWhatChanged(e.target.value)}
          placeholder="Kurz beschreiben, was sich seit dem letzten Update geändert hat…"
        />
      </div>

      <div className={styles.formField}>
        <label className={styles.formLabel}>Blocker (optional)</label>
        <input
          type="text"
          className={styles.formInput}
          value={blocker}
          onChange={(e) => setBlocker(e.target.value)}
          placeholder="Was blockiert gerade Fortschritt?"
        />
      </div>

      <div className={styles.formField}>
        <label className={styles.formLabel}>Next Action</label>
        <input
          type="text"
          className={styles.formInput}
          value={nextAction}
          onChange={(e) => setNextAction(e.target.value)}
          placeholder="Nächster konkreter Schritt"
        />
      </div>

      <div className={styles.formActions}>
        <button type="button" className={styles.btnPrimary} onClick={handleSubmit}>
          Save Update
        </button>
        <button type="button" className={styles.btnSecondary} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function clampPct(v: number): number {
  return Math.max(0, Math.min(100, v));
}
