import type { JsonScore } from '../domain/score';
import type { CaseInput } from '../domain/model';
import { copy, type Locale } from '../i18n/copy';
export function ScoreExplanation({locale,score,caseData}:{locale:Locale;score:JsonScore;caseData:CaseInput}){
 const t=copy[locale];
 return <section className="results-block"><div className="result-score"><div><p className="eyebrow">{t.nswScore}</p><p className="score-number">{score.nsw}</p></div><p>{t.bundleValue}</p></div><ul className="utility-list">{score.utilities.map((u,i)=><li key={i}><span>{caseData.agents[i]}</span><strong>{u}</strong></li>)}</ul><div className="criteria"><div className="criterion"><strong>{t.ef1}</strong><span className={score.ef1?'badge badge-positive':'badge badge-negative'}>{score.ef1?t.meetsCriterion:t.failsCriterion}</span>{score.ef1Failure&&<p>{t.witness}: {caseData.agents[score.ef1Failure.i]} → {caseData.agents[score.ef1Failure.j]}</p>}</div><div className="criterion"><strong>{t.efx}</strong><span className={score.efx?'badge badge-positive':'badge badge-negative'}>{score.efx?t.meetsCriterion:t.failsCriterion}</span>{score.efxFailure&&<p>{t.witness}: {caseData.agents[score.efxFailure.i]} → {caseData.agents[score.efxFailure.j]} · {caseData.items[score.efxFailure.item]}</p>}</div></div><p className="muted">{t.positiveConvention}</p></section>;
}
