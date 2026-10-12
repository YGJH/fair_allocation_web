'use client';

import { useState } from 'react';
import { copy, type Locale } from '../i18n/copy';

type Chapter = 'judgment' | 'allocation';

type Props = {
  locale: Locale;
  chapter: Chapter;
  onComplete: () => void;
};

export function ResearchPrelude({ locale, chapter, onComplete }: Props) {
  const t = copy[locale];
  const [active, setActive] = useState(0);
  const slides = chapter === 'judgment'
    ? [
        { title: t.judgmentStoryOneTitle, body: t.judgmentStoryOneBody },
        { title: t.judgmentStoryTwoTitle, body: t.judgmentStoryTwoBody },
        { title: t.judgmentStoryThreeTitle, body: t.judgmentStoryThreeBody },
      ]
    : [
        { title: t.allocationStoryOneTitle, body: t.allocationStoryOneBody },
        { title: t.allocationStoryTwoTitle, body: t.allocationStoryTwoBody },
        { title: t.allocationStoryThreeTitle, body: t.allocationStoryThreeBody },
      ];
  const finalSlide = active === slides.length - 1;

  return (
    <section className={`research-story research-story--${chapter}`} aria-labelledby={`${chapter}-story-title`}>
      <header className="research-story__topline">
        <p>{chapter === 'judgment' ? t.judgmentStoryEyebrow : t.allocationStoryEyebrow}</p>
        <button type="button" className="research-story__skip" onClick={onComplete}>{t.skipStory}</button>
      </header>

      <div className="research-story__stage">
        <div className="research-story__slides" aria-live="polite">
          {slides.map((slide, index) => (
            <article
              className={index === active ? 'research-story__slide is-active' : 'research-story__slide'}
              aria-hidden={index !== active}
              key={slide.title}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h2 id={index === active ? `${chapter}-story-title` : undefined}>{slide.title}</h2>
              <p>{slide.body}</p>
            </article>
          ))}
        </div>

        <StoryVisual chapter={chapter} active={active} locale={locale} />
      </div>

      <footer className="research-story__footer">
        <div className="research-story__progress" aria-label={t.storyProgress.replace('{current}', String(active + 1)).replace('{total}', String(slides.length))}>
          {slides.map((slide, index) => (
            <button
              type="button"
              className={index === active ? 'is-active' : undefined}
              aria-label={t.storyProgress.replace('{current}', String(index + 1)).replace('{total}', String(slides.length))}
              aria-pressed={index === active}
              onClick={() => setActive(index)}
              key={slide.title}
            />
          ))}
        </div>
        <div className="research-story__actions">
          {active > 0 && <button type="button" className="story-button story-button--back" onClick={() => setActive((value) => value - 1)}>{t.storyPrevious}</button>}
          {finalSlide ? (
            <button type="button" className="story-button story-button--primary" onClick={onComplete}>
              {chapter === 'judgment' ? t.storyStartJudgment : t.storyStartAllocation}
            </button>
          ) : (
            <button type="button" className="story-button story-button--primary" onClick={() => setActive((value) => value + 1)}>{t.storyNext}</button>
          )}
        </div>
      </footer>
    </section>
  );
}

function StoryVisual({ chapter, active, locale }: { chapter: Chapter; active: number; locale: Locale }) {
  const isChinese = locale === 'zh-TW';

  if (chapter === 'judgment') {
    return (
      <div className={`research-visual research-visual--judgment scene-${active + 1}`} aria-hidden="true">
        <div className="visual-balance">
          <span className="visual-person visual-person--a">A</span>
          <i />
          <span className="visual-question">?</span>
          <i />
          <span className="visual-person visual-person--b">B</span>
        </div>
        <div className="visual-standards">
          <span>envy-free</span><span>EF1</span><span>EFX</span>
          <strong>≠</strong>
          <b>{isChinese ? '直覺' : 'intuition'}</b>
        </div>
        <div className="visual-verdicts">
          {[0, 1, 2, 3, 4].map((index) => <i key={index} />)}
          <div><span>× {isChinese ? '不公平' : 'Unfair'}</span><span>✓ {isChinese ? '公平' : 'Fair'}</span></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`research-visual research-visual--allocation scene-${active + 1}`} aria-hidden="true">
      <div className="visual-scatter">
        <span className="visual-person visual-person--a">A</span>
        <div><i /><i /><i /></div>
        <span className="visual-person visual-person--b">B</span>
      </div>
      <div className="visual-values">
        <div><span>{isChinese ? '物品 1' : 'Item 1'}</span><strong><i>A</i> 8</strong><strong><i>B</i> 2</strong></div>
        <div><span>{isChinese ? '物品 2' : 'Item 2'}</span><strong><i>A</i> 5</strong><strong><i>B</i> 6</strong></div>
        <div><span>{isChinese ? '物品 3' : 'Item 3'}</span><strong><i>A</i> 2</strong><strong><i>B</i> 7</strong></div>
      </div>
      <div className="visual-nsw">
        <div><span>Alice</span><strong>8</strong></div>
        <b>×</b>
        <div><span>Bob</span><strong>13</strong></div>
        <b>=</b>
        <em>104</em>
        <small>Nash social welfare</small>
      </div>
    </div>
  );
}
