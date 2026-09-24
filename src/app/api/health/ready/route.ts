import { query } from '../../../../server/db';
export async function GET(){ try{ await Promise.race([query('SELECT 1'), new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),1500))]); return Response.json({ok:true}); }catch{ return Response.json({ok:false},{status:503}); } }
