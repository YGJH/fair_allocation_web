'use client';

import { useRef, useState, type Ref } from 'react';
import type { Locale } from '../../i18n/copy';
import { getAdventureCopy } from '../../i18n/adventure';
import styles from './VerdictFlow.module.css';

export function JudgmentGate({ locale, onRate, headingRef }: { locale: Locale; onRate: (rating: number) => void; headingRef?: Ref<HTMLHeadingElement> }) {
  const copy = getAdventureCopy(locale).investigation.rating;
  const [rating, setRating] = useState<number | null>(null);
  const submitted = useRef(false);

  function submit() {
    if (rating === null || submitted.current) return;
    submitted.current = true;
    onRate(rating);
  }

  return (
    <section className={styles.judgmentGate} aria-labelledby="judgment-gate-title" data-judgment-gate>
      <p className={styles.eyebrow}>{copy.heading}</p>
      <h2 ref={headingRef} tabIndex={-1} id="judgment-gate-title">{copy.heading}</h2>
      <div className={styles.ratingContent}>
        <p>{copy.body}</p>
        <p id="rating-instruction">{copy.instruction}</p>
        <div className={styles.ratingChoices} role="group" aria-labelledby="rating-instruction">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              type="button"
              key={value}
              aria-pressed={rating === value}
              aria-label={copy.choice(value)}
              onClick={() => setRating(value)}
            >
              {value}
            </button>
          ))}
        </div>
        <button type="button" className={styles.primary} disabled={rating === null} onClick={submit}>
          {copy.submit}
        </button>
      </div>
    </section>
  );
}
