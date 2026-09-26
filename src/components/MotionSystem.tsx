'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function MotionSystem() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) {
      document.documentElement.dataset.motion = 'reduced';
      return;
    }

    document.documentElement.dataset.motion = 'full';
    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      syncTouch: false,
      anchors: true,
    });
    const onScroll = () => ScrollTrigger.update();
    const tick = (time: number) => lenis.raf(time * 1000);
    lenis.on('scroll', onScroll);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal], .panel').forEach((element) => {
        gsap.from(element, {
          y: 28,
          opacity: 0.72,
          duration: 0.8,
          ease: 'power3.out',
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: element, start: 'top 88%', once: true },
        });
      });

      const caseHero = document.querySelector<HTMLElement>('.case-hero');
      const caseScenario = document.querySelector<HTMLElement>('.case-scenario');
      if (caseHero && caseScenario) {
        gsap.fromTo(caseScenario,
          { y: 28, rotate: -2.2 },
          {
            y: -42,
            rotate: 1.2,
            ease: 'none',
            scrollTrigger: { trigger: caseHero, start: 'top top+=78', end: 'bottom top+=120', scrub: 0.8 },
          },
        );
        gsap.to(caseHero.querySelector(':scope > div'), {
          y: -54,
          opacity: 0.42,
          ease: 'none',
          scrollTrigger: { trigger: caseHero, start: 'top top+=78', end: 'bottom top+=180', scrub: 0.8 },
        });
        gsap.utils.toArray<HTMLElement>('.case-scene .scene-item').forEach((item, index) => {
          gsap.to(item, {
            x: index % 2 ? 44 : -38,
            y: index === 1 ? -52 : 38,
            rotate: index % 2 ? 9 : -8,
            ease: 'none',
            scrollTrigger: { trigger: caseHero, start: 'top top+=78', end: 'bottom top+=120', scrub: 0.65 },
          });
        });
      }

      const allocationBoard = document.querySelector<HTMLElement>('[data-allocation-board]');
      if (allocationBoard) {
        const zones = allocationBoard.querySelectorAll<HTMLElement>('.agent-drop-zone');
        gsap.fromTo(zones,
          { y: 72, opacity: 0.3, scale: 0.96 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            stagger: 0.08,
            ease: 'power2.out',
            scrollTrigger: { trigger: allocationBoard, start: 'top 92%', end: 'top 38%', scrub: 0.8 },
          },
        );
        ScrollTrigger.create({
          trigger: allocationBoard,
          start: 'top 92%',
          end: 'top 35%',
          scrub: true,
          onUpdate: ({ progress }) => allocationBoard.style.setProperty('--board-progress', progress.toFixed(3)),
        });
      }

      const bundles = document.querySelectorAll<HTMLElement>('.judgment .bundle');
      if (bundles.length) {
        gsap.fromTo(bundles,
          { x: (index) => index % 2 ? 54 : -54, rotate: (index) => index % 2 ? 2 : -2, opacity: 0.35 },
          {
            x: 0,
            rotate: 0,
            opacity: 1,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: { trigger: '.bundle-grid', start: 'top 88%', end: 'top 52%', scrub: 0.65 },
          },
        );
      }
    });

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh, { once: true });
    document.fonts?.ready.then(refresh).catch(() => {});

    return () => {
      window.removeEventListener('load', refresh);
      context.revert();
      gsap.ticker.remove(tick);
      lenis.off('scroll', onScroll);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      delete document.documentElement.dataset.motion;
    };
  }, []);

  return null;
}
