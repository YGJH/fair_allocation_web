import type { PoolClient } from 'pg';
import { parseAllocation, parseCase, type Allocation, type CaseInput } from '../domain/model';
import { roundRobin } from '../domain/round-robin';
import { scoreAllocation, toJsonScore, type JsonScore } from '../domain/score';
import { query, withClient } from './db';
import {
  EXAMPLE_ALLOCATION_ID,
  EXAMPLE_CASE,
  EXAMPLE_CASE_ID,
  EXAMPLE_OWNERS,
  EXAMPLE_SCORE,
  isExampleAllocation,
  isExampleCase,
} from '../shared/example';

export type Aggregate = { count: number; mean: number | null; histogram: number[] };
export type StoredAllocation = { id:string; caseId:string; owners:Allocation; kind:'visitor'|'baseline'; nsw:string; score:JsonScore; createdAt:string };

const curatedAllocation: StoredAllocation = {
  id: EXAMPLE_ALLOCATION_ID,
  caseId: EXAMPLE_CASE_ID,
  owners: EXAMPLE_OWNERS,
  kind: 'baseline',
  nsw: EXAMPLE_SCORE.nsw,
  score: EXAMPLE_SCORE,
  createdAt: '2026-01-01T00:00:00.000Z',
};

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
  if (isExampleCase(id)) return EXAMPLE_CASE;
  try {
    const r=await query<{payload:any}>('SELECT payload FROM cases WHERE id=$1',[id]);
    if (r.rowCount) return parseCase(r.rows[0].payload);
    return isExampleCase(id) ? EXAMPLE_CASE : null;
  } catch (error) {
    if (isExampleCase(id)) return EXAMPLE_CASE;
    throw error;
  }
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
  // The built-in allocation is trusted static content; ratings remain database-backed.
  if (isExampleAllocation(id)) return curatedAllocation;
  try {
    const r=await query<any>('SELECT id, case_id as "caseId", owners, kind, nsw::text, score, created_at as "createdAt" FROM allocations WHERE id=$1',[id]);
    if(!r.rowCount) return isExampleAllocation(id) ? curatedAllocation : null;
    const row=r.rows[0];
    return {...row, owners: row.owners, score: row.score};
  } catch (error) {
    if (isExampleAllocation(id)) return curatedAllocation;
    throw error;
  }
}
export async function listAllocations(caseId:string):Promise<StoredAllocation[]>{
  try {
    const r=await query<any>('SELECT id, case_id as "caseId", owners, kind, nsw::text, score, created_at as "createdAt" FROM allocations WHERE case_id=$1 ORDER BY nsw DESC, created_at ASC',[caseId]);
    if (r.rowCount) return r.rows;
    return isExampleCase(caseId) ? [curatedAllocation] : [];
  } catch (error) {
    if (isExampleCase(caseId)) return [curatedAllocation];
    throw error;
  }
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
