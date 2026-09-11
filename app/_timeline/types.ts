/**
 * Same shape the old raw-HTML page persisted to /api/data (key "planungskompass-data") — status,
 * owner, note and parentId are new, optional fields added on top; nothing existing was renamed or
 * removed, so previously saved entries keep loading and rendering correctly.
 */
export type EntryType = 'vacation' | 'project' | 'l1' | 'l2' | 'l3' | 'l4';

export type EntryStatus = 'Planned' | 'In Progress' | 'Blocked' | 'Done';

export interface VacationEntry {
  id: string;
  type: EntryType;
  label: string;
  /** ISO date, e.g. "2026-09-28" */
  start: string;
  end: string;
  status?: EntryStatus;
  owner?: string;
  note?: string;
  /** id of another entry this one belongs under, e.g. an L4 Maßnahme linked to its L1 Kampagne. */
  parentId?: string | null;
}

export interface TimelineData {
  vacations: VacationEntry[];
  seeds: string[];
}

export type CycleId = 'c2026h2' | 'c2027h1' | 'c2027h2';

export interface Cycle {
  id: CycleId;
  label: string;
  hint: string;
  start: string;
  end: string;
  color: string;
  soft: string;
}

export type HolidayEvent = { date: string; name: string };

export type LevelType = 'l1' | 'l2' | 'l3' | 'l4';
export type KindType = 'vacation' | 'project';

export interface FilterState {
  levels: LevelType[];
  kinds: KindType[];
  statuses: (EntryStatus | 'none')[];
  owner: string;
}

export type CampaignEvent = { type: 'band'; label: string; start: string; end: string } | { type: 'point'; label: string; date: string };
