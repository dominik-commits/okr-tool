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
  if (!krHasAnyUpdate(kr)) return 'not_started';
  if (krIsOverdue(kr)) return 'needs_update';
  const gap = computeKrProgress(kr) - expectedProgress;
  if (gap < -STATUS_OFF_GAP) return 'off';
  if (gap < -STATUS_RISK_GAP) return 'risk';
  return 'on';
}

export function computeObjectiveStatus(o: Objective, expectedProgress: number): StatusValue {
  if (!o.krs.length) return 'not_started';
  const statuses = o.krs.map((k) => computeKrStatus(k, expectedProgress));
  if (statuses.every((s) => s === 'not_started')) return 'not_started';
  // Stale data undermines any performance read on the objective, so it takes priority over off/risk.
  if (statuses.some((s) => s === 'needs_update')) return 'needs_update';
  const gap = objProgress(o) - expectedProgress;
  if (gap < -STATUS_OFF_GAP) return 'off';
  if (gap < -STATUS_RISK_GAP) return 'risk';
  return 'on';
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

const DE_MONTHS = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
];

/** Next occurrence of a weekday (0=Sun..6=Sat), formatted as "16. September". Used as a placeholder "next review" date. */
export function nextWeekdayLabel(targetDow: number = 2, now: Date = new Date()): string {
  const d = new Date(now);
  const diff = (targetDow - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return `${d.getDate()}. ${DE_MONTHS[d.getMonth()]}`;
}

export function formatLastUpdateLabel(kr: KeyResult, now: Date = new Date()): string {
  const last = krLastUpdateDate(kr);
  if (!last) return 'Noch kein Update';
  const days = daysSince(last, now);
  if (days <= 0) return 'Heute';
  if (days === 1) return 'vor 1 Tag';
  return `vor ${days} Tagen`;
}

// ---------- value formatting (Current / Expected Today / Target) ----------

/** Splits a display string like "20 Mio. €" into its unit suffix ("Mio. €"). */
function extractUnitSuffix(display: string): string {
  const match = display.match(/^[-+]?[\d.,]+\s*(.*)$/);
  return match ? match[1] : '';
}

function formatNumberDe(value: number, decimals: number): string {
  return value.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

/** Renders `value` in the same style as the KR's `target` display string (unit suffix + decimal precision). */
export function formatValueLikeTarget(kr: KeyResult, value: number): string {
  const decimals = isFiniteNumber(kr.targetValue) && Math.abs(kr.targetValue) < 10 ? 2 : 0;
  const suffix = extractUnitSuffix(kr.target || '');
  const formatted = formatNumberDe(value, decimals);
  return suffix ? `${formatted} ${suffix}` : formatted;
}

/**
 * The value (in the KR's own unit) that would be "on pace" today, interpolated between baseline and
 * target using the cycle's time-based expected progress. Null when there's no numeric baseline/target
 * to interpolate between (milestone/binary types) — callers should show the expected % instead.
 */
export function computeExpectedRawValue(kr: KeyResult, expectedProgress: number): number | null {
  const { krType, targetValue, baselineValue } = kr;
  if (!isFiniteNumber(targetValue) || !isFiniteNumber(baselineValue)) return null;
  const frac = clamp01(expectedProgress / 100);
  return krType === 'numeric_decrease' ? baselineValue - (baselineValue - targetValue) * frac : baselineValue + (targetValue - baselineValue) * frac;
}

/** "Expected Today" formatted the same way as the KR's `current`/`target` display strings. */
export function computeExpectedValueDisplay(kr: KeyResult, expectedProgress: number): string | null {
  const value = computeExpectedRawValue(kr, expectedProgress);
  return value == null ? null : formatValueLikeTarget(kr, value);
}

/**
 * A human-readable description of how far a KR is behind its expected pace — in the KR's own unit
 * for "count-like" targets (e.g. "3.100 Abonnenten hinter dem erwarteten Zielpfad"), or in progress
 * percentage points for ratio-like targets such as ROAS (e.g. "16 Prozentpunkte hinter Plan").
 */
export function describeGap(kr: KeyResult, expectedProgress: number): string | null {
  const progress = computeKrProgress(kr);
  const gapPoints = Math.round(expectedProgress - progress);
  if (gapPoints <= 0) return null;

  const isRatioLike = kr.krType === 'percentage' || (isFiniteNumber(kr.targetValue) && Math.abs(kr.targetValue) < 10);
  if (!isRatioLike) {
    const expectedValue = computeExpectedRawValue(kr, expectedProgress);
    if (expectedValue != null && isFiniteNumber(kr.currentValue)) {
      const gapValue = Math.round(Math.abs(expectedValue - kr.currentValue));
      const suffix = extractUnitSuffix(kr.target || '');
      const gapDisplay = suffix ? `${formatNumberDe(gapValue, 0)} ${suffix}` : formatNumberDe(gapValue, 0);
      return `${gapDisplay} hinter dem erwarteten Zielpfad`;
    }
  }
  return `${gapPoints} Prozentpunkt${gapPoints === 1 ? '' : 'e'} hinter Plan`;
}

// ---------- short labels ----------

/**
 * Derives a compact label from a longer sentence: takes the part before the first em-dash (our
 * "headline — rationale" convention), then hard-truncates. Deliberately does NOT split on ". " —
 * abbreviations like "Mio." or "z. B." contain that exact substring and would get chopped mid-word.
 */
export function deriveShortTitle(text: string, maxLength: number = 40): string {
  const firstClause = (text || '').split(' — ')[0].trim();
  if (firstClause.length <= maxLength) return firstClause;
  return `${firstClause.slice(0, maxLength - 1).trim()}…`;
}

/**
 * Parses a German-formatted display string ("1,12", "24.600", "20 Mio. €", "+15 %") into its leading
 * numeric value. '.' is treated as a thousands separator, ',' as the decimal separator — matching how
 * every current/target/baseline string in this app is written. Returns null when nothing parses.
 */
export function parseGermanNumber(display: string | null | undefined): number | null {
  if (!display) return null;
  const match = display.trim().match(/^[+-]?[\d.,]+/);
  if (!match) return null;
  const normalized = match[0].includes(',') ? match[0].replace(/\./g, '').replace(',', '.') : match[0].replace(/\./g, '');
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

// ---------- ISO week labels (for the drawer's history chart) ----------

export function isoWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const diff = d.getTime() - firstThursday.getTime();
  return 1 + Math.round(diff / (7 * 24 * 60 * 60 * 1000));
}

export function isoWeekLabel(iso: string): string {
  const d = isoDateToDate(iso);
  if (!d) return iso;
  return `KW${isoWeekNumber(d)}`;
}

// ---------- migration (fills in cockpit fields on old saved data, keeps everything else) ----------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function migrateKeyResult(raw: any): KeyResult {
  const text = raw.text ?? '';
  const current = raw.current ?? '';
  const target = raw.target ?? '';
  const baseline = raw.baseline ?? '';
  return {
    id: (raw.id as string) ?? uid(),
    text,
    shortTitle: raw.shortTitle || deriveShortTitle(text, 28),
    weight: Number(raw.weight) || 0,
    progress: Number(raw.progress) || 0,
    owner: raw.owner ?? '',
    department: raw.department ?? '',
    dependsOn: raw.dependsOn ?? '',
    project: raw.project ?? '',
    history: Array.isArray(raw.history) ? raw.history : [],
    updates: Array.isArray(raw.updates) ? raw.updates : [],
    krType: raw.krType ?? 'percentage',
    // Keep the original display string untouched; only backfill the numeric fields used for progress
    // calculation, and only when they're missing — never overwrite an already-migrated value.
    current,
    currentValue: isFiniteNumber(raw.currentValue) ? raw.currentValue : parseGermanNumber(current),
    target,
    targetValue: isFiniteNumber(raw.targetValue) ? raw.targetValue : parseGermanNumber(target),
    baseline,
    baselineValue: isFiniteNumber(raw.baselineValue) ? raw.baselineValue : parseGermanNumber(baseline),
    confidence: raw.confidence ?? 'Medium',
    blocker: raw.blocker ?? '',
    nextAction: raw.nextAction ?? '',
    initiatives: Array.isArray(raw.initiatives) ? (raw.initiatives as Initiative[]) : [],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function migrateObjective(raw: any): Objective {
  const title = raw.title ?? '';
  return {
    id: (raw.id as string) ?? uid(),
    title,
    shortTitle: raw.shortTitle || deriveShortTitle(title, 24),
    weight: Number(raw.weight) || 0,
    owner: raw.owner ?? '',
    krs: Array.isArray(raw.krs) ? raw.krs.map(migrateKeyResult) : [],
    expandedUpdates: (raw.expandedUpdates as Record<string, boolean>) ?? {},
  };
}
