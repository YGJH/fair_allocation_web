import { afterEach, expect, test, vi } from 'vitest';
import { createAllocation, getAllocation, getAllocationStanding, getSurveyResults, recordSurveyResponse } from '../src/server/repository';
import { isLocalDevelopment } from '../src/server/local-mode';
import { EXAMPLE_CASE_ID, SURVEY_CASES } from '../src/shared/example';

afterEach(() => vi.unstubAllEnvs());

test('development without DATABASE_URL uses an in-memory store for complete local flows', async () => {
  vi.stubEnv('NODE_ENV', 'development');
  vi.stubEnv('DATABASE_URL', '');
  vi.stubEnv('TEST_DATABASE_URL', '');

  expect(isLocalDevelopment()).toBe(true);

  const sessionId = crypto.randomUUID();
  await recordSurveyResponse(sessionId, SURVEY_CASES[0].allocationId, true);
  const survey = await getSurveyResults(sessionId);
  expect(survey.answered).toBe(1);
  expect(survey.questions[0].userVerdict).toBe(true);

  const allocationId = await createAllocation(EXAMPLE_CASE_ID, [0, 1, 1]);
  expect((await getAllocation(allocationId))?.owners).toEqual([0, 1, 1]);
  expect(await getAllocationStanding(allocationId)).toEqual({ rank: 1, total: 1, tied: 1, beatPercent: null });
});

test('production never enables the in-memory development store', () => {
  expect(isLocalDevelopment({ NODE_ENV: 'production' })).toBe(false);
});
