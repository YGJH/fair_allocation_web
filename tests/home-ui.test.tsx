/** @vitest-environment jsdom */
import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import LocalePage from '../src/app/[locale]/page';
import { EXAMPLE_CASE_ID } from '../src/shared/example';

beforeEach(() => {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes('prefers-reduced-motion'),
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => window.setTimeout(() => callback(performance.now()), 16));
  vi.stubGlobal('cancelAnimationFrame', (id: number) => window.clearTimeout(id));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

for (const locale of ['en', 'zh-TW'] as const) {
  test(`${locale} home keeps only the scroll study and its action`, async () => {
    const { container } = render(await LocalePage({ params: Promise.resolve({ locale }) }));
    const primary = screen.getByRole('link', { name: locale === 'en' ? 'Start allocating' : '開始分配' });

    expect(primary.getAttribute('href')).toBe(`/${locale}/cases/${EXAMPLE_CASE_ID}`);
    expect(screen.getByRole('heading', { name: locale === 'en' ? 'How would you divide it?' : '你會怎麼分？' })).toBeTruthy();
    expect(screen.getByRole('img', { name: locale === 'en' ? /Maya and Leo compare/i : /Maya 與 Leo/ })).toBeTruthy();
    expect(container.querySelectorAll('main section')).toHaveLength(1);
    expect(container.querySelector('.home-intro')).toBeNull();
    expect(container.querySelector('.home-flow')).toBeNull();
    expect(screen.queryByText(/NSW score|NSW 分數/)).toBeNull();
  });
}
