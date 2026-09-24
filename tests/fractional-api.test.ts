import {expect,test,vi} from 'vitest';
import {POST} from '../src/app/api/cases/[id]/fractional/route';
import {createCase} from '../src/server/repository';
import {parseCase} from '../src/domain/model';
const run=process.env.TEST_DATABASE_URL?test:test.skip;
run('solver error returns unavailable for a real case', async () => {
 const {id}=await createCase(parseCase({agents:['A','B'],items:['x'],values:[[1],[1]]}));
 vi.spyOn(globalThis,'fetch').mockRejectedValueOnce(new Error('timeout'));
 const response=await POST(new Request(`http://localhost/api/cases/${id}/fractional`,{method:'POST'}),{params:Promise.resolve({id})});
 expect(response.status).toBe(200);
 expect(await response.json()).toEqual({status:'unavailable'});
});
