import { getAllocation, getCase } from '../../../../server/repository';
import { RatingGate } from '../../../../components/RatingGate';
import { isLocale } from '../../../../i18n/locale';
import { copy } from '../../../../i18n/copy';
export default async function AllocationPage({params}:{params:Promise<{locale:string;id:string}>}){
 const {locale,id}=await params;const l=isLocale(locale)?locale:'en';const allocation=await getAllocation(id);const c=allocation?await getCase(allocation.caseId):null;
 if(!allocation||!c)return <main id="main-content" className="container empty-page"><h1>{copy[l].notFound}</h1><a className="button button-primary" href={`/${l}`}>{copy[l].backHome}</a></main>;
 return <main id="main-content" className="container"><RatingGate locale={l} allocationId={id} caseId={allocation.caseId} caseData={c} owners={allocation.owners}/></main>;
}
