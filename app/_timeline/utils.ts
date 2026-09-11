import { END_ISO, PX_PER_DAY, START_ISO } from './constants';
import { EntryType, VacationEntry } from './types';

const MS_DAY = 86400000;

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function toDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isoOf(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function addDays(iso: string, days: number): string {
  const d = toDate(iso);
  d.setDate(d.getDate() + days);
  return isoOf(d);
}

export function dayOffset(iso: string): number {
  return Math.round((toDate(iso).getTime() - toDate(START_ISO).getTime()) / MS_DAY);
}

export function px(iso: string): number {
  return dayOffset(iso) * PX_PER_DAY;
}

export function fmtDate(iso: string): string {
  return toDate(iso).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function daysInMonth(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate();
}

export function monthLabel(y: number, m: number): string {
  return toDate(`${y}-${String(m + 1).padStart(2, '0')}-01`).toLocaleDateString('de-DE', { month: 'short', year: '2-digit' });
}

export function isoWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const diff = d.getTime() - firstThursday.getTime();
  return 1 + Math.round(diff / (7 * MS_DAY));
}

export function weekLabel(iso: string): string {
  return `KW ${isoWeekNumber(toDate(iso))}`;
}

export const totalDays = Math.round((toDate(END_ISO).getTime() - toDate(START_ISO).getTime()) / MS_DAY) + 1;
export const trackWidth = totalDays * PX_PER_DAY;

export interface MonthCell {
  y: number;
  m: number;
  left: number;
  width: number;
}

export function buildMonths(): MonthCell[] {
  const months: MonthCell[] = [];
  let y = 2026;
  let m = 8;
  while (y < 2027 || (y === 2027 && m <= 11)) {
    const startStr = `${y}-${String(m + 1).padStart(2, '0')}-01`;
    months.push({ y, m, left: px(startStr), width: daysInMonth(y, m) * PX_PER_DAY });
    m++;
    if (m > 11) {
      m = 0;
      y++;
    }
  }
  return months;
}

export interface QuarterCell {
  label: string;
  left: number;
  width: number;
}

export function buildQuarters(): QuarterCell[] {
  const quarters: QuarterCell[] = [];
  let y = 2026;
  let q = 3; // Q3 2026 starts the visible range (Sep is in Q3)
  let cursorIso = START_ISO;
  while (toDate(cursorIso) <= toDate(END_ISO)) {
    const qStartMonth = (q - 1) * 3; // 0-indexed
    const qStartIso = `${y}-${String(qStartMonth + 1).padStart(2, '0')}-01`;
    const rangeStart = toDate(qStartIso) < toDate(START_ISO) ? START_ISO : qStartIso;
    let qEndY = y;
    let qEndM = qStartMonth + 2;
    if (qEndM > 11) {
      qEndM -= 12;
      qEndY += 1;
    }
    const qEndIso = `${qEndY}-${String(qEndM + 1).padStart(2, '0')}-${String(daysInMonth(qEndY, qEndM)).padStart(2, '0')}`;
    const rangeEnd = toDate(qEndIso) > toDate(END_ISO) ? END_ISO : qEndIso;
    quarters.push({
      label: `Q${q} ${y}`,
      left: px(rangeStart),
      width: px(rangeEnd) + PX_PER_DAY - px(rangeStart),
    });
    q++;
    if (q > 4) {
      q = 1;
      y++;
    }
    cursorIso = addDays(qEndIso, 1);
  }
  return quarters;
}

/** Greedy interval scheduling: assigns each entry a lane index so overlapping ranges never share one. */
export function computeLanes(items: VacationEntry[]): { laneOf: Record<string, number>; laneCount: number } {
  const sorted = [...items].sort((a, b) => dayOffset(a.start) - dayOffset(b.start));
  const laneEnds: number[] = [];
  const laneOf: Record<string, number> = {};
  sorted.forEach((item) => {
    const s = dayOffset(item.start);
    const e = dayOffset(item.end);
    let placed = false;
    for (let i = 0; i < laneEnds.length; i++) {
      if (laneEnds[i] < s) {
        laneOf[item.id] = i;
        laneEnds[i] = e;
        placed = true;
        break;
      }
    }
    if (!placed) {
      laneOf[item.id] = laneEnds.length;
      laneEnds.push(e);
    }
  });
  return { laneOf, laneCount: Math.max(laneEnds.length, 1) };
}

export function entriesOfTypes(entries: VacationEntry[], types: EntryType[]): VacationEntry[] {
  return entries.filter((e) => types.includes(e.type));
}

function rangesOverlap(a: VacationEntry, b: VacationEntry): boolean {
  return dayOffset(a.start) <= dayOffset(b.end) && dayOffset(a.end) >= dayOffset(b.start);
}

/** Counts overlapping pairs within a single list (meant to be called per swimlane). */
export function countOverlapPairs(entries: VacationEntry[]): number {
  let count = 0;
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      if (rangesOverlap(entries[i], entries[j])) count++;
    }
  }
  return count;
}

export function clampDateInput(iso: string): string {
  if (toDate(iso) < toDate(START_ISO)) return START_ISO;
  if (toDate(iso) > toDate(END_ISO)) return END_ISO;
  return iso;
}
