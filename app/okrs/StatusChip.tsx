import { CheckCircle2, AlertTriangle, XCircle, Clock, Circle } from 'lucide-react';
import styles from './okrs.module.css';
import { STATUS_LABEL } from './constants';
import { StatusValue } from './types';

const STATUS_ICON: Record<StatusValue, typeof CheckCircle2> = {
  on: CheckCircle2,
  risk: AlertTriangle,
  off: XCircle,
  needs_update: Clock,
  not_started: Circle,
};

interface StatusChipProps {
  status: StatusValue;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASS: Record<'sm' | 'md' | 'lg', string> = {
  sm: '',
  md: styles.statusChipMd,
  lg: styles.statusChipLg,
};

const ICON_SIZE: Record<'sm' | 'md' | 'lg', number> = { sm: 11, md: 12, lg: 14 };

export default function StatusChip({ status, size = 'sm' }: StatusChipProps) {
  const Icon = STATUS_ICON[status];
  return (
    <span className={`${styles.statusChip} ${SIZE_CLASS[size]}`} data-status={status}>
      <Icon size={ICON_SIZE[size]} />
      {STATUS_LABEL[status].toUpperCase()}
    </span>
  );
}
