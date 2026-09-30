import {expect,test} from 'vitest';
import {createCase,getCase,listAllocations,addRating,getAggregate,createAllocation,getSurveyResults,recordSurveyResponse} from '../src/server/repository';
import {parseCase} from '../src/domain/model';
import { SURVEY_CASES } from '../src/shared/example';
const run = process.env.TEST_DATABASE_URL ? test : test.skip;
run('published case stays fixed, baseline is stored, votes aggregate by allocation', async () => {
 const c=parseCase({agents:['A','B'],items:['x','y'],values:[[3,0],[0,2]]});
 const {id,baselineId}=await createCase(c);
 expect(await getCase(id)).toEqual(c);
 expect((await listAllocations(id)).some(a=>a.id===baselineId)).toBe(true);
 await addRating(baselineId,1); await addRating(baselineId,5);
 expect(await getAggregate(baselineId)).toEqual({count:2,mean:3,histogram:[1,0,0,0,1]});
});
run('unknown ids and invalid allocations do not create dangling allocations', async()=>{
 await expect(createAllocation('00000000-0000-0000-0000-000000000000',[0])).rejects.toThrow();
 const c=parseCase({agents:['A'],items:['x'],values:[[1]]}); const {id}=await createCase(c); const before=(await listAllocations(id)).length;
 await expect(createAllocation(id,[1])).rejects.toThrow();
 expect((await listAllocations(id)).length).toBe(before);
});
run('survey responses are stored once per browser session and return ordered statistics', async()=>{
 const sessionId=crypto.randomUUID();
 const first=SURVEY_CASES[0].allocationId;
 await recordSurveyResponse(sessionId,first,true);
 await recordSurveyResponse(sessionId,first,false);
 const summary=await getSurveyResults(sessionId);
 expect(summary.answered).toBe(1);
 expect(summary.totalQuestions).toBe(3);
 expect(summary.questions.map(question=>question.allocationId)).toEqual(SURVEY_CASES.map(entry=>entry.allocationId));
 expect(summary.questions[0].userVerdict).toBe(false);
 expect(summary.questions[0].total).toBeGreaterThan(0);
});
