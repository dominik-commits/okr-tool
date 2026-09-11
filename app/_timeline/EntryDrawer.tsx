'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import styles from './timeline.module.css';
import { END_ISO, START_ISO, STATUS_LABEL, STATUS_OPTIONS, TYPE_LABEL, TYPE_OPTIONS } from './constants';
import { EntryStatus, EntryType, VacationEntry } from './types';
import { fmtDate, toDate, uid, weekLabel } from './utils';

interface EntryDrawerProps {
  mode: 'create' | 'view';
  entry: VacationEntry | null;
  allEntries: VacationEntry[];
  onClose: () => void;
  onSaveNew: (entry: VacationEntry) => void;
  onUpdate: (id: string, patch: Partial<VacationEntry>) => void;
  onDelete: (id: string) => void;
}

function daysBetween(start: string, end: string): number {
  return Math.round((toDate(end).getTime() - toDate(start).getTime()) / 86400000) + 1;
}

export default function EntryDrawer({ mode, entry, allEntries, onClose, onSaveNew, onUpdate, onDelete }: EntryDrawerProps) {
  const [editing, setEditing] = useState(mode === 'create');
  const [type, setType] = useState<EntryType>(entry?.type ?? 'project');
  const [label, setLabel] = useState(entry?.label ?? '');
  const [start, setStart] = useState(entry?.start ?? '');
  const [end, setEnd] = useState(entry?.end ?? '');
  const [status, setStatus] = useState<EntryStatus | ''>(entry?.status ?? '');
  const [owner, setOwner] = useState(entry?.owner ?? '');
  const [note, setNote] = useState(entry?.note ?? '');
  const [parentId, setParentId] = useState(entry?.parentId ?? '');
  const [error, setError] = useState('');

  const parentCandidates = allEntries.filter((e) => e.id !== entry?.id);

  function handleSave() {
    setError('');
    if (!label.trim() || !start || !end) {
      setError('Bitte Bezeichnung, Start und Ende ausfüllen.');
      return;
    }
    if (toDate(start) > toDate(end)) {
      setError('„Start" muss vor oder gleich „Ende" liegen.');
      return;
    }
    if (toDate(start) < toDate(START_ISO) || toDate(end) > toDate(END_ISO)) {
      setError(`Bitte im Zeitraum ${fmtDate(START_ISO)}–${fmtDate(END_ISO)} bleiben.`);
      return;
    }
    const patch: Partial<VacationEntry> = {
      type,
      label: label.trim(),
      start,
      end,
      status: status || undefined,
      owner: owner.trim() || undefined,
      note: note.trim() || undefined,
      parentId: parentId || null,
    };
    if (mode === 'create' || !entry) {
      onSaveNew({ id: uid(), ...(patch as Omit<VacationEntry, 'id'>) });
      onClose();
    } else {
      onUpdate(entry.id, patch);
      setEditing(false);
    }
  }

  function handleDuplicate() {
    if (!entry) return;
    onSaveNew({ ...entry, id: uid(), label: `${entry.label} (Kopie)` });
    onClose();
  }

  function handleDelete() {
    if (!entry) return;
    if (!confirm('Diesen Eintrag wirklich löschen?')) return;
    onDelete(entry.id);
    onClose();
  }

  const showForm = editing;

  return (
    <>
      <div className={styles.drawerOverlay} onClick={onClose} />
      <div className={styles.drawer}>
        <div className={styles.drawerHeader}>
          <div>
            <div className={styles.drawerEyebrow}>{mode === 'create' ? 'Neuer Eintrag' : TYPE_LABEL[entry!.type]}</div>
            <div className={styles.drawerTitle}>{mode === 'create' ? 'Eintrag erstellen' : entry!.label}</div>
          </div>
          <button type="button" className={styles.drawerClose} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.drawerBody}>
          {!showForm && entry && (
            <>
              <div className={styles.detailGrid}>
                <div>
                  <div className={styles.detailLabel}>Ebene</div>
                  <div className={styles.detailValue}>{TYPE_LABEL[entry.type]}</div>
                </div>
                <div>
                  <div className={styles.detailLabel}>Status</div>
                  <div className={styles.detailValue}>
                    {entry.status ? (
                      <span className={styles.statusBadge} data-status={entry.status}>
                        {STATUS_LABEL[entry.status]}
                      </span>
                    ) : (
                      '–'
                    )}
                  </div>
                </div>
                <div>
                  <div className={styles.detailLabel}>Zeitraum</div>
                  <div className={`${styles.detailValue} ${styles.mono}`}>
                    {fmtDate(entry.start)} – {fmtDate(entry.end)}
                  </div>
                </div>
                <div>
                  <div className={styles.detailLabel}>Dauer</div>
                  <div className={styles.detailValue}>
                    {daysBetween(entry.start, entry.end)} Tage · {weekLabel(entry.start)}
                  </div>
                </div>
                <div>
                  <div className={styles.detailLabel}>Owner</div>
                  <div className={styles.detailValue}>{entry.owner || '–'}</div>
                </div>
                <div>
                  <div className={styles.detailLabel}>Übergeordnet</div>
                  <div className={styles.detailValue}>{allEntries.find((e) => e.id === entry.parentId)?.label || '–'}</div>
                </div>
              </div>

              {entry.note && (
                <div>
                  <div className={styles.detailLabel} style={{ marginBottom: 6 }}>
                    Beschreibung
                  </div>
                  <div className={styles.detailNote}>{entry.note}</div>
                </div>
              )}

              <div className={styles.drawerActions}>
                <button type="button" className={styles.btnGhost} onClick={() => setEditing(true)}>
                  Bearbeiten
                </button>
                <button type="button" className={styles.btnGhost} onClick={handleDuplicate}>
                  Duplizieren
                </button>
                <button type="button" className={styles.btnDanger} onClick={handleDelete}>
                  Löschen
                </button>
              </div>
            </>
          )}

          {showForm && (
            <>
              <div className={styles.formField}>
                <label className={styles.formLabel}>Ebene</label>
                <select className={styles.formInput} value={type} onChange={(e) => setType(e.target.value as EntryType)}>
                  {TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>Bezeichnung</label>
                <input type="text" className={styles.formInput} value={label} maxLength={60} onChange={(e) => setLabel(e.target.value)} placeholder="z. B. Sommerurlaub" />
              </div>

              <div className={styles.formRow2}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Von</label>
                  <input type="date" className={styles.formInput} value={start} min={START_ISO} max={END_ISO} onChange={(e) => setStart(e.target.value)} />
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Bis</label>
                  <input type="date" className={styles.formInput} value={end} min={START_ISO} max={END_ISO} onChange={(e) => setEnd(e.target.value)} />
                </div>
              </div>

              <div className={styles.formRow2}>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Status</label>
                  <select className={styles.formInput} value={status} onChange={(e) => setStatus(e.target.value as EntryStatus | '')}>
                    <option value="">–</option>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.formField}>
                  <label className={styles.formLabel}>Verantwortlicher</label>
                  <input type="text" className={styles.formInput} value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="Name" />
                </div>
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>Übergeordnetes Projekt (optional)</label>
                <select className={styles.formInput} value={parentId} onChange={(e) => setParentId(e.target.value)}>
                  <option value="">–</option>
                  {parentCandidates.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formField}>
                <label className={styles.formLabel}>Notiz (optional)</label>
                <textarea className={`${styles.formInput} ${styles.formTextarea}`} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Kurze Beschreibung…" />
              </div>

              {error && <div className={styles.formError}>{error}</div>}

              <div className={styles.formActions}>
                <button type="button" className={styles.btnPrimary} onClick={handleSave} style={{ flex: 1 }}>
                  {mode === 'create' ? 'Erstellen' : 'Speichern'}
                </button>
                {mode === 'view' ? (
                  <button type="button" className={styles.btnGhost} onClick={() => setEditing(false)}>
                    Abbrechen
                  </button>
                ) : (
                  <button type="button" className={styles.btnGhost} onClick={onClose}>
                    Abbrechen
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
