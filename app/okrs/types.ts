export type StatusValue = 'on' | 'risk' | 'off';

export type CycleId = 'c2026h2' | 'c2027h1' | 'c2027h2';

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
  weight: number;
  progress: number;
  status: StatusValue;
  owner: string;
  department: string;
  dependsOn: string;
  project: string;
  history: ProgressHistoryEntry[];
  updates: UpdateEntry[];
}

export interface Objective {
  id: string;
  title: string;
  weight: number;
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
