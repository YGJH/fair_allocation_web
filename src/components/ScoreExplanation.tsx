import type { JsonScore } from '../domain/score';
import type { CaseInput } from '../domain/model';
import { copy, type Locale } from '../i18n/copy';

export function ScoreExplanation({ locale, score, caseData }: { locale: Locale; score: JsonScore; caseData: CaseInput }) {
  const t = copy[locale];
  const criteria = [
    { key: 'ef1', name: t.ef1, definition: t.ef1Definition, passes: score.ef1, failure: score.ef1Failure },
    { key: 'efx', name: t.efx, definition: t.efxDefinition, passes: score.efx, failure: score.efxFailure },
  ] as const;

  return (
    <div className="results-block">
      <div className="result-score">
        <div>
          <p className="eyebrow">{t.nswScore}</p>
          <p className="score-number">{score.nsw}</p>
        </div>
        <p>{t.nswExplanation}</p>
      </div>

      <div className="utility-section">
        <h3>{t.bundleValue}</h3>
        <ul className="utility-list">
          {score.utilities.map((utility, i) => <li key={caseData.agents[i]}><span>{caseData.agents[i]}</span><strong>{utility}</strong></li>)}
        </ul>
      </div>

      <div className="criteria">
        {criteria.map((criterion) => (
          <article className="criterion" key={criterion.key}>
            <div className="criterion-heading">
              <strong>{criterion.name}</strong>
              <span className={criterion.passes ? 'badge badge-positive' : 'badge badge-negative'}>
                {criterion.passes ? t.meetsCriterion : t.failsCriterion}
              </span>
            </div>
            <p>{criterion.definition}</p>
            {criterion.failure && (
              <p className="witness">
                {t.witness}: {caseData.agents[criterion.failure.i]} → {caseData.agents[criterion.failure.j]}
                {'item' in criterion.failure ? ` · ${caseData.items[criterion.failure.item]}` : ''}
              </p>
            )}
          </article>
        ))}
      </div>
      <details className="definition-details"><summary>{t.moreDetail}</summary><p>{t.positiveConvention}</p></details>
    </div>
  );
}
