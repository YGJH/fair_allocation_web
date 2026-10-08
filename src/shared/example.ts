import type { Allocation, CaseInput } from '../domain/model';
import type { SurveyQuestionKey } from './survey';
import { scoreAllocation, toJsonScore, type JsonScore } from '../domain/score';

export type CuratedCaseKey = 'first' | SurveyQuestionKey;
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
  agents: ['Alice', 'Bob'],
  items: ['1', '2', '3'],
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
      agents: ['Alice', 'Bob'],
      items: ['1', '2', '3'],
      values: [[7, 4, 2], [7, 4, 2]],
    },
    [0, 1, 1],
  ),
  curated(
    'nonIdentical',
    '00000000-0000-4000-8000-000000000301',
    '00000000-0000-4000-8000-000000000302',
    {
      agents: ['Alice', 'Bob'],
      items: ['1', '2', '3'],
      values: [[60, 40, 0], [100, 1, 1]],
    },
    [0, 0, 1],
  ),
  curated(
    'challenge',
    '00000000-0000-4000-8000-000000000401',
    '00000000-0000-4000-8000-000000000402',
    {
      agents: ['Alice', 'Bob'],
      items: ['1', '2', '3', '4'],
      values: [[12, 9, 2, 1], [11, 10, 8, 1]],
    },
    [0, 1, 1, 0],
  ),
  curated(
    'optimalTension',
    '00000000-0000-4000-8000-000000000501',
    '00000000-0000-4000-8000-000000000502',
    {
      agents: ['Alice', 'Bob'],
      items: ['1', '2', '3'],
      values: [[4, 8, 1], [2, 10, 8]],
    },
    [0, 0, 1],
  ),
  curated(
    'equalButMovable',
    '00000000-0000-4000-8000-000000000601',
    '00000000-0000-4000-8000-000000000602',
    {
      agents: ['Alice', 'Bob'],
      items: ['1', '2', '3'],
      values: [[10, 10, 10], [10, 5, 5]],
    },
    [0, 1, 1],
  ),
];

export const PRACTICE_CASES = ['identical', 'nonIdentical', 'challenge'].map(
  (key) => CURATED_CASES.find((entry) => entry.key === key)!,
) as Array<CuratedCaseDefinition & { key: 'nonIdentical' | 'identical' | 'challenge' }>;

export const SURVEY_CASES = ['nonIdentical', 'optimalTension', 'equalButMovable', 'identical', 'challenge'].map(
  (key) => CURATED_CASES.find((entry) => entry.key === key)!,
) as Array<CuratedCaseDefinition & { key: SurveyQuestionKey }>;

export const FOLLOW_UP_CHALLENGE_CASES = ['optimalTension', 'equalButMovable'].map(
  (key) => CURATED_CASES.find((entry) => entry.key === key)!,
) as Array<CuratedCaseDefinition & { key: 'optimalTension' | 'equalButMovable' }>;

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
