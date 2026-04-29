import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Vercel rewrites client routes back to the Vue app shell', async () => {
  const source = await readFile(new URL('./vercel.json', import.meta.url), 'utf8');
  const config = JSON.parse(source);

  assert.ok(
    config.rewrites.some((rewrite) => rewrite.source === '/(.*)' && rewrite.destination === '/'),
  );
});
