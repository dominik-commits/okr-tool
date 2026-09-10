import { CYCLE_DATE_RANGE, OVERDUE_DAYS_THRESHOLD, STATUS_OFF_GAP, STATUS_RISK_GAP } from './constants';
import { CycleId, Initiative, KeyResult, Objective, StatusValue } from './types';

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function isoToDe(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

export function todayStr(): string {
  return isoToDe(todayISO());
}

export function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v);
}

// ---------- progress / status ----------

export function computeKrProgress(kr: KeyResult): number {
  const { krType, currentValue, targetValue, baselineValue } = kr;

  if (krType === 'numeric_increase' || krType === 'percentage') {
    if (isFiniteNumber(currentValue) && isFiniteNumber(targetValue) && isFiniteNumber(baselineValue) && targetValue !== baselineValue) {
      return clamp01((currentValue - baselineValue) / (targetValue - baselineValue)) * 100;
    }
  }
  if (krType === 'numeric_decrease') {
    if (isFiniteNumber(currentValue) && isFiniteNumber(targetValue) && isFiniteNumber(baselineValue) && baselineValue !== targetValue) {
      return clamp01((baselineValue - currentValue) / (baselineValue - targetValue)) * 100;
    }
  }
  // milestone / binary / numeric types missing baseline+target: manually set progress is the source of truth
  return clamp01(Number(kr.progress || 0) / 100) * 100;
}

export function objProgress(o: Objective): number {
  if (!o.krs.length) return 0;
  const totalWeight = o.krs.reduce((s, k) => s + Number(k.weight || 0), 0);
  if (totalWeight <= 0) return 0;
  const sum = o.krs.reduce((s, k) => s + Number(k.weight || 0) * computeKrProgress(k), 0);
  return sum / totalWeight;
}

export function overallScore(objectives: Objective[]): number {
  const totalWeight = objectives.reduce((s, o) => s + Number(o.weight || 0), 0);
  if (totalWeight <= 0) return 0;
  const sum = objectives.reduce((s, o) => s + Number(o.weight || 0) * objProgress(o), 0);
  return sum / totalWeight;
}

export function cycleDateRange(cycleId: CycleId): { start: Date; end: Date } {
  const r = CYCLE_DATE_RANGE[cycleId];
  return { start: new Date(`${r.start}T00:00:00`), end: new Date(`${r.end}T23:59:59`) };
}

export function expectedProgressForCycle(cycleId: CycleId, now: Date = new Date()): number {
  const { start, end } = cycleDateRange(cycleId);
  const total = end.getTime() - start.getTime();
  if (total <= 0) return 100;
  const elapsed = now.getTime() - start.getTime();
  return clamp01(elapsed / total) * 100;
}

export function krHasAnyUpdate(kr: KeyResult): boolean {
  return (kr.history || []).length > 0 || (kr.updates || []).length > 0;
}

export function computeKrStatus(kr: KeyResult, expectedProgress: number): StatusValue {
  if (!krHasAnyUpdate(kr)) return 'nodata';
  const gap = computeKrProgress(kr) - expectedProgress;
  if (gap < -STATUS_OFF_GAP) return 'off';
  if (gap < -STATUS_RISK_GAP) return 'risk';
  return 'on';
}

const OBJECTIVE_STATUS_RANK: Record<StatusValue, number> = { off: 0, risk: 1, nodata: 2, on: 3 };

export function computeObjectiveStatus(o: Objective, expectedProgress: number): StatusValue {
  if (!o.krs.length) return 'nodata';
  const statuses = o.krs.map((k) => computeKrStatus(k, expectedProgress));
  if (statuses.every((s) => s === 'nodata')) return 'nodata';
  return statuses.reduce((worst, s) => (OBJECTIVE_STATUS_RANK[s] < OBJECTIVE_STATUS_RANK[worst] ? s : worst));
}

