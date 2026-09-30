import type { Allocation, CaseInput } from '../domain/model';
import { scoreAllocation, toJsonScore, type JsonScore } from '../domain/score';

export type CuratedCaseKey = 'first' | 'identical' | 'nonIdentical' | 'challenge';
export type CuratedCaseDefinition = {
  key: CuratedCaseKey;
  id: string;
  allocationId: string;
  caseData: CaseInput;
  owners: Allocation;
  score: JsonScore;
};

export const EXAMPLE_CASE_ID = '00000000-0000-4000-8000-000000000101';
export const EXAMPLE_ALLOCATION_ID = '00000000-0000-4000-8000-000000000102';

export const EXAMPLE_CASE: CaseInput = {
  agents: ['Maya', 'Leo'],
  items: ['Sketchbook', 'Lantern', 'Notebook'],
  values: [[8, 5, 2], [2, 6, 7]],
};

export const EXAMPLE_OWNERS: Allocation = [0, 1, 1];
export const EXAMPLE_SCORE = toJsonScore(scoreAllocation(EXAMPLE_CASE, EXAMPLE_OWNERS));

function curated(
  key: CuratedCaseKey,
  id: string,
  allocationId: string,
  caseData: CaseInput,
  owners: Allocation,
): CuratedCaseDefinition {
  return { key, id, allocationId, caseData, owners, score: toJsonScore(scoreAllocation(caseData, owners)) };
}

export const CURATED_CASES: CuratedCaseDefinition[] = [
  { key: 'first', id: EXAMPLE_CASE_ID, allocationId: EXAMPLE_ALLOCATION_ID, caseData: EXAMPLE_CASE, owners: EXAMPLE_OWNERS, score: EXAMPLE_SCORE },
  curated(
    'identical',
    '00000000-0000-4000-8000-000000000201',
    '00000000-0000-4000-8000-000000000202',
    {
      agents: ['Ari', 'Bo'],
      items: ['Tea set', 'Houseplant', 'Speaker'],
      values: [[7, 4, 2], [7, 4, 2]],
    },
    [0, 1, 1],
  ),
  curated(
    'nonIdentical',
    '00000000-0000-4000-8000-000000000301',
    '00000000-0000-4000-8000-000000000302',
    {
      agents: ['Nia', 'Omar'],
      items: ['Camera', 'Map', 'Blanket'],
      values: [[9, 3, 2], [2, 8, 6]],
    },
    [0, 1, 1],
  ),
  curated(
    'challenge',
    '00000000-0000-4000-8000-000000000401',
    '00000000-0000-4000-8000-000000000402',
    {
      agents: ['Iris', 'Kai'],
      items: ['Telescope', 'Keyboard', 'Tent', 'Cook set'],
      values: [[12, 9, 2, 1], [11, 10, 8, 1]],
    },
    [0, 1, 1, 0],
  ),
];

export const PRACTICE_CASES = CURATED_CASES.filter((entry) => entry.key !== 'first');

export function getCuratedCase(id: string) {
  return CURATED_CASES.find((entry) => entry.id === id) ?? null;
}

export function getCuratedAllocation(id: string) {
  return CURATED_CASES.find((entry) => entry.allocationId === id) ?? null;
}

export function isExampleCase(id: string) {
  return id === EXAMPLE_CASE_ID;
}

export function isExampleAllocation(id: string) {
  return id === EXAMPLE_ALLOCATION_ID;
}
