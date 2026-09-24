import { getCase, listAllocations } from '../../../../server/repository';
import { apiError,json,requireUuid } from '../../../../server/http';
export async function GET(_request:Request,{params}:any){ try{ const {id}=await params; requireUuid(id); const c=await getCase(id); if(!c) return json({error:'not found'},404); const allocations=(await listAllocations(id)).map(a=>({id:a.id,owners:a.owners,kind:a.kind})); return json({case:c,allocations}); }catch(e){ return apiError(e); } }