export function krTrend(kr: KeyResult): number {
  const h = kr.history || [];
  if (h.length < 2) return 0;
  return Math.round(h[h.length - 1].progress - h[h.length - 2].progress);
}

/** Returns the decline magnitude if progress dropped on every one of the last `count` updates, else null. */
export function consecutiveDeclineMagnitude(kr: KeyResult, count: number = 2): number | null {
  const h = kr.history || [];
  if (h.length < count + 1) return null;
  const tail = h.slice(-(count + 1));
  for (let i = 1; i < tail.length; i++) {
    if (tail[i].progress >= tail[i - 1].progress) return null;
  }
  return tail[0].progress - tail[tail.length - 1].progress;
}

// ---------- last-update / overdue ----------

function deDateToDate(de: string): Date | null {
  const parts = de.split('.');
  if (parts.length !== 3) return null;
  const [d, m, y] = parts;
  const date = new Date(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function isoDateToDate(iso: string): Date | null {
  if (!iso) return null;
  const date = new Date(`${iso}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function krLastUpdateDate(kr: KeyResult): Date | null {
  const dates: Date[] = [];
  (kr.history || []).forEach((h) => {
    const d = isoDateToDate(h.date);
    if (d) dates.push(d);
  });
  (kr.updates || []).forEach((u) => {
    const d = deDateToDate(u.date);
    if (d) dates.push(d);
  });
  if (!dates.length) return null;
  return new Date(Math.max(...dates.map((d) => d.getTime())));
}

export function daysSince(date: Date, now: Date = new Date()): number {
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

export function krIsOverdue(kr: KeyResult, thresholdDays: number = OVERDUE_DAYS_THRESHOLD, now: Date = new Date()): boolean {
  const last = krLastUpdateDate(kr);
  if (!last) return true;
  return daysSince(last, now) > thresholdDays;
}

export function formatLastUpdateLabel(kr: KeyResult, now: Date = new Date()): string {
  const last = krLastUpdateDate(kr);
  if (!last) return 'Noch kein Update';
  const days = daysSince(last, now);
  if (days <= 0) return 'Heute';
  if (days === 1) return 'vor 1 Tag';
  return `vor ${days} Tagen`;
}

// ---------- migration (fills in cockpit fields on old saved data, keeps everything else) ----------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function migrateKeyResult(raw: any): KeyResult {
  return {
    id: (raw.id as string) ?? uid(),
    text: raw.text ?? '',
    weight: Number(raw.weight) || 0,
    progress: Number(raw.progress) || 0,
    owner: raw.owner ?? '',
    department: raw.department ?? '',
    dependsOn: raw.dependsOn ?? '',
    project: raw.project ?? '',
    history: Array.isArray(raw.history) ? raw.history : [],
    updates: Array.isArray(raw.updates) ? raw.updates : [],
    krType: raw.krType ?? 'percentage',
    current: raw.current ?? '',
    currentValue: isFiniteNumber(raw.currentValue) ? raw.currentValue : null,
    target: raw.target ?? '',
    targetValue: isFiniteNumber(raw.targetValue) ? raw.targetValue : null,
    baseline: raw.baseline ?? '',
    baselineValue: isFiniteNumber(raw.baselineValue) ? raw.baselineValue : null,
    confidence: raw.confidence ?? 'Medium',
    blocker: raw.blocker ?? '',
    nextAction: raw.nextAction ?? '',
    initiatives: Array.isArray(raw.initiatives) ? (raw.initiatives as Initiative[]) : [],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function migrateObjective(raw: any): Objective {
  return {
    id: (raw.id as string) ?? uid(),
    title: raw.title ?? '',
    weight: Number(raw.weight) || 0,
    owner: raw.owner ?? '',
    krs: Array.isArray(raw.krs) ? raw.krs.map(migrateKeyResult) : [],
    expandedUpdates: (raw.expandedUpdates as Record<string, boolean>) ?? {},
  };
}
