/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, test } from 'vitest';
import ResearchPage from '../src/app/[locale]/research/page';

afterEach(cleanup);

for (const locale of ['en', 'zh-TW'] as const) {
  test(`${locale} research page renders its localized Markdown`, async () => {
    render(await ResearchPage({ params: Promise.resolve({ locale }) }));

    const title = locale === 'en'
      ? 'When the cake cannot be cut: From EF1 and NSW to fairness at every step'
      : '當蛋糕不能切：從 EF1、NSW 到每一步都公平的分配';
    const firstSection = locale === 'en' ? 'I. When goods can be divided' : '一、當物品可以切';
    const contents = locale === 'en' ? 'On this page' : '文章章節';

    expect(screen.getByRole('heading', { level: 1, name: title })).toBeTruthy();
    expect(screen.getByRole('heading', { level: 2, name: firstSection })).toBeTruthy();
    expect(screen.getByRole('navigation', { name: contents })).toBeTruthy();
    expect(screen.getByRole('link', { name: firstSection }).getAttribute('href')).toBe(`#${locale === 'en' ? 'i-when-goods-can-be-divided' : '一-當物品可以切'}`);
    expect(screen.getByRole('link', { name: locale === 'en' ? 'Read the abstract and download the paper on arXiv' : '閱讀 arXiv 摘要並下載全文' }).getAttribute('href')).toBe('https://arxiv.org/abs/2609.03846v4');
    expect(document.querySelector('.katex')).toBeTruthy();
    expect(screen.getByRole('table')).toBeTruthy();
  });
}
