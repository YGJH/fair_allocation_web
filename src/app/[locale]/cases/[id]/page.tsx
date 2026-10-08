import { getCase } from '../../../../server/repository';
import { AllocationEditor } from '../../../../components/AllocationEditor';
import { ShareCase } from '../../../../components/ShareCase';
import { PageState } from '../../../../components/PageState';
import { isLocale } from '../../../../i18n/locale';
import { copy } from '../../../../i18n/copy';
import { displayItemName } from '../../../../i18n/labels';
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
        <nav className="breadcrumb" aria-label={l === 'en' ? 'Breadcrumb' : '麵包屑導覽'}>
          <a href={`/${l}`}>{t.backHome}</a>
        </nav>

        <header className="case-hero">
          <div>
            <p className="eyebrow">{curatedCopy?.eyebrow ?? t.caseEyebrow}</p>
            <h1>{title}</h1>
            <p className="case-lead">{curatedCopy?.intro ?? t.caseIntro}</p>
            <div className="case-meta" aria-label={`${c.agents.length} ${t.people}, ${c.items.length} ${t.goods}`}>
              <span><strong>{c.agents.length}</strong> {t.people}</span>
              <span><strong>{c.items.length}</strong> {t.goods}</span>
            </div>
          </div>
          <aside className="case-scenario" aria-labelledby="scenario-title">
            <p className="eyebrow" id="scenario-title">{scenarioTitle}</p>
            <div className="case-scene" aria-label={curatedCopy?.intro ?? t.scenarioDetail}>
              <div className="scene-person scene-person--maya"><span>{c.agents[0]?.slice(0, 1)}</span><strong>{c.agents[0]}</strong></div>
              <div className="scene-orbit" aria-hidden="true" />
              <div className="scene-items">
                {c.items.map((item, index) => <span className={`scene-item scene-item--${index + 1}`} key={item}>{displayItemName(l, item, index)}</span>)}
              </div>
              <div className="scene-person scene-person--leo"><span>{c.agents[1]?.slice(0, 1)}</span><strong>{c.agents[1]}</strong></div>
            </div>
            <ShareCase locale={l} caseId={id} />
          </aside>
        </header>

        <div className="case-layout case-layout--single" data-reveal>
          <AllocationEditor locale={l} caseId={id} caseData={c} />
        </div>
      </main>
    );
  } catch {
    return <PageState kind="unavailable" locale={l} retryHref={`/${l}/cases/${id}`} />;
  }
}
