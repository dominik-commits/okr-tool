'use client';

import { useState } from 'react';
import styles from './okrs.module.css';
import Sparkline from './Sparkline';
import { STATUS_LABEL, STATUS_ORDER } from './constants';
import { KeyResult } from './types';

interface KeyResultRowProps {
  kr: KeyResult;
  expanded: boolean;
  onChange: (patch: Partial<Pick<KeyResult, 'text' | 'owner' | 'department' | 'dependsOn' | 'project'>>) => void;
  onWeightChange: (value: number) => void;
  onProgressChange: (value: number) => void;
  onDelete: () => void;
  onStatusCycle: () => void;
  onToggleUpdates: () => void;
  onAddUpdate: (text: string) => void;
  onDeleteUpdate: (updateId: string) => void;
}

export default function KeyResultRow({
  kr,
  expanded,
  onChange,
  onWeightChange,
  onProgressChange,
  onDelete,
  onStatusCycle,
  onToggleUpdates,
  onAddUpdate,
  onDeleteUpdate,
}: KeyResultRowProps) {
  const [updateDraft, setUpdateDraft] = useState('');
  const history = (kr.history || []).map((h) => h.progress);
  const updates = (kr.updates || []).slice().reverse();

  function submitUpdate() {
    const text = updateDraft.trim();
    if (!text) return;
    onAddUpdate(text);
    setUpdateDraft('');
  }

  return (
    <div className={styles.kr}>
      <div className={styles.krRow}>
        <button
          type="button"
          className={styles.statusDot}
          data-status={kr.status}
          title={`${STATUS_LABEL[kr.status]} — klicken zum Ändern`}
          onClick={onStatusCycle}
        />
        <input
          type="text"
          className={`${styles.input} ${styles.focusRing} ${styles.krTextInput}`}
          value={kr.text}
          placeholder="Key Result"
          onChange={(e) => onChange({ text: e.target.value })}
        />
        <div className={styles.krWeight}>
          Gewicht{' '}
          <input
            type="number"
            min={0}
            max={100}
            className={`${styles.input} ${styles.focusRing} ${styles.krWeightInput}`}
            value={kr.weight}
            onChange={(e) => onWeightChange(Number(e.target.value) || 0)}
          />
          %
        </div>
        <input
          type="range"
          min={0}
          max={100}
          className={`${styles.krRangeInput} ${styles.focusRing}`}
          value={kr.progress}
          onChange={(e) => onProgressChange(Number(e.target.value))}
        />
        <span className={styles.krPct}>{kr.progress}%</span>
        <button type="button" className={styles.krDel} title="Entfernen" onClick={onDelete}>
          ×
        </button>
        <span className={styles.krSpark}>
          <Sparkline points={history} width={70} height={22} color="var(--teal)" />
        </span>
      </div>
      <div className={styles.krMeta}>
        <div className={styles.mfield}>
          <label className={styles.mfieldLabel}>Owner</label>
          <input
            type="text"
            className={`${styles.input} ${styles.focusRing} ${styles.mfieldInput}`}
            value={kr.owner || ''}
            placeholder="Name"
            onChange={(e) => onChange({ owner: e.target.value })}
          />
        </div>
        <div className={styles.mfield}>
          <label className={styles.mfieldLabel}>Abteilung</label>
          <input
            type="text"
            className={`${styles.input} ${styles.focusRing} ${styles.mfieldInput}`}
            value={kr.department || ''}
            placeholder="z. B. CRM"
            list="deptList"
            onChange={(e) => onChange({ department: e.target.value })}
          />
        </div>
        <div className={styles.mfield}>
          <label className={styles.mfieldLabel}>Abhängig von</label>
          <input
            type="text"
            className={`${styles.input} ${styles.focusRing} ${styles.mfieldInput}`}
            value={kr.dependsOn || ''}
            placeholder="z. B. IT, Design"
            onChange={(e) => onChange({ dependsOn: e.target.value })}
          />
        </div>
        <div className={styles.mfield}>
          <label className={styles.mfieldLabel}>Projekt / Kampagne</label>
          <input
            type="text"
            className={`${styles.input} ${styles.focusRing} ${styles.mfieldInput}`}
            value={kr.project || ''}
            placeholder="z. B. L1 Trefferquoten-Kampagne"
            onChange={(e) => onChange({ project: e.target.value })}
          />
        </div>
      </div>
      <button type="button" className={styles.updatesToggle} onClick={onToggleUpdates}>
        {expanded ? 'Status-Updates ausblenden' : `Status-Updates (${(kr.updates || []).length})`}
      </button>
      {expanded && (
        <div className={styles.updates}>
          {updates.map((u) => (
            <div className={styles.updateItem} key={u.id}>
              <span className={styles.uDate}>{u.date}</span>
              <span className={styles.uText}>{u.text}</span>
              <button type="button" className={styles.updateItemDel} title="Entfernen" onClick={() => onDeleteUpdate(u.id)}>
                ×
              </button>
            </div>
          ))}
          <div className={styles.updateAdd}>
            <input
              type="text"
              className={`${styles.input} ${styles.focusRing} ${styles.updateAddInput}`}
              placeholder="Neues Update…"
              maxLength={200}
              value={updateDraft}
              onChange={(e) => setUpdateDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  submitUpdate();
                }
              }}
            />
            <button type="button" className={styles.updateAddBtn} onClick={submitUpdate}>
              Hinzufügen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
