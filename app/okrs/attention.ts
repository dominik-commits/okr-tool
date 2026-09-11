import { ATTENTION_STATUS_ORDER, MAX_ATTENTION_ITEMS } from './constants';
import { KeyResult, Objective, StatusValue } from './types';
import { computeKrStatus } from './utils';

export interface AttentionItem {
  kr: KeyResult;
  objective: Objective;
  objectiveIndex: number;
  status: StatusValue;
}

export function buildAttentionItems(objectives: Objective[], expectedProgress: number): AttentionItem[] {
  const items: AttentionItem[] = [];
  objectives.forEach((objective, objectiveIndex) => {
    objective.krs.forEach((kr) => {
      const status = computeKrStatus(kr, expectedProgress);
      if (status === 'off' || status === 'risk' || status === 'needs_update') {
        items.push({ kr, objective, objectiveIndex, status });
      }
    });
  });
  items.sort((a, b) => ATTENTION_STATUS_ORDER.indexOf(a.status) - ATTENTION_STATUS_ORDER.indexOf(b.status));
  return items.slice(0, MAX_ATTENTION_ITEMS);
}
