import { getAggregate, getAllocation } from '../../../../../server/repository';
import { apiError,json,requireUuid } from '../../../../../server/http';
export async function GET(_request:Request,{params}:any){ try{ const {id}=await params; requireUuid(id); const allocation=await getAllocation(id); if(!allocation) return json({error:'not found'},404); return json({score:allocation.score,aggregate:await getAggregate(id),caseId:allocation.caseId}); }catch(e){ return apiError(e); } }
