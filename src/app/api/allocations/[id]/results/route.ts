import { getAggregate, getAllocation, getAllocationStanding } from '../../../../../server/repository';
import { apiError,json,requireUuid } from '../../../../../server/http';
export async function GET(_request:Request,{params}:any){ try{ const {id}=await params; requireUuid(id); const allocation=await getAllocation(id); if(!allocation) return json({error:'not found'},404); const [aggregate,standing]=await Promise.all([getAggregate(id),getAllocationStanding(id)]); return json({score:allocation.score,aggregate,standing,caseId:allocation.caseId}); }catch(e){ return apiError(e); } }
