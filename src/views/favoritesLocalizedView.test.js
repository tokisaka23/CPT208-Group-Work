import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('favorites route points to the localized favorites view', () => {
  const routerSource = readFileSync(new URL('../router/index.js', import.meta.url), 'utf8');
  assert.match(routerSource, /FavoritesViewI18n\.vue/);
});

test('localized favorites view contains multilingual favorites copy', () => {
  const source = readFileSync(new URL('./FavoritesViewI18n.vue', import.meta.url), 'utf8');

  assert.match(source, /Favorites & Uploads/);
  assert.match(source, /pageTitleSelf/);
  assert.match(source, /pageSummaryFriend/);
  assert.match(source, /UgcMyListI18n/);
});

test('localized ugc list supports read-only mode and translated actions', () => {
  const source = readFileSync(new URL('../components/UgcMyListI18n.vue', import.meta.url), 'utf8');

  assert.match(source, /readOnly/);
  assert.match(source, /Delete record/);
  assert.match(source, /Loading uploaded records/);
  assert.match(source, /v-if="!readOnly"/);
});
