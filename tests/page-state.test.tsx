/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, test } from 'vitest';
import { PageState } from '../src/components/PageState';

afterEach(cleanup);

test('not-found and unavailable states give different next steps', () => {
  const view = render(<PageState kind="not-found" locale="en" />);
  expect(screen.getByRole('heading', { name: /could not find/i })).toBeTruthy();
  expect(screen.queryByRole('link', { name: 'Retry' })).toBeNull();
  view.rerender(<PageState kind="unavailable" locale="en" retryHref="/en/cases/x" />);
  expect(screen.getByRole('heading', { name: /cannot load/i })).toBeTruthy();
  expect(screen.getByRole('link', { name: 'Retry' }).getAttribute('href')).toBe('/en/cases/x');
  expect(screen.getByRole('link', { name: 'Start allocating' })).toBeTruthy();
});
