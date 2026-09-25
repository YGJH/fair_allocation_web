import { beforeEach, expect, test, vi } from 'vitest';

const { query } = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock('../src/server/db', () => ({ query, withClient: vi.fn() }));

import { getAllocation, getCase, listAllocations } from '../src/server/repository';
import { EXAMPLE_ALLOCATION_ID, EXAMPLE_CASE_ID, EXAMPLE_SCORE } from '../src/shared/example';

beforeEach(() => query.mockReset());

test('curated pages resolve even before the seed rows are available', async () => {
  query.mockResolvedValue({ rowCount: 0, rows: [] });
  expect(await getCase(EXAMPLE_CASE_ID)).toMatchObject({ agents: ['Maya', 'Leo'] });
  expect(await getAllocation(EXAMPLE_ALLOCATION_ID)).toMatchObject({ nsw: EXAMPLE_SCORE.nsw, owners: [0, 1, 1] });
  expect(await listAllocations(EXAMPLE_CASE_ID)).toHaveLength(1);
});

test('unknown ids are not disguised as curated data', async () => {
  query.mockResolvedValue({ rowCount: 0, rows: [] });
  expect(await getCase('11111111-1111-4111-8111-111111111111')).toBeNull();
});
