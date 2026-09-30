import { copy, type Locale } from '../i18n/copy';
import { PRACTICE_CASES, type CuratedCaseKey } from '../shared/example';

type CardCopy = { category: string; title: string; detail: string };

export function NextCases({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const labels: Record<Exclude<CuratedCaseKey, 'first'>, CardCopy> = {
    identical: { category: t.identicalValues, title: t.identicalCaseTitle, detail: t.identicalCaseDetail },
    nonIdentical: { category: t.nonIdenticalValues, title: t.nonIdenticalCaseTitle, detail: t.nonIdenticalCaseDetail },
    challenge: { category: t.challengeCase, title: t.challengeCaseTitle, detail: t.challengeCaseDetail },
  };

  return (
    <section className="practice-cases" aria-labelledby="practice-cases-title">
      <div className="practice-cases__heading">
        <h4 id="practice-cases-title">{t.practiceTitle}</h4>
        <p>{t.practiceIntro}</p>
      </div>
      <ol className="practice-track">
        {PRACTICE_CASES.map((entry, index) => {
          const text = labels[entry.key as Exclude<CuratedCaseKey, 'first'>];
          return (
            <li data-case-kind={entry.key} key={entry.id}>
              <a href={`/${locale}/cases/${entry.id}`} aria-label={`${text.category}: ${text.title}. ${t.startCase}`}>
                <span className="practice-track__step" aria-hidden="true">{index + 1}</span>
                <div>
                  <span className="practice-track__category">{text.category}</span>
                  <h5>{text.title}</h5>
                  <p>{text.detail}</p>
                  <small>{entry.caseData.agents.length} {t.people} / {entry.caseData.items.length} {t.goods}</small>
                </div>
                <strong>{t.startCase}</strong>
              </a>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
