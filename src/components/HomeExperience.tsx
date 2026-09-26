'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AllocationField } from './AllocationField';

type Props = {
  allocationHref: string;
  copy: {
    title: string;
    primary: string;
    scrollCue: string;
    stageLabel: string;
  };
};

export function HomeExperience({ allocationHref, copy }: Props) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = root.current;
    if (!node) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMotion.matches) return;

    gsap.registerPlugin(ScrollTrigger);
    node.dataset.scrollReady = 'true';
    node.style.setProperty('--home-progress', '0');

    const trigger = ScrollTrigger.create({
      trigger: node,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      invalidateOnRefresh: true,
      onUpdate: ({ progress }) => node.style.setProperty('--home-progress', progress.toFixed(4)),
    });

    return () => {
      trigger.kill();
      delete node.dataset.scrollReady;
      node.style.removeProperty('--home-progress');
    };
  }, []);

  return (
    <main id="main-content" className="home-main">
      <section ref={root} className="home-scroll" aria-labelledby="home-title">
        <div className="home-scroll__sticky">
          <div className="home-scroll__heading">
            <h1 id="home-title" className="sr-only">{copy.title}</h1>
            <span className="home-scroll__cue">{copy.scrollCue}</span>
          </div>

          <div className="home-stage" role="img" aria-label={copy.stageLabel}>
            <AllocationField />
            <div className="stage-orbit" aria-hidden="true" />
            <div className="stage-route" aria-hidden="true" />
            <div className="stage-person stage-person--maya" aria-hidden="true"><strong>Maya</strong></div>
            <div className="stage-person stage-person--leo" aria-hidden="true"><strong>Leo</strong></div>
            <span className="stage-object stage-object--one" aria-hidden="true"><i /></span>
            <span className="stage-object stage-object--two" aria-hidden="true"><i /></span>
            <span className="stage-object stage-object--three" aria-hidden="true"><i /></span>
          </div>

          <div className="home-scroll__progress" aria-hidden="true"><span /><span /><span /></div>
          <a className="button button-primary home-scroll__cta" href={allocationHref}>{copy.primary}</a>
        </div>
      </section>
    </main>
  );
}
