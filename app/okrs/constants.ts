import { Confidence, CycleId, OkrState, StatusValue } from './types';

export const CYCLES: { id: CycleId; label: string }[] = [
  { id: 'c2026h2', label: 'H2 2026' },
  { id: 'c2027h1', label: 'H1 2027' },
  { id: 'c2027h2', label: 'H2 2027' },
];

export const CYCLE_DATE_RANGE: Record<CycleId, { start: string; end: string }> = {
  c2026h2: { start: '2026-07-01', end: '2026-12-31' },
  c2027h1: { start: '2027-01-01', end: '2027-06-30' },
  c2027h2: { start: '2027-07-01', end: '2027-12-31' },
};

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
  needs_update: 'Needs Update',
  not_started: 'Not Started',
};

/** Priority order for surfacing problems: worst first. */
export const ATTENTION_STATUS_ORDER: StatusValue[] = ['off', 'risk', 'needs_update'];
export const MAX_ATTENTION_ITEMS = 5;

export const CONFIDENCE_OPTIONS: Confidence[] = ['High', 'Medium', 'Low'];

export const NAV_ITEMS = ['Cockpit', 'Objectives', 'Initiatives', 'Review', 'History', 'Settings'];

export const OVERDUE_DAYS_THRESHOLD = 7;
export const STATUS_RISK_GAP = 5;
export const STATUS_OFF_GAP = 15;

export const SEED_H2_2026_ID = 'okr-2026h2-v1';

export const EMPTY_STATE: OkrState = {
  activeCycle: 'c2026h2',
  objectives: { c2026h2: [], c2027h1: [], c2027h2: [] },
  cycleHistory: { c2026h2: [], c2027h1: [], c2027h2: [] },
  seeds: [],
};
