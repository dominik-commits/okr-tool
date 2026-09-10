import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';
import styles from './okrs.module.css';
import { STATUS_LABEL } from './constants';
import { StatusValue } from './types';

const STATUS_ICON: Record<StatusValue, typeof CheckCircle2> = {
  on: CheckCircle2,
  risk: AlertTriangle,
  off: XCircle,
  nodata: HelpCircle,
};

interface StatusChipProps {
  status: StatusValue;
  size?: 'sm' | 'md';
}

export default function StatusChip({ status, size = 'sm' }: StatusChipProps) {
  const Icon = STATUS_ICON[status];
  return (
    <span className={`${styles.statusChip} ${size === 'md' ? styles.statusChipMd : ''}`} data-status={status}>
      <Icon size={size === 'sm' ? 11 : 13} />
      {STATUS_LABEL[status].toUpperCase()}
    </span>
  );
}
