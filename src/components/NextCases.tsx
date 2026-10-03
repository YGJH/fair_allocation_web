import { copy, type Locale } from '../i18n/copy';
import { FOLLOW_UP_CHALLENGE_CASES, PRACTICE_CASES } from '../shared/example';

type CardCopy = { category: string; title: string; detail: string };

export function NextCases({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const labels: Record<(typeof PRACTICE_CASES)[number]['key'], CardCopy> = {
    identical: { category: t.identicalValues, title: t.identicalCaseTitle, detail: t.identicalCaseDetail },
    nonIdentical: { category: t.nonIdenticalValues, title: t.nonIdenticalCaseTitle, detail: t.nonIdenticalCaseDetail },
    challenge: { category: t.challengeCase, title: t.challengeCaseTitle, detail: t.challengeCaseDetail },
  };
  const challengeLabels: Record<(typeof FOLLOW_UP_CHALLENGE_CASES)[number]['key'], CardCopy> = {
    optimalTension: { category: t.optimalTensionValues, title: t.optimalTensionTitle, detail: t.optimalTensionDetail },
    equalButMovable: { category: t.equalButMovableValues, title: t.equalButMovableTitle, detail: t.equalButMovableDetail },
  };
  const recommended = PRACTICE_CASES.find((entry) => entry.key === 'nonIdentical') ?? PRACTICE_CASES[0];
  const alternatives = PRACTICE_CASES.filter((entry) => entry.id !== recommended.id);
  const recommendedText = labels[recommended.key];

  return (
    <section className="practice-cases" aria-labelledby="practice-cases-title">
      <header className="practice-cases__heading">
        <h4 id="practice-cases-title">{t.practiceTitle}</h4>
        <p>{t.practiceIntro}</p>
      </header>

      <a
        className="practice-featured"
        href={`/${locale}/cases/${recommended.id}`}
        aria-label={`${t.recommendedCase}. ${recommendedText.category}: ${recommendedText.title}. ${t.startCase}`}
      >
        <span className="practice-featured__label">{t.recommendedCase}</span>
        <div>
          <span className="practice-case__category">{recommendedText.category}</span>
          <h5>{recommendedText.title}</h5>
          <p>{recommendedText.detail}</p>
        </div>
        <strong>{t.startCase}</strong>
      </a>

      <div className="practice-alternatives">
        <p>{t.otherCases}</p>
        <ul>
          {alternatives.map((entry) => {
            const text = labels[entry.key];
            return (
              <li key={entry.id}>
                <a href={`/${locale}/cases/${entry.id}`} aria-label={`${text.category}: ${text.title}. ${t.startCase}`}>
                  <div>
                    <span className="practice-case__category">{text.category}</span>
                    <h5>{text.title}</h5>
                  </div>
                  <span className="practice-case__action">{t.startCase}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="practice-challenges">
        <header>
          <h5>{t.followUpChallenges}</h5>
          <p>{t.followUpChallengesIntro}</p>
        </header>
        <ul>
          {FOLLOW_UP_CHALLENGE_CASES.map((entry) => {
            const text = challengeLabels[entry.key];
            return (
              <li key={entry.id}>
                <a href={`/${locale}/cases/${entry.id}`} aria-label={`${t.followUpChallenges}. ${text.title}. ${t.startCase}`}>
                  <div>
                    <span className="practice-case__category">{text.category}</span>
                    <h5>{text.title}</h5>
                    <p>{text.detail}</p>
                  </div>
                  <span className="practice-case__action">{t.startCase}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
