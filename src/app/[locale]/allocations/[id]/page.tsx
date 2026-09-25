import { getAllocation, getCase } from '../../../../server/repository';
import { RatingGate } from '../../../../components/RatingGate';
import { PageState } from '../../../../components/PageState';
import { isLocale } from '../../../../i18n/locale';
import {
  EXAMPLE_CASE_ID,
  EXAMPLE_SCORE,
  isExampleAllocation,
} from '../../../../shared/example';

export default async function AllocationPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const l = isLocale(locale) ? locale : 'en';

  try {
    const allocation = await getAllocation(id);
    const c = allocation ? await getCase(allocation.caseId) : null;
    if (!allocation || !c) return <PageState kind="not-found" locale={l} />;

    return (
      <main id="main-content" className="container">
        <RatingGate
          locale={l}
          allocationId={id}
          caseId={allocation.caseId}
          caseData={c}
          owners={allocation.owners}
          fallbackResult={isExampleAllocation(id) ? { score: EXAMPLE_SCORE, caseId: EXAMPLE_CASE_ID } : undefined}
        />
      </main>
    );
  } catch {
    return <PageState kind="unavailable" locale={l} retryHref={`/${l}/allocations/${id}`} />;
  }
}
