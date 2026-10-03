import type { PoolClient } from 'pg';
import { parseAllocation, parseCase, type Allocation, type CaseInput } from '../domain/model';
import { roundRobin } from '../domain/round-robin';
import { scoreAllocation, toJsonScore, type JsonScore } from '../domain/score';
import { query, withClient } from './db';
import {
  CURATED_CASES,
  SURVEY_CASES,
  getCuratedAllocation as findCuratedAllocation,
  getCuratedCase as findCuratedCase,
} from '../shared/example';
import type { SurveySummary } from '../shared/survey';

export type Aggregate = { count: number; mean: number | null; histogram: number[] };
export type AllocationStanding = { rank: number; total: number; tied: number; beatPercent: number | null };
export type StoredAllocation = { id:string; caseId:string; owners:Allocation; kind:'visitor'|'baseline'; nsw:string; score:JsonScore; createdAt:string };

const curatedAllocations: StoredAllocation[] = CURATED_CASES.map((entry) => ({
  id: entry.allocationId,
  caseId: entry.id,
  owners: entry.owners,
  kind: 'baseline',
  nsw: entry.score.nsw,
  score: entry.score,
  createdAt: '2026-01-01T00:00:00.000Z',
}));

function seed(){ return Math.floor(Math.random()*0x7fffffff)||1; }
async function insertAllocation(client:PoolClient, caseId:string, c:CaseInput, owners:Allocation, kind:'visitor'|'baseline'){
  const score=toJsonScore(scoreAllocation(c, owners));
  const r=await client.query<{id:string}>('INSERT INTO allocations(case_id,owners,kind,nsw,score) VALUES($1,$2,$3,$4,$5) RETURNING id',[caseId,JSON.stringify(owners),kind,score.nsw,JSON.stringify(score)]);
  return r.rows[0].id;
}
export async function createCase(c:CaseInput):Promise<{id:string;baselineId:string}>{
  c=parseCase(c);
  return withClient(async client=>{
    await client.query('BEGIN');
    try{
      const baselineSeed=seed();
      const r=await client.query<{id:string}>('INSERT INTO cases(payload,baseline_seed) VALUES($1,$2) RETURNING id',[JSON.stringify(c),baselineSeed]);
      const id=r.rows[0].id;
      const baselineId=await insertAllocation(client,id,c,roundRobin(c,baselineSeed),'baseline');
      await client.query('COMMIT');
      return {id,baselineId};
    }catch(e){ await client.query('ROLLBACK'); throw e; }
  });
}
export async function getCase(id:string):Promise<CaseInput|null>{
  // Curated content is immutable and should never wait for PostgreSQL to render.
  const curatedCase = findCuratedCase(id);
  if (curatedCase) return curatedCase.caseData;
  const r=await query<{payload:any}>('SELECT payload FROM cases WHERE id=$1',[id]);
  return r.rowCount ? parseCase(r.rows[0].payload) : null;
}
export async function createAllocation(caseId:string, owners:Allocation, kind:'visitor'|'baseline'='visitor'):Promise<string>{
  return withClient(async client=>{
    await client.query('BEGIN');
    try{
      const r=await client.query<{payload:any}>('SELECT payload FROM cases WHERE id=$1',[caseId]);
      if(!r.rowCount) throw Object.assign(new Error('case not found'),{status:404});
      const c=parseCase(r.rows[0].payload);
      const parsed=parseAllocation(c, owners);
      const id=await insertAllocation(client,caseId,c,parsed,kind);
      await client.query('COMMIT');
      return id;
    }catch(e){ await client.query('ROLLBACK'); throw e; }
  });
}
export async function getAllocation(id:string):Promise<StoredAllocation|null>{
  // Built-in allocations are trusted static content; ratings remain database-backed.
  const curatedDefinition = findCuratedAllocation(id);
  if (curatedDefinition) return curatedAllocations.find((entry) => entry.id === id)!;
  const r=await query<any>('SELECT id, case_id as "caseId", owners, kind, nsw::text, score, created_at as "createdAt" FROM allocations WHERE id=$1',[id]);
  if(!r.rowCount) return null;
  const row=r.rows[0];
  return {...row, owners: row.owners, score: row.score};
}
export async function listAllocations(caseId:string):Promise<StoredAllocation[]>{
  const curatedAllocation = curatedAllocations.find((entry) => entry.caseId === caseId);
  try {
    const r=await query<any>('SELECT id, case_id as "caseId", owners, kind, nsw::text, score, created_at as "createdAt" FROM allocations WHERE case_id=$1 ORDER BY nsw DESC, created_at ASC',[caseId]);
    if (r.rowCount) return r.rows;
    return curatedAllocation ? [curatedAllocation] : [];
  } catch (error) {
    if (curatedAllocation) return [curatedAllocation];
    throw error;
  }
}
export async function getAllocationStanding(id:string):Promise<AllocationStanding|null>{
  const r=await query<{total:string;higher:string;tied:string;lower:string}>(
    `SELECT count(*)::text AS total,
      count(*) FILTER (WHERE peer.nsw > target.nsw)::text AS higher,
      count(*) FILTER (WHERE peer.nsw = target.nsw)::text AS tied,
      count(*) FILTER (WHERE peer.nsw < target.nsw)::text AS lower
    FROM allocations target
    JOIN allocations peer ON peer.case_id=target.case_id AND peer.kind='visitor'
    WHERE target.id=$1 AND target.kind='visitor'
    GROUP BY target.nsw`,
    [id],
  );
  if (!r.rowCount) return null;
  const total=Number(r.rows[0].total);
  const higher=Number(r.rows[0].higher);
  const tied=Number(r.rows[0].tied);
  const lower=Number(r.rows[0].lower);
  return {
    rank:higher+1,
    total,
    tied,
    beatPercent:total>1 ? Math.round(lower/(total-1)*100) : null,
  };
}
export async function addRating(id:string,value:number):Promise<Aggregate>{
  if(!Number.isInteger(value)||value<1||value>5) throw new Error('rating must be 1-5');
  return withClient(async client=>{
    await client.query('BEGIN');
    try{
      const exists=await client.query('SELECT 1 FROM allocations WHERE id=$1',[id]);
      if(!exists.rowCount) throw Object.assign(new Error('allocation not found'),{status:404});
      await client.query('INSERT INTO ratings(allocation_id,value) VALUES($1,$2)',[id,value]);
      await client.query('COMMIT');
    }catch(e){ await client.query('ROLLBACK'); throw e; }
    return getAggregate(id);
  });
}
export async function getAggregate(id:string):Promise<Aggregate>{
  const r=await query<{value:number;count:string}>('SELECT value,count(*)::text count FROM ratings WHERE allocation_id=$1 GROUP BY value ORDER BY value',[id]);
  const histogram=[0,0,0,0,0]; let total=0,sum=0;
  for(const row of r.rows){ const count=Number(row.count); histogram[row.value-1]=count; total+=count; sum+=row.value*count; }
  return {count:total,mean:total?sum/total:null,histogram};
}

