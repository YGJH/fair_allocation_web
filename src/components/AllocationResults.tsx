import type { Allocation, CaseInput } from '../domain/model';
import type { JsonScore } from '../domain/score';
import { copy, type Locale } from '../i18n/copy';
import { displayItemName } from '../i18n/labels';
import { isExampleCase } from '../shared/example';
import type { AllocationStanding } from '../server/repository';
import { NextCases } from './NextCases';
import { ScoreExplanation } from './ScoreExplanation';

export function AllocationResults({
  locale,
  caseId,
  caseData,
  owners,
  score,
  standing = null,
}: {
  locale: Locale;
  caseId: string;
  caseData: CaseInput;
  owners: Allocation;
  score: JsonScore;
  standing?: AllocationStanding | null;
}) {
  const t = copy[locale];
  const animated = isExampleCase(caseId);
  const groups = caseData.agents.map((name, personIndex) => ({
    name,
    items: caseData.items.flatMap((item, itemIndex) => owners[itemIndex] === personIndex
      ? [{ name: displayItemName(locale, item, itemIndex), value: caseData.values[personIndex][itemIndex] }]
      : []),
  }));

  return (
    <section className="judgment allocation-results">
      <nav className="breadcrumb" aria-label={locale === 'en' ? 'Breadcrumb' : '麵包屑導覽'}>
        <a href={`/${locale}`}>{t.backHome}</a>
        <span aria-hidden="true">/</span>
        <a href={`/${locale}/cases/${caseId}`}>{t.navCase}</a>
      </nav>

      <header className="page-heading judgment-heading">
        <h1>{t.allocationResultsTitle}</h1>
        <p>{t.allocationResultsHint}</p>
      </header>

      <div className="allocation-results__layout">
        <section className="panel bundle-panel" aria-labelledby="allocation-title">
          <div className="panel-heading">
            <h2 id="allocation-title">{t.allocation}</h2>
            <span className="badge">{caseData.items.length} {t.goods}</span>
          </div>
          <div className="bundle-grid">
            {groups.map(({ name, items }, index) => (
              <article className="bundle" key={name}>
                <p className="bundle-person"><span className="person-icon" aria-hidden="true">{index + 1}</span>{name}</p>
                <ul>
                  {items.length ? items.map((item) => (
                    <li key={item.name}>
                      <span>{item.name}</span>
                      <strong className="item-score" aria-label={`${t.itemValue} ${item.value}`}>{item.value}</strong>
                    </li>
                  )) : <li className="empty-bundle">{t.unassignedItems}</li>}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="panel results-panel" aria-labelledby="results-title">
          <div className="panel-heading">
            <h2 id="results-title">{animated ? t.walkthroughTitle : t.resultsTitle}</h2>
          </div>
          <ScoreExplanation locale={locale} score={score} caseData={caseData} owners={owners} standing={standing} animated={animated} />
        </section>
      </div>

      {animated && <div className="allocation-results__next"><NextCases locale={locale} /></div>}
    </section>
  );
}
