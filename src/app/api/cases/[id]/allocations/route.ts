import { createAllocation, listAllocations } from '../../../../../server/repository';
import { apiError,json,readBody,requireUuid } from '../../../../../server/http';
import { enforceLimit } from '../../../../../server/limits';
export async function POST(request:Request,{params}:any){ try{ const {id}=await params; requireUuid(id); const body=await readBody(request); await enforceLimit('allocations',request); const allocId=await createAllocation(id,body.owners); return json({id:allocId},201); }catch(e){ return apiError(e); } }
export async function GET(_request:Request,{params}:any){ try{ const {id}=await params; requireUuid(id); const allocations=(await listAllocations(id)).map(a=>({id:a.id,owners:a.owners,kind:a.kind,nsw:a.nsw,score:a.score})); return json({allocations}); }catch(e){ return apiError(e); } }
