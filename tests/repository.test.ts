import {expect,test} from 'vitest';
import {createCase,getCase,listAllocations,addRating,getAggregate,createAllocation} from '../src/server/repository';
import {parseCase} from '../src/domain/model';
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
