import { getCase } from '../../../../server/repository';
import { AllocationEditor } from '../../../../components/AllocationEditor';
import { PageState } from '../../../../components/PageState';
import { ExperienceDeck } from '../../../../components/ExperienceDeck';
import { isLocale } from '../../../../i18n/locale';
import { copy } from '../../../../i18n/copy';
import { getCuratedCase } from '../../../../shared/example';

export default async function CasePage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const l = isLocale(locale) ? locale : 'en';
  const t = copy[l];

  try {
    const c = await getCase(id);
    if (!c) return <PageState kind="not-found" locale={l} />;
    const curatedCase = getCuratedCase(id);
    const curatedCopy = curatedCase?.key === 'first'
      ? { eyebrow: t.caseEyebrow, title: t.caseTitle, intro: t.caseIntro }
      : curatedCase?.key === 'identical'
        ? { eyebrow: t.identicalValues, title: t.identicalCaseTitle, intro: t.identicalCaseDetail }
        : curatedCase?.key === 'nonIdentical'
          ? { eyebrow: t.nonIdenticalValues, title: t.nonIdenticalCaseTitle, intro: t.nonIdenticalCaseDetail }
          : curatedCase?.key === 'challenge'
            ? { eyebrow: t.challengeCase, title: t.challengeCaseTitle, intro: t.challengeCaseDetail }
            : null;
    const title = curatedCopy?.title ?? c.agents.join(' & ');
    const scenarioTitle = l === 'zh-TW' ? `${c.items.length} 件物品，${c.agents.length} 位參與者` : `${c.items.length} items, ${c.agents.length} people`;

    return (
      <main id="main-content" className="container case-page">
        <ExperienceDeck locale={l} chapter="allocation">
        <nav className="breadcrumb" aria-label={l === 'en' ? 'Breadcrumb' : '麵包屑導覽'}>
          <a href={`/${l}`}>{t.backHome}</a>
        </nav>

        <header className="case-brief">
          <div>
            <p className="eyebrow">{curatedCopy?.eyebrow ?? t.caseEyebrow}</p>
            <h1>{title}</h1>
          </div>
          <div className="case-meta" aria-label={scenarioTitle}>
            <span><strong>{c.agents.length}</strong> {t.people}</span>
            <span><strong>{c.items.length}</strong> {t.goods}</span>
          </div>
        </header>

        <div className="case-layout case-layout--single" data-reveal>
          <AllocationEditor locale={l} caseId={id} caseData={c} />
        </div>
        </ExperienceDeck>
      </main>
    );
  } catch {
    return <PageState kind="unavailable" locale={l} retryHref={`/${l}/cases/${id}`} />;
  }
}
