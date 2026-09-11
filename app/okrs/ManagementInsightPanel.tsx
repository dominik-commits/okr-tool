import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import styles from './okrs.module.css';
import { ManagementInsight } from './managementInsight';

interface ManagementInsightPanelProps {
  insight: ManagementInsight | null;
  open: boolean;
  onToggle: () => void;
}

export default function ManagementInsightPanel({ insight, open, onToggle }: ManagementInsightPanelProps) {
  if (!insight) return null;

  return (
    <div className={styles.insightCard}>
      <button type="button" className={styles.insightHeader} onClick={onToggle}>
        <span className={styles.insightHeaderLabel}>
          <Sparkles size={14} />
          <span>MANAGEMENT INSIGHT</span>
        </span>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {open && (
        <>
          <p className={styles.insightCause}>{insight.cause}</p>
          <p className={styles.insightRecommendation}>
            <span className={styles.insightRecommendationLabel}>Empfehlung: </span>
            {insight.recommendation}
          </p>
        </>
      )}
    </div>
  );
}
