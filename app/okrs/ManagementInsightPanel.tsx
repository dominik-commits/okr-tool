import { Sparkles } from 'lucide-react';
import styles from './okrs.module.css';
import { ManagementInsight } from './managementInsight';

interface ManagementInsightPanelProps {
  insight: ManagementInsight | null;
}

export default function ManagementInsightPanel({ insight }: ManagementInsightPanelProps) {
  if (!insight) return null;

  return (
    <div className={styles.insightCard}>
      <div className={styles.insightHeader}>
        <Sparkles size={14} />
        <span>MANAGEMENT INSIGHT</span>
      </div>
      <p className={styles.insightCause}>{insight.cause}</p>
      <p className={styles.insightRecommendation}>
        <span className={styles.insightRecommendationLabel}>Empfehlung: </span>
        {insight.recommendation}
      </p>
    </div>
  );
}
