import { beforeEach, expect, test, vi } from 'vitest';

const { query } = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock('../src/server/db', () => ({ query, withClient: vi.fn() }));

import { getAllocation, getAllocationStanding, getCase, listAllocations } from '../src/server/repository';
import { scoreAllocation } from '../src/domain/score';
import { EXAMPLE_ALLOCATION_ID, EXAMPLE_CASE_ID, EXAMPLE_SCORE, SURVEY_CASES } from '../src/shared/example';

beforeEach(() => query.mockReset());

test('curated pages resolve even before the seed rows are available', async () => {
  query.mockResolvedValue({ rowCount: 0, rows: [] });
  expect(await getCase(EXAMPLE_CASE_ID)).toMatchObject({ agents: ['Alice', 'Bob'], items: ['1', '2', '3'] });
  expect(await getAllocation(EXAMPLE_ALLOCATION_ID)).toMatchObject({ nsw: EXAMPLE_SCORE.nsw, owners: [0, 1, 1] });
  expect(await listAllocations(EXAMPLE_CASE_ID)).toHaveLength(1);
});

test('the opening survey cases separate EF1, EFX, and optimal NSW', () => {
  const maximumNsw = (index: number) => {
    const entry = SURVEY_CASES[index];
    return Array.from({ length: 2 ** entry.caseData.items.length }, (_, mask) =>
      scoreAllocation(entry.caseData, entry.caseData.items.map((_, item) => (mask >> item) & 1)).nsw,
    ).reduce((maximum, nsw) => BigInt(nsw) > BigInt(maximum) ? nsw : maximum, '0');
  };

  expect(SURVEY_CASES[0]).toMatchObject({
    key: 'nonIdentical',
    owners: [0, 0, 1],
    score: { utilities: ['100', '1'], nsw: '100', ef1: true, efx: false },
  });
  expect(maximumNsw(0)).toBe('4040');

  expect(SURVEY_CASES[1]).toMatchObject({
    key: 'optimalTension',
    owners: [0, 0, 1],
    score: { utilities: ['12', '8'], nsw: '96', ef1: true, efx: false },
  });
  expect(maximumNsw(1)).toBe('96');

  expect(SURVEY_CASES[2]).toMatchObject({
    key: 'equalButMovable',
    owners: [0, 1, 1],
    score: { utilities: ['10', '10'], nsw: '100', ef1: true, efx: true },
  });
  expect(maximumNsw(2)).toBe('200');
});

test('unknown ids are not disguised as curated data', async () => {
  query.mockResolvedValue({ rowCount: 0, rows: [] });
  expect(await getCase('11111111-1111-4111-8111-111111111111')).toBeNull();
});

test('allocation standing uses strict same-case comparisons and competition rank', async () => {
  query.mockResolvedValue({ rowCount: 1, rows: [{ total: '6', higher: '1', tied: '2', lower: '3' }] });

  expect(await getAllocationStanding('11111111-1111-4111-8111-111111111111')).toEqual({
    rank: 2,
    total: 6,
    tied: 2,
    beatPercent: 60,
  });
  expect(query.mock.calls[0][0]).toContain("peer.kind='visitor'");
});

test('the first visitor allocation has no percentile until there is a peer', async () => {
  query.mockResolvedValue({ rowCount: 1, rows: [{ total: '1', higher: '0', tied: '1', lower: '0' }] });
  expect(await getAllocationStanding('11111111-1111-4111-8111-111111111111')).toMatchObject({ beatPercent: null, rank: 1, total: 1 });
});