const surveyAllocationIds = SURVEY_CASES.map((entry) => entry.allocationId);

export async function getSurveyResults(sessionId:string):Promise<SurveySummary>{
  const [aggregateRows, responseRows] = await Promise.all([
    query<{allocationId:string;total:string;fair:string}>(
      'SELECT allocation_id::text AS "allocationId", count(*)::text AS total, count(*) FILTER (WHERE verdict)::text AS fair FROM survey_responses WHERE allocation_id = ANY($1::uuid[]) GROUP BY allocation_id',
      [surveyAllocationIds],
    ),
    query<{allocationId:string;verdict:boolean}>(
      'SELECT allocation_id::text AS "allocationId", verdict FROM survey_responses WHERE session_id=$1 AND allocation_id = ANY($2::uuid[])',
      [sessionId, surveyAllocationIds],
    ),
  ]);
  const aggregates = new Map(aggregateRows.rows.map((row) => [row.allocationId, row]));
  const responses = new Map(responseRows.rows.map((row) => [row.allocationId, row.verdict]));
  const questions = surveyAllocationIds.map((allocationId) => {
    const row = aggregates.get(allocationId);
    const total = Number(row?.total ?? 0);
    const fair = Number(row?.fair ?? 0);
    return {
      allocationId,
      total,
      fair,
      unfair: total - fair,
      fairPercent: total ? Math.round(fair / total * 100) : null,
      userVerdict: responses.get(allocationId) ?? null,
    };
  });
  return { answered: questions.filter((question) => question.userVerdict !== null).length, totalQuestions: questions.length, questions };
}

export async function recordSurveyResponse(sessionId:string,allocationId:string,verdict:boolean):Promise<SurveySummary>{
  if (!surveyAllocationIds.includes(allocationId)) throw Object.assign(new Error('survey question not found'), { status: 404 });
  await query(
    'INSERT INTO survey_responses(session_id,allocation_id,verdict) VALUES($1,$2,$3) ON CONFLICT(session_id,allocation_id) DO UPDATE SET verdict=EXCLUDED.verdict,updated_at=now()',
    [sessionId, allocationId, verdict],
  );
  return getSurveyResults(sessionId);
}
export async function getFractional(id:string){
  const r=await query<{fractional_status:string|null;fractional_value:string|null;fractional_started_at:Date|null}>('SELECT fractional_status,fractional_value,fractional_started_at FROM cases WHERE id=$1',[id]);
  if(!r.rowCount) return null;
  const row=r.rows[0];
  return {status:row.fractional_status,value:row.fractional_value,startedAt:row.fractional_started_at};
}
export async function claimFractional(id:string):Promise<boolean>{
  const r=await query('UPDATE cases SET fractional_status=$2, fractional_started_at=now() WHERE id=$1 AND (fractional_status IS NULL OR fractional_status=$3 OR (fractional_status=$2 AND fractional_started_at < now()-interval \'30 seconds\')) RETURNING id',[id,'running','unavailable']);
  return !!r.rowCount;
}
export async function setFractional(id:string,status:'estimated'|'unavailable',value?:string){
  await query('UPDATE cases SET fractional_status=$2,fractional_value=$3,fractional_started_at=NULL WHERE id=$1',[id,status,value??null]);
}
