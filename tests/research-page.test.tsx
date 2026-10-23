/** @vitest-environment jsdom */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, test } from 'vitest';
import ResearchPage from '../src/app/[locale]/research/page';

afterEach(cleanup);

for (const locale of ['en', 'zh-TW'] as const) {
  test(`${locale} research page renders its localized Markdown`, async () => {
    render(await ResearchPage({ params: Promise.resolve({ locale }) }));

    const articleFile = locale === 'en'
      ? 'research-paper-blog.en.md'
      : 'research-paper-blog.zh-TW.md';
    const markdown = await readFile(path.join(process.cwd(), 'docs', articleFile), 'utf8');
    const title = markdown.match(/^# (.+)$/m)?.[1];
    const firstSection = markdown.match(/^## (.+)$/m)?.[1];
    const contents = locale === 'en' ? 'On this page' : '文章章節';

    expect(title).toBeTruthy();
    expect(firstSection).toBeTruthy();
    expect(document.querySelector('h1')?.textContent).toBe(title);

    const firstHeading = document.querySelector<HTMLElement>('article h2[id]');
    const firstChapterLink = document.querySelector<HTMLAnchorElement>('nav ol a');
    expect(firstHeading?.textContent).toBe(firstSection);
    expect(document.querySelector('nav')?.getAttribute('aria-label')).toBe(contents);
    expect(firstChapterLink?.textContent).toBe(firstSection);
    expect(firstChapterLink?.getAttribute('href')).toBe(`#${firstHeading?.id}`);

    const paperLink = [...document.querySelectorAll<HTMLAnchorElement>('article a')]
      .find((link) => link.href === 'https://arxiv.org/abs/2609.03846v4');
    expect(paperLink).toBeTruthy();
    expect(document.querySelector('.katex')).toBeTruthy();
    expect(document.querySelector('table')).toBeTruthy();
  });
}
