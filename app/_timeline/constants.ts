import { CampaignEvent, Cycle, EntryCategory, EntryStatus, EntryType, HolidayEvent } from './types';

export const START_ISO = '2026-09-01';
export const END_ISO = '2027-12-31';

export const DEFAULT_PX_PER_DAY = 6;
/** Discrete zoom steps: 2 fits the whole Sep 26–Dec 27 range without scrolling; 40 is a week-level view. */
export const ZOOM_LEVELS = [2, 3, 4, 6, 8, 12, 18, 26, 40];

/** Frozen left column width (swimlane labels). */
export const LABEL_WIDTH = 176;

export const HOLIDAYS: HolidayEvent[] = [
  { date: '2026-10-03', name: 'Tag der Deutschen Einheit' },
  { date: '2026-12-25', name: '1. Weihnachtsfeiertag' },
  { date: '2026-12-26', name: '2. Weihnachtsfeiertag' },
  { date: '2027-01-01', name: 'Neujahr' },
  { date: '2027-03-26', name: 'Karfreitag' },
  { date: '2027-03-29', name: 'Ostermontag' },
  { date: '2027-05-01', name: 'Tag der Arbeit' },
  { date: '2027-05-06', name: 'Christi Himmelfahrt' },
  { date: '2027-05-17', name: 'Pfingstmontag' },
  { date: '2027-10-03', name: 'Tag der Deutschen Einheit' },
  { date: '2027-12-25', name: '1. Weihnachtsfeiertag' },
  { date: '2027-12-26', name: '2. Weihnachtsfeiertag' },
];

export const CAMPAIGN_EVENTS: CampaignEvent[] = [
  { type: 'band', label: 'Black Week', start: '2026-11-23', end: '2026-11-29' },
  { type: 'point', label: 'Black Friday', date: '2026-11-27' },
  { type: 'point', label: 'Cyber Monday', date: '2026-11-30' },
  { type: 'band', label: 'Black Week', start: '2027-11-22', end: '2027-11-28' },
  { type: 'point', label: 'Black Friday', date: '2027-11-26' },
  { type: 'point', label: 'Cyber Monday', date: '2027-11-29' },
];

function monthlyCampaignStarts(): CampaignEvent[] {
  const events: CampaignEvent[] = [];
  let y = 2026;
  let m = 8;
  while (y < 2027 || (y === 2027 && m <= 11)) {
    events.push({ type: 'point', label: 'Kampagnenstart · Rabattaktion', date: `${y}-${String(m + 1).padStart(2, '0')}-01` });
    m++;
    if (m > 11) {
      m = 0;
      y++;
    }
  }
  return events;
}

export const BUSINESS_EVENTS: CampaignEvent[] = [
  ...monthlyCampaignStarts(),
  { type: 'band', label: 'Sonderberichte 2027', start: '2027-01-15', end: '2027-02-15' },
];

export const CYCLES: Cycle[] = [
  { id: 'c2026h2', label: 'H2 2026', hint: 'ab September', start: '2026-09-01', end: '2026-12-31', color: '#C9973E', soft: 'rgba(201,151,62,0.16)' },
  { id: 'c2027h1', label: 'H1 2027', hint: 'Jan–Jun', start: '2027-01-01', end: '2027-06-30', color: '#4C948C', soft: 'rgba(76,148,140,0.16)' },
  { id: 'c2027h2', label: 'H2 2027', hint: 'Jul–Dez', start: '2027-07-01', end: '2027-12-31', color: '#C1594B', soft: 'rgba(193,89,75,0.16)' },
];

export const SEED_PROJECT_ID = 'indizeswandel-project';

/**
 * Ebene (L1–L4) no longer carries its own color — that's the bar's category now. The swimlane row
 * itself plus bar height and typography/icon size are what still communicate level, so this def has
 * no color/soft fields anymore.
 */
export interface SwimlaneDef {
  id: string;
  label: string;
  icon: string;
  types: EntryType[];
  barHeight: number;
  fontSize: number;
  fontWeight: number;
}

export const SWIMLANES: SwimlaneDef[] = [
  { id: 'l1', label: 'L1 Kampagnen', icon: '🚩', types: ['l1'], barHeight: 30, fontSize: 13, fontWeight: 600 },
  { id: 'l2', label: 'L2 Initiativen', icon: '◆', types: ['l2'], barHeight: 26, fontSize: 12.5, fontWeight: 500 },
  { id: 'l3', label: 'L3 Aktionen', icon: '⚡', types: ['l3'], barHeight: 23, fontSize: 12, fontWeight: 500 },
  { id: 'l4', label: 'L4 Maßnahmen', icon: '●', types: ['l4'], barHeight: 20, fontSize: 11.5, fontWeight: 400 },
  { id: 'special', label: 'Sonderzeiträume', icon: '◐', types: ['vacation', 'project'], barHeight: 24, fontSize: 12, fontWeight: 500 },
];

/**
 * Category is the bar's main color now. Picked to stay clearly apart from the special-period
 * background tones (gold holiday ticks, coral Black Week/Friday) and from each other.
 */
export const CATEGORY_OPTIONS: EntryCategory[] = ['Umsatzkampagne', 'Kommunikationskampagne', 'Reichweitenkampagne', 'Infrastruktur'];

export const CATEGORY_COLOR: Record<EntryCategory, { color: string; soft: string }> = {
  Umsatzkampagne: { color: '#5FB878', soft: 'rgba(95, 184, 120, 0.22)' },
  Kommunikationskampagne: { color: '#5B8DEF', soft: 'rgba(91, 141, 239, 0.22)' },
  Reichweitenkampagne: { color: '#D9599A', soft: 'rgba(217, 89, 154, 0.22)' },
  Infrastruktur: { color: '#8B96AE', soft: 'rgba(139, 150, 174, 0.22)' },
};

export const UNCATEGORIZED_COLOR = { color: '#6E7684', soft: 'rgba(110, 118, 132, 0.16)' };

export function categoryColor(category: EntryCategory | undefined): { color: string; soft: string } {
  return category ? CATEGORY_COLOR[category] : UNCATEGORIZED_COLOR;
}

export const TYPE_LABEL: Record<EntryType, string> = {
  vacation: 'Ferienzeitraum',
  project: 'Projekt',
  l1: 'L1 – Kampagne',
  l2: 'L2 – Initiative',
  l3: 'L3 – Aktion',
  l4: 'L4 – Maßnahme',
};

export const TYPE_OPTIONS: { value: EntryType; label: string }[] = [
  { value: 'vacation', label: 'Ferienzeitraum' },
  { value: 'project', label: 'Projekt' },
  { value: 'l1', label: '🚩 L1 – Kampagne' },
  { value: 'l2', label: '◆ L2 – Initiative' },
  { value: 'l3', label: '⚡ L3 – Aktion' },
  { value: 'l4', label: '● L4 – Maßnahme' },
];

/** Short word for the entry's *level* (not to be confused with EntryCategory). Used in the bar's long-form label. */
export const TYPE_SHORT: Record<EntryType, string> = {
  vacation: 'Ferien',
  project: 'Projekt',
  l1: 'Kampagne',
  l2: 'Initiative',
  l3: 'Aktion',
  l4: 'Maßnahme',
};

export const STATUS_OPTIONS: EntryStatus[] = ['Planned', 'In Progress', 'Blocked', 'Done'];

export const STATUS_LABEL: Record<EntryStatus, string> = {
  Planned: 'Geplant',
  'In Progress': 'In Arbeit',
  Blocked: 'Blockiert',
  Done: 'Erledigt',
};
