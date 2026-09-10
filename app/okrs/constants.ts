import { CycleId, OkrState, StatusValue } from './types';

export const CYCLES: { id: CycleId; label: string }[] = [
  { id: 'c2026h2', label: 'H2 2026' },
  { id: 'c2027h1', label: 'H1 2027' },
  { id: 'c2027h2', label: 'H2 2027' },
];

export const DEPARTMENTS = [
  'Marketing',
  'Performance Marketing',
  'CRM / E-Mail',
  'Social Media',
  'Design',
  'Content / Redaktion',
  'Produkt',
  'IT / Tech',
  'IT/KI',
  'Creator',
  'Finance',
  'Legal / Compliance',
  'W&U',
  'Support',
  'Buchhaltung',
];

export const STATUS_LABEL: Record<StatusValue, string> = {
  on: 'On Track',
  risk: 'At Risk',
  off: 'Off Track',
};

export const STATUS_ORDER: StatusValue[] = ['on', 'risk', 'off'];

export const SEED_H2_2026_ID = 'okr-2026h2-v1';

export const EMPTY_STATE: OkrState = {
  activeCycle: 'c2026h2',
  objectives: { c2026h2: [], c2027h1: [], c2027h2: [] },
  cycleHistory: { c2026h2: [], c2027h1: [], c2027h2: [] },
  seeds: [],
};
