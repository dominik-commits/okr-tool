export type StatusValue = 'on' | 'risk' | 'off' | 'needs_update' | 'not_started';

export type CycleId = 'c2026h2' | 'c2027h1' | 'c2027h2';

export type KrType = 'numeric_increase' | 'numeric_decrease' | 'percentage' | 'milestone' | 'binary';

export type Confidence = 'High' | 'Medium' | 'Low';

export type InitiativeStatus = 'Planned' | 'In Progress' | 'Blocked' | 'Done';

export interface Initiative {
  name: string;
  status: InitiativeStatus;
}

export interface ProgressHistoryEntry {
  date: string;
  progress: number;
}

export interface UpdateEntry {
  id: string;
  date: string;
  text: string;
}

export interface KeyResult {
  id: string;
  text: string;
  /** Short label for compact displays (cockpit cards, attention list). Falls back to a truncated `text`. */
  shortTitle: string;
  weight: number;
  /** Manually-set fallback progress (0-100). For numeric KR types this is overridden by computeKrProgress(). */
  progress: number;
  owner: string;
  department: string;
  dependsOn: string;
  project: string;
  history: ProgressHistoryEntry[];
  updates: UpdateEntry[];

  krType: KrType;
  /** Display string, e.g. "11,2 Mio. €" */
  current: string;
  /** Numeric value used for progress calculation on numeric KR types */
  currentValue: number | null;
  target: string;
  targetValue: number | null;
  baseline: string;
  baselineValue: number | null;
  confidence: Confidence;
  blocker: string;
  nextAction: string;
  initiatives: Initiative[];
}

export interface Objective {
  id: string;
  title: string;
  /** Short label for compact displays (cockpit cards, attention list). Falls back to a truncated `title`. */
  shortTitle: string;
  weight: number;
  owner: string;
  krs: KeyResult[];
  expandedUpdates: Record<string, boolean>;
}

export interface CycleScoreEntry {
  date: string;
  score: number;
}

export type CycleMap<T> = Record<CycleId, T>;

export interface OkrState {
  activeCycle: CycleId;
  objectives: CycleMap<Objective[]>;
  cycleHistory: CycleMap<CycleScoreEntry[]>;
  seeds: string[];
}
