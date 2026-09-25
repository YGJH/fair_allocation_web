import { copy, type Locale } from '../i18n/copy';
import { EXAMPLE_CASE_ID } from '../shared/example';

type PageStateProps = {
  kind: 'not-found' | 'unavailable';
  locale: Locale;
  retryHref?: string;
};

export function PageState({ kind, locale, retryHref }: PageStateProps) {
  const t = copy[locale];
  const unavailable = kind === 'unavailable';
  return (
    <main id="main-content" className="container state-page">
      <p className="eyebrow">{unavailable ? t.temporarilyUnavailable : t.pageNotFound}</p>
      <h1>{unavailable ? t.unavailableTitle : t.notFound}</h1>
      <p>{unavailable ? t.unavailableDetail : t.notFoundDetail}</p>
      <div className="state-actions">
        {unavailable && retryHref && <a className="button button-primary" href={retryHref}>{t.retry}</a>}
        <a className="button button-secondary" href={`/${locale}`}>{t.backHome}</a>
        <a className="button button-text" href={`/${locale}/cases/${EXAMPLE_CASE_ID}`}>{t.judgeExample}</a>
      </div>
    </main>
  );
}
