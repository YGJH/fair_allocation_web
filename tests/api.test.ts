import {expect,test} from 'vitest';
import {POST as publish} from '../src/app/api/cases/route';

test('reject invalid valuations without saving', async () => {
 const request=new Request('http://localhost/api/cases',{method:'POST',body:JSON.stringify({case:{agents:['A'],items:['x'],values:[[-1]]}})});
 expect((await publish(request)).status).toBe(400);
});
test('reject oversized body', async()=>{
 const request=new Request('http://localhost/api/cases',{method:'POST',body:'x'.repeat(70000)});
 expect((await publish(request)).status).toBe(413);
});
