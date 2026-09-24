import { addRating, getAllocation } from '../../../../../server/repository';
import { apiError,json,readBody,requireUuid } from '../../../../../server/http';
import { enforceLimit } from '../../../../../server/limits';
export async function POST(request:Request,{params}:any){ try{ const {id}=await params; requireUuid(id); const body=await readBody(request); await enforceLimit('votes',request); const aggregate=await addRating(id,body.value); const allocation=await getAllocation(id); if(!allocation) return json({error:'not found'},404); return json({rating:body.value,score:allocation.score,aggregate},201); }catch(e){ return apiError(e); } }
