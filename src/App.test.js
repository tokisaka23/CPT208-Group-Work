import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('App mobile header keeps the main-branch compact navigation layout', async () => {
  const source = await readFile(new URL('./App.vue', import.meta.url), 'utf8');

  assert.match(source, /@media \(max-width: 640px\)\s*\{[\s\S]*?grid-template-columns: minmax\(0, 1fr\) auto;/);
  assert.match(source, /@media \(max-width: 640px\)\s*\{[\s\S]*?\.language-switch--refined select\s*\{[\s\S]*?min-width: 4rem;/);
  assert.doesNotMatch(
    source,
    /@media \(max-width: 640px\)\s*\{[\s\S]*?\.header-actions--refined\s*\{[\s\S]*?grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/,
  );
});

test('App favorites floating button uses localized label sources', async () => {
  const source = await readFile(new URL('./App.vue', import.meta.url), 'utf8');

  assert.match(source, /favoritesLabel/);
  assert.match(source, /openFavoritesAria/);
  assert.match(source, /:aria-label="appText\.openFavoritesAria"/);
  assert.match(source, /\{\{ appText\.favoritesLabel \}\}/);
});
