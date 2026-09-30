import {expect,test} from 'vitest';
import {POST as publish} from '../src/app/api/cases/route';
import {GET as getSurvey, POST as postSurvey} from '../src/app/api/survey/route';

test('reject invalid valuations without saving', async () => {
 const request=new Request('http://localhost/api/cases',{method:'POST',body:JSON.stringify({case:{agents:['A'],items:['x'],values:[[-1]]}})});
 expect((await publish(request)).status).toBe(400);
});
test('reject oversized body', async()=>{
 const request=new Request('http://localhost/api/cases',{method:'POST',body:'x'.repeat(70000)});
 expect((await publish(request)).status).toBe(413);
});
test('survey requires a valid anonymous session and boolean verdict', async()=>{
 expect((await getSurvey(new Request('http://localhost/api/survey'))).status).toBe(400);
 const request=new Request('http://localhost/api/survey',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({sessionId:'bad',allocationId:'bad',verdict:'fair'})});
 expect((await postSurvey(request)).status).toBe(400);
});
