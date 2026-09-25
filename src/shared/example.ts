import type { Allocation, CaseInput } from '../domain/model';
import { scoreAllocation, toJsonScore } from '../domain/score';

export const EXAMPLE_CASE_ID = '00000000-0000-4000-8000-000000000101';
export const EXAMPLE_ALLOCATION_ID = '00000000-0000-4000-8000-000000000102';

export const EXAMPLE_CASE: CaseInput = {
  agents: ['Maya', 'Leo'],
  items: ['Sketchbook', 'Lantern', 'Notebook'],
  values: [[8, 5, 2], [2, 6, 7]],
};

export const EXAMPLE_OWNERS: Allocation = [0, 1, 1];
export const EXAMPLE_SCORE = toJsonScore(scoreAllocation(EXAMPLE_CASE, EXAMPLE_OWNERS));

export function isExampleCase(id: string) {
  return id === EXAMPLE_CASE_ID;
}

export function isExampleAllocation(id: string) {
  return id === EXAMPLE_ALLOCATION_ID;
}
