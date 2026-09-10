import { Objective, StatusValue } from './types';
import { computeKrProgress, computeKrStatus, computeObjectiveStatus, consecutiveDeclineMagnitude, krHasAnyUpdate } from './utils';

export interface Insight {
  id: string;
  tone: 'warning' | 'positive' | 'neutral';
  text: string;
}

const OBJECTIVE_STATUS_RANK: Record<StatusValue, number> = { off: 0, risk: 1, nodata: 2, on: 3 };

export function buildInsights(objectives: Objective[], expectedProgress: number): Insight[] {
  const insights: Insight[] = [];
  const flat = objectives.flatMap((o) => o.krs.map((kr) => ({ kr, obj: o })));

  const attentionCount = flat.filter(({ kr }) => {
    const s = computeKrStatus(kr, expectedProgress);
    return s === 'risk' || s === 'off';
  }).length;
  if (attentionCount > 0) {
    insights.push({
      id: 'attention',
      tone: 'warning',
      text: `${attentionCount} Key Result${attentionCount === 1 ? '' : 's'} ${
        attentionCount === 1 ? 'benötigt' : 'benötigen'
      } deine Aufmerksamkeit.`,
    });
  }

  let worstDecline: { text: string; magnitude: number } | null = null;
  flat.forEach(({ kr }) => {
    const mag = consecutiveDeclineMagnitude(kr, 2);
    if (mag != null && mag > 0 && (!worstDecline || mag > worstDecline.magnitude)) {
      worstDecline = { text: kr.text, magnitude: mag };
    }
  });
  if (worstDecline) {
    const w = worstDecline as { text: string; magnitude: number };
    insights.push({
      id: 'decline',
      tone: 'warning',
      text: `„${w.text}“ ist zwei Updates in Folge gefallen (−${Math.round(w.magnitude)} Punkte).`,
    });
  }

  let bestOutperformer: { text: string; gap: number } | null = null;
  flat.forEach(({ kr }) => {
    if (!krHasAnyUpdate(kr)) return;
    const gap = computeKrProgress(kr) - expectedProgress;
    if (gap > 10 && (!bestOutperformer || gap > bestOutperformer.gap)) {
      bestOutperformer = { text: kr.text, gap };
    }
  });
  if (bestOutperformer) {
    const b = bestOutperformer as { text: string; gap: number };
    insights.push({
      id: 'outperform',
      tone: 'positive',
      text: `„${b.text}“ liegt ${Math.round(b.gap)} Punkte über dem erwarteten Fortschritt.`,
    });
  }

  let worstObjective: { obj: Objective; status: StatusValue } | null = null;
  objectives.forEach((o) => {
    const status = computeObjectiveStatus(o, expectedProgress);
    if (!worstObjective || OBJECTIVE_STATUS_RANK[status] < OBJECTIVE_STATUS_RANK[worstObjective.status]) {
      worstObjective = { obj: o, status };
    }
  });
  if (worstObjective) {
    const wo = worstObjective as { obj: Objective; status: StatusValue };
    if (wo.status === 'off' || wo.status === 'risk') {
      const weakestWithBlocker = wo.obj.krs
        .filter((k) => k.blocker && k.blocker.trim())
        .sort((a, b) => computeKrProgress(a) - computeKrProgress(b))[0];
      if (weakestWithBlocker) {
        insights.push({
          id: 'cause',
          tone: 'neutral',
          text: `${wo.obj.title.split(' — ')[0]} wird vor allem durch „${weakestWithBlocker.blocker}“ gebremst.`,
        });
      }
    }
  }

  return insights;
}
