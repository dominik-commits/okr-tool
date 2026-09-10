import styles from './okrs.module.css';
import { objProgress } from './utils';
import { Objective } from './types';

interface EvaluationPanelProps {
  objectives: Objective[];
}

export default function EvaluationPanel({ objectives }: EvaluationPanelProps) {
  if (!objectives.length) {
    return <div className={styles.empty}>Noch keine Daten für diesen Zyklus.</div>;
  }

  const deptMap: Record<string, { weight: number; weighted: number }> = {};
  objectives.forEach((o) =>
    o.krs.forEach((k) => {
      const d = (k.department || '').trim() || 'Nicht zugeordnet';
      if (!deptMap[d]) deptMap[d] = { weight: 0, weighted: 0 };
      deptMap[d].weight += Number(k.weight || 0);
      deptMap[d].weighted += Number(k.weight || 0) * Number(k.progress || 0);
    })
  );
  const deptEntries = Object.entries(deptMap)
    .filter(([, v]) => v.weight > 0)
    .sort((a, b) => b[1].weight - a[1].weight);
  const maxWeight = Math.max(...deptEntries.map(([, v]) => v.weight), 1);

  return (
    <>
      <div className={styles.evalIntro}>Balken = Zielgewicht am Gesamt-OKR · Füllung = erreichter Anteil</div>
      {objectives.map((o) => {
        const prog = objProgress(o);
        const achieved = ((o.weight * prog) / 100).toFixed(1);
        return (
          <div className={styles.evalRow} key={o.id}>
            <div className={styles.evalLabel} title={o.title}>
              {o.title.split(' — ')[0]}
            </div>
            <div className={styles.evalBarTrack}>
              <div className={styles.evalBarTarget} style={{ width: `${o.weight}%` }} />
              <div className={styles.evalBarFill} style={{ width: `${achieved}%` }} />
            </div>
            <div className={styles.evalPct}>
              {achieved}/{o.weight}%
            </div>
          </div>
        );
      })}

      {deptEntries.length > 0 && (
        <>
          <h2 className={styles.deptHeading}>Beitrag nach Abteilung</h2>
          {deptEntries.map(([dept, v]) => {
            const avgProg = v.weight ? Math.round(v.weighted / v.weight) : 0;
            return (
              <div className={styles.deptRow} key={dept}>
                <div className={styles.deptLabel}>{dept}</div>
                <div className={styles.deptBarTrack}>
                  <div className={styles.deptBarFill} style={{ width: `${((v.weight / maxWeight) * 100).toFixed(0)}%` }} />
                </div>
                <div className={styles.deptMeta}>
                  {v.weight.toFixed(0)}% Gewicht · Ø {avgProg}%
                </div>
              </div>
            );
          })}
        </>
      )}
    </>
  );
}
