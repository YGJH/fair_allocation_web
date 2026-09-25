import { getCase } from '../../../../server/repository';
import { AllocationEditor } from '../../../../components/AllocationEditor';
import { ShareCase } from '../../../../components/ShareCase';
import { PageState } from '../../../../components/PageState';
import { isLocale } from '../../../../i18n/locale';
import { copy } from '../../../../i18n/copy';
import { isExampleCase } from '../../../../shared/example';

export default async function CasePage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const l = isLocale(locale) ? locale : 'en';
  const t = copy[l];

  try {
    const c = await getCase(id);
    if (!c) return <PageState kind="not-found" locale={l} />;
    const title = isExampleCase(id) ? t.caseTitle : c.agents.join(' & ');

    return (
      <main id="main-content" className="container case-page">
        <nav className="breadcrumb" aria-label={l === 'en' ? 'Breadcrumb' : '麵包屑導覽'}>
          <a href={`/${l}`}>{t.backHome}</a>
        </nav>

        <header className="case-hero">
          <div>
            <p className="eyebrow">{t.caseEyebrow}</p>
            <h1>{title}</h1>
            <p className="case-lead">{t.caseIntro}</p>
            <div className="case-meta" aria-label={`${c.agents.length} ${t.people}, ${c.items.length} ${t.goods}`}>
              <span><strong>{c.agents.length}</strong> {t.people}</span>
              <span><strong>{c.items.length}</strong> {t.goods}</span>
            </div>
          </div>
          <aside className="case-scenario" aria-labelledby="scenario-title">
            <p className="eyebrow" id="scenario-title">{t.scenario}</p>
            <div className="case-scene" aria-label={t.scenarioDetail}>
              <div className="scene-person scene-person--maya"><span>M</span><strong>{c.agents[0]}</strong></div>
              <div className="scene-orbit" aria-hidden="true" />
              <div className="scene-items">
                {c.items.map((item, index) => <span className={`scene-item scene-item--${index + 1}`} key={item}>{item}</span>)}
              </div>
              <div className="scene-person scene-person--leo"><span>L</span><strong>{c.agents[1]}</strong></div>
            </div>
            <ShareCase locale={l} caseId={id} />
          </aside>
        </header>

        <div className="case-layout" data-reveal>
          <section className="panel matrix-panel" aria-labelledby="valuations-title">
            <div className="panel-heading">
              <div><h2 id="valuations-title">{t.valuations}</h2></div>
            </div>
            <div className="matrix-scroll" role="region" aria-label={t.valuations} tabIndex={0}>
              <table>
                <caption>{t.valuations}</caption>
                <thead><tr><th scope="col">{t.people} / {t.goods}</th>{c.items.map((item) => <th scope="col" key={item}>{item}</th>)}</tr></thead>
                <tbody>{c.agents.map((agent, i) => <tr key={agent}><th scope="row">{agent}</th>{c.values[i].map((value, j) => <td key={c.items[j]}>{value}</td>)}</tr>)}</tbody>
              </table>
            </div>
          </section>
          <AllocationEditor locale={l} caseId={id} caseData={c} />
        </div>
      </main>
    );
  } catch {
    return <PageState kind="unavailable" locale={l} retryHref={`/${l}/cases/${id}`} />;
  }
}
