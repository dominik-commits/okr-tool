import { Objective, StatusValue } from './types';
import { computeKrProgress, computeKrStatus, computeObjectiveStatus, consecutiveDeclineMagnitude, krIsOverdue } from './utils';

export interface ManagementInsight {
  cause: string;
  recommendation: string;
}

const PERFORMANCE_RANK: Record<StatusValue, number> = { off: 0, risk: 1, on: 2, needs_update: 3, not_started: 4 };

/**
 * One narrative insight for the cockpit: the most at-risk objective, its main driver KR, and a
 * recommendation. Prefers real performance problems (off/risk) over pure data-freshness gaps —
 * those are already surfaced as "Needs Update" attention items.
 */
export function buildManagementInsight(objectives: Objective[], expectedProgress: number): ManagementInsight | null {
  let worstObjective: { obj: Objective; status: StatusValue } | null = null;
  objectives.forEach((obj) => {
    const status = computeObjectiveStatus(obj, expectedProgress);
    if (status !== 'off' && status !== 'risk') return;
    if (!worstObjective || PERFORMANCE_RANK[status] < PERFORMANCE_RANK[worstObjective.status]) {
      worstObjective = { obj, status };
    }
  });

  if (worstObjective) {
    const wo: { obj: Objective; status: StatusValue } = worstObjective;
    const candidateKrs = wo.obj.krs
      .map((kr) => ({ kr, status: computeKrStatus(kr, expectedProgress) }))
      .filter(({ status }) => status === 'off' || status === 'risk')
      .sort((a, b) => computeKrProgress(a.kr) - computeKrProgress(b.kr));

    const driver = candidateKrs[0];
    if (!driver) return null;

    const severity = wo.status === 'off' ? 'akut gefährdet' : 'gefährdet';
    const decline = consecutiveDeclineMagnitude(driver.kr, 2);
    const trendClause = decline != null ? ` Der Wert ist seit zwei Updates in Folge gefallen.` : '';

    const other = wo.obj.krs.find((k) => k.id !== driver.kr.id && computeKrStatus(k, expectedProgress) === 'on');
    const contrastClause = other ? ` ${other.shortTitle} bleibt dagegen auf Kurs.` : '';

    return {
      cause: `${wo.obj.shortTitle} ist aktuell ${severity}. Haupttreiber ist ${driver.kr.shortTitle}.${contrastClause}${trendClause}`,
      recommendation: driver.kr.nextAction || 'Ursache im nächsten Review gemeinsam mit dem Owner klären.',
    };
  }

  // No real performance risk — check whether stale data is the dominant issue instead.
  const staleCount = objectives.reduce((sum, obj) => sum + obj.krs.filter((kr) => krIsOverdue(kr)).length, 0);
  if (staleCount > 0) {
    const staleObjective = objectives.find((obj) => obj.krs.some((kr) => krIsOverdue(kr)));
    return {
      cause: `${staleCount} Key Result${staleCount === 1 ? '' : 's'} ${staleCount === 1 ? 'ist' : 'sind'} seit über 7 Tagen ohne Update${
        staleObjective ? `, unter anderem bei ${staleObjective.shortTitle}` : ''
      }.`,
      recommendation: 'Verantwortliche zu einem kurzen Update vor der nächsten Review auffordern.',
    };
  }

  return null;
}
