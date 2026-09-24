import { expect, test } from 'vitest';
import { roundRobin } from '../src/domain/round-robin';
import { scoreAllocation, toJsonScore } from '../src/domain/score';
import { EXAMPLE_CASE_ID, EXAMPLE_ALLOCATION_ID } from '../src/shared/example';
import { getCase, getAllocation } from '../src/server/repository';

const sample = {agents:['Maya','Leo'],items:['Sketchbook','Lantern','Notebook'],values:[[8,5,2],[2,6,7]]};
test('first example has a trusted reproducible baseline', () => {
 expect(roundRobin(sample,1)).toEqual([0,1,1]);
 expect(toJsonScore(scoreAllocation(sample,[0,1,1]))).toEqual({utilities:['8','13'],nsw:'104',ef1:true,efx:true});
});
const dbTest = process.env.TEST_DATABASE_URL ? test : test.skip;
dbTest('migration exposes a stable real example with a baseline', async () => {
 expect(await getCase(EXAMPLE_CASE_ID)).toEqual(sample);
 expect(await getAllocation(EXAMPLE_ALLOCATION_ID)).toMatchObject({caseId:EXAMPLE_CASE_ID,owners:[0,1,1],kind:'baseline',nsw:'104',score:{utilities:['8','13'],nsw:'104',ef1:true,efx:true}});
});
