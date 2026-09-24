import { CaseEditor } from '../../../../components/CaseEditor';
import { isLocale } from '../../../../i18n/locale';
export default async function NewCase({params}:{params:Promise<{locale:string}>}){ const {locale}=await params; return <main id="main-content"><CaseEditor locale={isLocale(locale)?locale:'en'}/></main>; }
