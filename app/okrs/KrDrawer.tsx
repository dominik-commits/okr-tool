'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import styles from './okrs.module.css';
import ProgressBar from './ProgressBar';
import StatusChip from './StatusChip';
import UpdateKrForm, { KrUpdateSubmission } from './UpdateKrForm';
import { KeyResult, StatusValue } from './types';
import { computeKrProgress, formatLastUpdateLabel } from './utils';

interface KrDrawerProps {
  kr: KeyResult | null;
  status: StatusValue;
  expectedProgress: number;
  onClose: () => void;
  onSubmitUpdate: (submission: KrUpdateSubmission) => void;
}

export default function KrDrawer({ kr, status, expectedProgress, onClose, onSubmitUpdate }: KrDrawerProps) {
  const [showForm, setShowForm] = useState(false);

  if (!kr) return null;

  const progress = Math.round(computeKrProgress(kr));
  const history = kr.history || [];
  const maxHistory = Math.max(...history.map((h) => h.progress), 1);

  function handleSubmit(submission: KrUpdateSubmission) {
    onSubmitUpdate(submission);
    setShowForm(false);
  }

  return (
    <>
      <div className={styles.drawerOverlay} onClick={onClose} />
      <div className={styles.drawer}>
        <div className={styles.drawerHeader}>
          <div>
            <div className={styles.drawerId}>{kr.department || 'Key Result'}</div>
            <div className={styles.drawerTitle}>{kr.text}</div>
          </div>
          <button type="button" className={styles.drawerClose} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.drawerBody}>
          <div className={styles.drawerStatusRow}>
            <StatusChip status={status} size="md" />
            {status !== 'nodata' && <span className={styles.confidenceNote}>Confidence: {kr.confidence}</span>}
          </div>

          <div className={styles.drawerGrid2}>
            <div>
              <div className={styles.drawerFieldLabel}>Current</div>
              <div className={`${styles.drawerFieldValue} ${styles.mono}`}>{kr.current || '–'}</div>
            </div>
            <div>
              <div className={styles.drawerFieldLabel}>Target</div>
              <div className={`${styles.drawerFieldValue} ${styles.mono}`}>{kr.target || '–'}</div>
            </div>
          </div>

          <div>
            <div className={styles.drawerProgressHeader}>
              <span>Progress {progress}%</span>
              <span>Expected {Math.round(expectedProgress)}%</span>
            </div>
            <div style={{ marginTop: 8 }}>
              <ProgressBar value={progress} status={status} expected={expectedProgress} height={7} />
            </div>
          </div>

          {history.length > 0 && (
            <div>
              <div className={styles.drawerFieldLabel} style={{ marginBottom: 8 }}>
                Verlauf
              </div>
              <div className={styles.historyBars}>
                {history.map((h, i) => (
                  <div key={i} className={styles.historyBarCol}>
                    <div
                      className={styles.historyBar}
                      data-status={status}
                      style={{ height: `${Math.max((h.progress / maxHistory) * 100, 4)}%` }}
                    />
                    <span className={styles.historyBarLabel}>{h.date.slice(5).replace('-', '.')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.drawerGrid2}>
            <div>
              <div className={styles.drawerMetaLabel}>Owner</div>
              <div className={styles.drawerMetaValue}>{kr.owner || '—'}</div>
            </div>
            <div>
              <div className={styles.drawerMetaLabel}>Letztes Update</div>
              <div className={styles.drawerMetaValue}>{formatLastUpdateLabel(kr)}</div>
            </div>
          </div>

          {kr.blocker && (
            <div className={styles.blockerBox}>
              <div className={styles.blockerLabel}>
                <AlertTriangle size={13} /> Blocker
              </div>
              <div className={styles.blockerText}>{kr.blocker}</div>
            </div>
          )}

          {kr.nextAction && (
            <div>
              <div className={styles.drawerFieldLabel}>Next Action</div>
              <div className={styles.nextActionText}>{kr.nextAction}</div>
            </div>
          )}

          {kr.initiatives && kr.initiatives.length > 0 && (
            <div>
              <div className={styles.drawerFieldLabel} style={{ marginBottom: 8 }}>
                Linked Initiatives
              </div>
              <div className={styles.initiativesList}>
                {kr.initiatives.map((init, i) => (
                  <div className={styles.initiativeRow} key={i}>
                    <span className={styles.initiativeName}>{init.name}</span>
                    <span className={styles.initiativeStatus}>{init.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {kr.updates && kr.updates.length > 0 && (
            <div>
              <div className={styles.drawerFieldLabel} style={{ marginBottom: 8 }}>
                Update-Log
              </div>
              <div className={styles.initiativesList}>
                {kr.updates
                  .slice()
                  .reverse()
                  .map((u) => (
                    <div className={styles.initiativeRow} key={u.id}>
                      <span className={styles.initiativeName}>{u.text}</span>
                      <span className={styles.initiativeStatus}>{u.date}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className={styles.updateSection}>
            {!showForm ? (
              <button type="button" className={styles.updateTrigger} onClick={() => setShowForm(true)}>
                Update KR
              </button>
            ) : (
              <UpdateKrForm kr={kr} onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
