import { expect, test } from 'vitest';
import { roundRobin } from '../src/domain/round-robin';
import { scoreAllocation, toJsonScore } from '../src/domain/score';
import { CURATED_CASES, EXAMPLE_CASE_ID, EXAMPLE_ALLOCATION_ID, PRACTICE_CASES } from '../src/shared/example';
import { getCase, getAllocation } from '../src/server/repository';

const sample = {agents:['Alice','Bob'],items:['1','2','3'],values:[[8,5,2],[2,6,7]]};
test('first example has a trusted reproducible baseline', () => {
 expect(roundRobin(sample,1)).toEqual([0,1,1]);
 expect(toJsonScore(scoreAllocation(sample,[0,1,1]))).toEqual({utilities:['8','13'],nsw:'104',ef1:true,efx:true});
});
test('practice cases cover identical, non-identical, and challenge structures with trusted scores', async () => {
 expect(PRACTICE_CASES.map((entry) => entry.key)).toEqual(['identical', 'nonIdentical', 'challenge']);
 expect(PRACTICE_CASES[0].caseData.values[0]).toEqual(PRACTICE_CASES[0].caseData.values[1]);
 expect(PRACTICE_CASES[1].caseData.values[0]).not.toEqual(PRACTICE_CASES[1].caseData.values[1]);
 expect(PRACTICE_CASES[2].caseData.items).toHaveLength(4);
 for (const entry of CURATED_CASES) {
  expect(toJsonScore(scoreAllocation(entry.caseData, entry.owners))).toEqual(entry.score);
  expect(await getCase(entry.id)).toEqual(entry.caseData);
  expect(await getAllocation(entry.allocationId)).toMatchObject({caseId:entry.id,owners:entry.owners,kind:'baseline',score:entry.score});
 }
});

const dbTest = process.env.TEST_DATABASE_URL ? test : test.skip;
dbTest('migration exposes a stable real example with a baseline', async () => {
 expect(await getCase(EXAMPLE_CASE_ID)).toEqual(sample);
 expect(await getAllocation(EXAMPLE_ALLOCATION_ID)).toMatchObject({caseId:EXAMPLE_CASE_ID,owners:[0,1,1],kind:'baseline',nsw:'104',score:{utilities:['8','13'],nsw:'104',ef1:true,efx:true}});
});
