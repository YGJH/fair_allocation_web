'use client';
import { useState } from 'react';
import type { CaseInput } from '../domain/model';
import { copy, type Locale } from '../i18n/copy';
export function AllocationEditor({locale,caseId,caseData}:{locale:Locale;caseId:string;caseData:CaseInput}){
 const t=copy[locale];const [owners,setOwners]=useState<number[]>(Array(caseData.items.length).fill(-1));const [error,setError]=useState('');const [pending,setPending]=useState(false);
 const assigned=owners.filter(o=>o>=0).length;const ok=assigned===owners.length;
 async function submit(){if(!ok||pending)return;setPending(true);setError('');try{const res=await fetch(`/api/cases/${caseId}/allocations`,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({owners})});if(!res.ok)throw new Error();const data=await res.json();location.href=`/${locale}/allocations/${data.id}`;}catch{setError(t.networkError);setPending(false);}}
 return <section className="panel allocation-editor" aria-busy={pending}><div className="panel-heading"><div><p className="eyebrow">{t.assignmentProgress} · {assigned}/{caseData.items.length}</p><h2>{t.allocation}</h2></div></div>{error&&<p role="alert">{error}</p>}
 <div className="assignment-grid">{caseData.items.map((item,i)=><label className="assignment-row" key={i}><span>{`${item} ${locale==='zh-TW'?'的歸屬':'owner'}`}</span><select value={owners[i]} onChange={e=>setOwners(owners.map((o,k)=>k===i?Number(e.target.value):o))}><option value={-1}>{t.selectOwner}</option>{caseData.agents.map((a,j)=><option key={j} value={j}>{a}</option>)}</select></label>)}</div>
 <button className="button button-primary" type="button" disabled={!ok||pending} onClick={submit}>{pending?t.submitting:t.submitAllocation}</button></section>;
}
