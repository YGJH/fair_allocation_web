import { afterEach, expect, test, vi } from 'vitest';
import { createSessionId } from '../src/components/HomeExperience';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

afterEach(() => {
  vi.unstubAllGlobals();
});

test('session id uses crypto.randomUUID when available', () => {
  expect(createSessionId()).toMatch(UUID_V4);
});

test('session id falls back to getRandomValues outside secure contexts', () => {
  const real = globalThis.crypto;
  const getRandomValues = vi.fn(<T extends ArrayBufferView>(array: T) => real.getRandomValues(array as never) as T);
  vi.stubGlobal('crypto', { getRandomValues });
  expect(typeof (globalThis.crypto as Crypto).randomUUID).toBe('undefined');
  const ids = new Set(Array.from({ length: 50 }, () => createSessionId()));
  expect(ids.size).toBe(50);
  for (const id of ids) expect(id).toMatch(UUID_V4);
  expect(getRandomValues).toHaveBeenCalledTimes(50);
});
