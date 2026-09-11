import styles from './okrs.module.css';
import AttentionCard from './AttentionCard';
import { AttentionItem } from './attention';

interface YourAttentionProps {
  items: AttentionItem[];
  expectedProgress: number;
  onOpen: (item: AttentionItem) => void;
}

export default function YourAttention({ items, expectedProgress, onOpen }: YourAttentionProps) {
  if (!items.length) return null;

  return (
    <div className={styles.attentionSection}>
      <div className={styles.sectionTitle}>Your Attention</div>
      <div className={styles.attentionGrid}>
        {items.map((item) => (
          <AttentionCard key={item.kr.id} item={item} expectedProgress={expectedProgress} onOpen={() => onOpen(item)} />
        ))}
      </div>
    </div>
  );
}
