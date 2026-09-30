import { getAllocation, getCase } from '../../../../server/repository';
import { AllocationResults } from '../../../../components/AllocationResults';
import { PageState } from '../../../../components/PageState';
import { isLocale } from '../../../../i18n/locale';

export default async function AllocationPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const l = isLocale(locale) ? locale : 'en';

  try {
    const allocation = await getAllocation(id);
    const c = allocation ? await getCase(allocation.caseId) : null;
    if (!allocation || !c) return <PageState kind="not-found" locale={l} />;

    return (
      <main id="main-content" className="container">
        <AllocationResults
          locale={l}
          caseId={allocation.caseId}
          caseData={c}
          owners={allocation.owners}
          score={allocation.score}
        />
      </main>
    );
  } catch {
    return <PageState kind="unavailable" locale={l} retryHref={`/${l}/allocations/${id}`} />;
  }
}
