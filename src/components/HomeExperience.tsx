'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { AllocationField } from './AllocationField';

type Props = {
  locale: 'en' | 'zh-TW';
  allocationHref: string;
  copy: {
    kicker: string;
    title: string;
    intro: string;
    primary: string;
    stageLabel: string;
    stageCaption: string;
    steps: string[];
  };
};

export function HomeExperience({ locale, allocationHref, copy }: Props) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = root.current;
    if (!node) return;

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(pointer: fine)');
    const context = gsap.context(() => {
      if (!motion.matches) {
        gsap.timeline({ defaults: { ease: 'power3.out' }, onComplete: () => { node.dataset.intro = 'complete'; } })
          .from('[data-home-copy] > *', { y: 12, opacity: 0.72, duration: 0.65, stagger: 0.07 })
          .from('[data-home-stage]', { scale: 0.975, opacity: 0.76, duration: 0.72 }, '-=0.48')
          .from('[data-home-flow] li', { y: 8, opacity: 0.7, duration: 0.38, stagger: 0.06 }, '-=0.3');
      } else {
        node.dataset.intro = 'complete';
      }
    }, node);

    const stage = node.querySelector<HTMLElement>('[data-home-stage]');
    const objects = Array.from(node.querySelectorAll<HTMLElement>('[data-stage-object]'));
    const reset = () => gsap.to(objects, { x: 0, y: 0, duration: 0.55, ease: 'power2.out', overwrite: true });
    const move = (event: PointerEvent) => {
      if (!stage || motion.matches || !finePointer.matches) return;
      const bounds = stage.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      objects.forEach((object, index) => {
        const depth = 8 + index * 4;
        gsap.to(object, { x: x * depth, y: y * depth, duration: 0.45, ease: 'power2.out', overwrite: true });
      });
    };
    const visibility = () => { if (document.hidden) reset(); };

    stage?.addEventListener('pointermove', move);
    stage?.addEventListener('pointerleave', reset);
    window.addEventListener('blur', reset);
    document.addEventListener('visibilitychange', visibility);

    return () => {
      stage?.removeEventListener('pointermove', move);
      stage?.removeEventListener('pointerleave', reset);
      window.removeEventListener('blur', reset);
      document.removeEventListener('visibilitychange', visibility);
      context.revert();
    };
  }, []);

  return (
    <main id="main-content" className="home-main">
      <section ref={root} className="home-experience" aria-labelledby="home-title">
        <div className="home-copy" data-home-copy>
          <p className="home-kicker">{copy.kicker}</p>
          <h1 id="home-title">{copy.title}</h1>
          <p className="home-intro">{copy.intro}</p>
          <div className="home-actions">
            <a className="button button-primary" href={allocationHref}>{copy.primary}</a>
          </div>
        </div>

        <div className="home-stage-wrap">
          <div className="home-stage" data-home-stage role="img" aria-label={copy.stageLabel}>
            <AllocationField />
            <div className="stage-route" aria-hidden="true" />
            <div className="stage-person stage-person--maya">
              <strong>Maya</strong><span>8 · 5 · 2</span>
            </div>
            <div className="stage-person stage-person--leo">
              <strong>Leo</strong><span>2 · 6 · 7</span>
            </div>
            <span className="stage-object stage-object--one" data-stage-object>Sketchbook</span>
            <span className="stage-object stage-object--two" data-stage-object>Lantern</span>
            <span className="stage-object stage-object--three" data-stage-object>Notebook</span>
            <p className="stage-caption">{copy.stageCaption}</p>
          </div>
        </div>

        <ol className="home-flow" data-home-flow aria-label={locale === 'en' ? 'Three steps' : '三個步驟'}>
          {copy.steps.map((step, index) => <li key={step}><span>{index + 1}</span>{step}</li>)}
        </ol>
      </section>
    </main>
  );
}
