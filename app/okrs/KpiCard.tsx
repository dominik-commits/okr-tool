import styles from './okrs.module.css';

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
}

export default function KpiCard({ label, value, sub, color }: KpiCardProps) {
  return (
    <div className={styles.kpiCard}>
      <div className={styles.kpiLabel}>{label}</div>
      <div className={`${styles.kpiValue} ${styles.mono}`} style={color ? { color } : undefined}>
        {value}
      </div>
      {sub && <div className={styles.kpiSub}>{sub}</div>}
    </div>
  );
}
