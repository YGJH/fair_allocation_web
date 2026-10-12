'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Locale } from '../i18n/copy';
import { ResearchPrelude } from './ResearchPrelude';

type Chapter = 'judgment' | 'allocation';

type Props = {
  locale: Locale;
  chapter: Chapter;
  children: ReactNode;
};

export function ExperienceDeck({ locale, chapter, children }: Props) {
  const [phase, setPhase] = useState<'story' | 'task'>('story');
  const taskRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (phase === 'task') taskRef.current?.focus();
  }, [phase]);

  return (
    <div className={`experience-deck experience-deck--${chapter}`} data-phase={phase}>
      {phase === 'story' ? (
        <div className="experience-deck__story">
          <ResearchPrelude
            locale={locale}
            chapter={chapter}
            onComplete={() => setPhase('task')}
          />
        </div>
      ) : (
        <div className="experience-deck__task" ref={taskRef} tabIndex={-1}>
          {children}
        </div>
      )}
    </div>
  );
}
