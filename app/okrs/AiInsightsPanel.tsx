import { Sparkles } from 'lucide-react';
import styles from './okrs.module.css';
import { Insight } from './aiInsights';

interface AiInsightsPanelProps {
  insights: Insight[];
}

export default function AiInsightsPanel({ insights }: AiInsightsPanelProps) {
  return (
    <div className={styles.aiPanel}>
      <div className={styles.aiHeader}>
        <Sparkles size={14} />
        <span>AI OKR Insights</span>
      </div>
      {insights.length === 0 ? (
        <div className={styles.aiHeadline}>Alles im grünen Bereich — keine besonderen Auffälligkeiten.</div>
      ) : (
        <>
          <div className={styles.aiHeadline}>
            {insights.length} {insights.length === 1 ? 'Ding braucht' : 'Dinge brauchen'} deine Aufmerksamkeit.
          </div>
          <ul className={styles.aiList}>
            {insights.map((insight) => (
              <li key={insight.id} className={styles.aiItem}>
                <span className={styles.aiBullet}>—</span>
                {insight.text}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
