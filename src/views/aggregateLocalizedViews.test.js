import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('siteContentI18n defines clean localized card content for the aggregate pages', () => {
  const source = readFileSync(new URL('../data/siteContentI18n.js', import.meta.url), 'utf8');

  assert.match(source, /Humble Administrator's Garden/);
  assert.match(source, /to: '\/zhuozheng'/);
  assert.match(source, /Open Garden Detail/);
  assert.match(source, /Open Museum Story/);
  assert.match(source, /Suzhou-style noodles/);
  assert.match(source, /Begin with a hot bowl of noodles/);
});

test('router points aggregate routes at the new I18n page components', () => {
  const routerSource = readFileSync(new URL('../router/index.js', import.meta.url), 'utf8');

  assert.match(routerSource, /GardensI18n\.vue/);
  assert.match(routerSource, /MuseumsI18n\.vue/);
  assert.match(routerSource, /HeritageI18n\.vue/);
});

test('new aggregate page files consume the clean siteContentI18n module', () => {
  const gardensSource = readFileSync(new URL('./GardensI18n.vue', import.meta.url), 'utf8');
  const museumsSource = readFileSync(new URL('./MuseumsI18n.vue', import.meta.url), 'utf8');
  const heritageSource = readFileSync(new URL('./HeritageI18n.vue', import.meta.url), 'utf8');

  assert.match(gardensSource, /useSiteContentI18n/);
  assert.match(museumsSource, /useSiteContentI18n/);
  assert.match(heritageSource, /useSiteContentI18n/);
});
