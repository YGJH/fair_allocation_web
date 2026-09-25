'use client';

import { useState } from 'react';
import { copy, type Locale } from '../i18n/copy';

export function ShareCase({ locale, caseId }: { locale: Locale; caseId: string }) {
  const t = copy[locale];
  const [state, setState] = useState<'idle' | 'copied' | 'fallback'>('idle');
  const [fallbackUrl, setFallbackUrl] = useState('');
  const path = `/${locale}/cases/${caseId}`;

  async function share() {
    const url = new URL(path, window.location.origin).href;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard unavailable');
      await navigator.clipboard.writeText(url);
      setState('copied');
    } catch {
      setFallbackUrl(url);
      setState('fallback');
    }
  }

  return (
    <div className="share-case">
      <button className="button button-secondary" type="button" onClick={share}>{state === 'copied' ? t.copied : t.shareLink}</button>
      {state === 'fallback' && (
        <label className="share-fallback">
          <span>{t.copyFallback}</span>
          <input readOnly value={fallbackUrl} onFocus={(event) => event.currentTarget.select()} />
        </label>
      )}
    </div>
  );
}
