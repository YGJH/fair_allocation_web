import { beforeEach, expect, test, vi } from 'vitest';

const { query } = vi.hoisted(() => ({ query: vi.fn() }));
vi.mock('../src/server/db', () => ({ query, withClient: vi.fn() }));

import { getSurveyResults, recordSurveyResponse } from '../src/server/repository';
import { SURVEY_CASES } from '../src/shared/example';

beforeEach(() => query.mockReset());

test('survey statistics stay in question order and include the current browser answers', async () => {
  query
    .mockResolvedValueOnce({ rows: [
      { allocationId: SURVEY_CASES[1].allocationId, total: '4', fair: '1' },
      { allocationId: SURVEY_CASES[0].allocationId, total: '5', fair: '4' },
    ] })
    .mockResolvedValueOnce({ rows: [
      { allocationId: SURVEY_CASES[0].allocationId, verdict: true },
      { allocationId: SURVEY_CASES[1].allocationId, verdict: false },
    ] });

  const summary = await getSurveyResults('11111111-1111-4111-8111-111111111111');
  expect(summary.answered).toBe(2);
  expect(summary.questions).toEqual([
    { allocationId: SURVEY_CASES[0].allocationId, total: 5, fair: 4, unfair: 1, fairPercent: 80, userVerdict: true },
    { allocationId: SURVEY_CASES[1].allocationId, total: 4, fair: 1, unfair: 3, fairPercent: 25, userVerdict: false },
    { allocationId: SURVEY_CASES[2].allocationId, total: 0, fair: 0, unfair: 0, fairPercent: null, userVerdict: null },
    { allocationId: SURVEY_CASES[3].allocationId, total: 0, fair: 0, unfair: 0, fairPercent: null, userVerdict: null },
    { allocationId: SURVEY_CASES[4].allocationId, total: 0, fair: 0, unfair: 0, fairPercent: null, userVerdict: null },
  ]);
});

test('recording a response upserts once and then returns the full summary', async () => {
  query
    .mockResolvedValueOnce({ rowCount: 1, rows: [] })
    .mockResolvedValueOnce({ rows: [{ allocationId: SURVEY_CASES[0].allocationId, total: '1', fair: '1' }] })
    .mockResolvedValueOnce({ rows: [{ allocationId: SURVEY_CASES[0].allocationId, verdict: true }] });

  const summary = await recordSurveyResponse(
    '11111111-1111-4111-8111-111111111111',
    SURVEY_CASES[0].allocationId,
    true,
  );
  expect(summary.answered).toBe(1);
  expect(query.mock.calls[0][0]).toContain('ON CONFLICT(session_id,allocation_id) DO UPDATE');
});

test('responses cannot be attached to allocations outside the five survey questions', async () => {
  await expect(recordSurveyResponse(
    '11111111-1111-4111-8111-111111111111',
    '99999999-9999-4999-8999-999999999999',
    true,
  )).rejects.toMatchObject({ status: 404 });
  expect(query).not.toHaveBeenCalled();
});
