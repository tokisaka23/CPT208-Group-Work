import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const roamViews = [
  {
    file: './ZhuozhengPanoramaRoamView.vue',
    prefix: 'zhuozheng-panorama-viewer',
  },
  {
    file: './LiuyuanPanoramaRoamView.vue',
    prefix: 'liuyuan-panorama-viewer',
  },
  {
    file: './WangshiyuanPanoramaRoamView.vue',
    prefix: 'wangshi-panorama-viewer',
  },
];

const entryViews = [
  {
    file: './ZhuozhengPanoramaLandingView.vue',
    prefix: 'panorama-entry',
    spotlightSelector: 'spotlight-grid',
  },
  {
    file: './LiuyuanPanoramaLandingView.vue',
    prefix: 'liuyuan-panorama-entry',
    spotlightSelector: 'spotlight-list',
  },
  {
    file: './WangshiyuanPanoramaLandingView.vue',
    prefix: 'wangshi-panorama-entry',
    spotlightSelector: 'spotlight-list',
  },
];

test('panorama roam views use app-style mobile controls and scene sheets', async () => {
  for (const view of roamViews) {
    const source = await readFile(new URL(view.file, import.meta.url), 'utf8');
    const escapedPrefix = view.prefix.replaceAll('-', '\\-');

    assert.match(source, /const controlsOpen = ref\(false\);/);
    assert.match(source, new RegExp(`class="${view.prefix}__bottom"`));
    assert.match(source, /:class="\{ 'is-open': railOpen \}"/);
    assert.match(source, new RegExp(`@media \\(max-width: 640px\\)[\\s\\S]*?\\.${escapedPrefix}__utility\\s*\\{[\\s\\S]*?position: fixed;`));
    assert.match(source, new RegExp(`@media \\(max-width: 640px\\)[\\s\\S]*?\\.${escapedPrefix}__bottom\\.is-open\\s*\\{[\\s\\S]*?bottom: calc\\(`));
    assert.match(source, new RegExp(`@media \\(max-width: 640px\\)[\\s\\S]*?\\.${escapedPrefix}__scene-chip-main strong\\s*\\{[\\s\\S]*?display: none;`));
  }
});

test('panorama entry views keep mobile calls to action thumb-reachable', async () => {
  for (const view of entryViews) {
    const source = await readFile(new URL(view.file, import.meta.url), 'utf8');
    const escapedPrefix = view.prefix.replaceAll('-', '\\-');

    assert.match(source, new RegExp(`@media \\(max-width: 640px\\)[\\s\\S]*?\\.${escapedPrefix}__actions\\s*\\{[\\s\\S]*?position: sticky;`));
    assert.match(source, new RegExp(`@media \\(max-width: 640px\\)[\\s\\S]*?\\.${escapedPrefix}__${view.spotlightSelector}\\s*\\{[\\s\\S]*?overflow-x: auto;`));
    assert.match(source, new RegExp(`@media \\(max-width: 640px\\)[\\s\\S]*?scroll-snap-type: x mandatory;`));
  }
});

test('panorama entry and roam views wire image error fallbacks', async () => {
  for (const view of [...entryViews, ...roamViews]) {
    const source = await readFile(new URL(view.file, import.meta.url), 'utf8');

    assert.match(source, /applyImageFallback/);
    assert.match(source, /@error=/);
  }
});

test('panorama entry and roam thumbnails prefer jpg display assets', async () => {
  for (const view of entryViews) {
    const source = await readFile(new URL(view.file, import.meta.url), 'utf8');

    assert.match(source, /CoverFallback \|\| scenes\.value\[0\]\?\.fallbackImage/);
    assert.match(source, /:src="spot\.fallbackImage \|\| spot\.image"/);
  }

  for (const view of roamViews) {
    const source = await readFile(new URL(view.file, import.meta.url), 'utf8');

    assert.match(source, /url\(\$\{activeScene\.value\.fallbackImage\}\), url\(\$\{activeScene\.value\?\.image \|\| garden\.value\.heroImage\}\)/);
    assert.match(source, /:src="scene\.fallbackThumbnail \|\| scene\.fallbackImage \|\| scene\.thumbnail \|\| scene\.image"/);
  }
});
