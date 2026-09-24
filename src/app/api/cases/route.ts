import { parseCase } from '../../../domain/model';
import { createCase } from '../../../server/repository';
import { apiError,json,readBody } from '../../../server/http';
import { enforceLimit } from '../../../server/limits';
export async function POST(request:Request){ try{ const body=await readBody(request); const c=parseCase(body.case); await enforceLimit('publish',request); const out=await createCase(c); return json(out,201); }catch(e){ return apiError(e); } }
