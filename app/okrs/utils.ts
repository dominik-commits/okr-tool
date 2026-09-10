import { Objective } from './types';

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

export function objProgress(o: Objective): number {
  if (!o.krs.length) return 0;
  const totalWeight = o.krs.reduce((s, k) => s + Number(k.weight || 0), 0);
  if (totalWeight <= 0) return 0;
  const sum = o.krs.reduce((s, k) => s + Number(k.weight || 0) * Number(k.progress || 0), 0);
  return sum / totalWeight;
}

export function overallScore(objectives: Objective[]): number {
  const totalWeight = objectives.reduce((s, o) => s + Number(o.weight || 0), 0);
  if (totalWeight <= 0) return 0;
  const sum = objectives.reduce((s, o) => s + Number(o.weight || 0) * objProgress(o), 0);
  return sum / totalWeight;
}

export function sparklinePath(points: number[], w: number, h: number, pad: number): string | null {
  if (points.length === 0) return null;
  if (points.length === 1) {
    const y = h - pad - (points[0] / 100) * (h - 2 * pad);
    return `M ${pad} ${y} L ${w - pad} ${y}`;
  }
  const step = (w - 2 * pad) / (points.length - 1);
  return points
    .map((p, i) => {
      const x = pad + i * step;
      const y = h - pad - (p / 100) * (h - 2 * pad);
      return (i === 0 ? 'M' : 'L') + ` ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');
}
