import { getCase, listAllocations } from '../../../../server/repository';
import { AllocationEditor } from '../../../../components/AllocationEditor';
import { Leaderboard } from '../../../../components/Leaderboard';
import { ShareCase } from '../../../../components/ShareCase';
import { isLocale } from '../../../../i18n/locale';
import { copy } from '../../../../i18n/copy';
export default async function CasePage({params}:{params:Promise<{locale:string;id:string}>}){
 const {locale,id}=await params;const l=isLocale(locale)?locale:'en';const t=copy[l];const c=await getCase(id);
 if(!c)return <main id="main-content" className="container empty-page"><h1>{t.notFound}</h1><a className="button button-primary" href={`/${l}`}>{t.backHome}</a></main>;
 const allocations=await listAllocations(id);
 return <main id="main-content" className="container case-page"><div className="page-heading"><p className="eyebrow">{t.shareCase} / {c.agents.length} {t.people} · {c.items.length} {t.goods}</p><h1>{t.shareCase}</h1><p>{t.immutableHint}</p><ShareCase locale={l} caseId={id}/></div><div className="case-layout"><div><section className="panel"><div className="panel-heading"><h2>{t.valuations}</h2><p>{t.valueHint}</p></div><div className="matrix-scroll" role="region" aria-label={t.valuations} tabIndex={0}><table><caption>{t.valuations}</caption><thead><tr><th scope="col">{t.people} / {t.goods}</th>{c.items.map((it,j)=><th scope="col" key={j}>{it}</th>)}</tr></thead><tbody>{c.agents.map((a,i)=><tr key={i}><th scope="row">{a}</th>{c.values[i].map((v,j)=><td key={j}>{v}</td>)}</tr>)}</tbody></table></div></section><AllocationEditor locale={l} caseId={id} caseData={c}/></div><Leaderboard locale={l} rows={allocations.map(a=>({id:a.id,kind:a.kind,nsw:a.nsw,owners:a.owners}))}/></div></main>;
}
