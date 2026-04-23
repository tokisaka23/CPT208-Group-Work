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
  assert.match(source, /v-if="!isImmersivePanoramaRoute"/);
  assert.match(source, /:aria-label="appText\.openFavoritesAria"/);
  assert.match(source, /\{\{ appText\.favoritesLabel \}\}/);
});

test('App mobile shell uses app-style bottom navigation and service sheet', async () => {
  const source = await readFile(new URL('./App.vue', import.meta.url), 'utf8');

  assert.match(source, /class="mobile-tabbar"/);
  assert.match(source, /class="mobile-services-sheet"/);
  assert.match(source, /@media \(max-width: 720px\)\s*\{[\s\S]*?\.primary-nav,\s*\.service-menu,\s*\.global-footer\s*\{[\s\S]*?display: none;/);
  assert.match(source, /@media \(max-width: 720px\)\s*\{[\s\S]*?\.mobile-tabbar\s*\{[\s\S]*?position: fixed;/);
  assert.match(source, /@media \(max-width: 720px\)\s*\{[\s\S]*?\.mobile-services-layer\s*\{[\s\S]*?align-items: end;/);
});

test('App keeps immersive panorama routes free from route blur and floating global chrome', async () => {
  const source = await readFile(new URL('./App.vue', import.meta.url), 'utf8');

  assert.match(source, /:name="isImmersivePanoramaRoute \? 'fade-immersive' : 'fade'"/);
  assert.match(source, /\.fade-immersive-enter-active,/);
  assert.match(source, /\.page-body--immersive\s*\{/);
});
