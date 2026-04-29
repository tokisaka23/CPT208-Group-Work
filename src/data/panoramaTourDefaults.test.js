import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { liuyuanPanoramaScenesSource } from './liuyuanPanoramaTour.js';
import { wangshiyuanPanoramaScenesSource } from './wangshiyuanPanoramaTour.js';
import { zhuozhengPanoramaScenesSource } from './zhuozhengPanoramaTour.js';

test('zhuozheng key scenes use wider and lower default mobile framing', () => {
  const entryScene = zhuozhengPanoramaScenesSource.find((scene) => scene.id === 'entry');
  const bridgeScene = zhuozhengPanoramaScenesSource.find((scene) => scene.id === 'xiaofeihong');

  assert.ok(entryScene);
  assert.equal(entryScene.initialTilt, undefined);
  assert.equal(entryScene.initialFov, undefined);
  assert.equal(entryScene.initialHotspotId, 'entry-axis');
  assert.equal(entryScene.initialMobileTilt, -6);
  assert.equal(entryScene.initialMobileFov, 98);

  assert.ok(bridgeScene);
  assert.equal(bridgeScene.initialTilt, undefined);
  assert.equal(bridgeScene.initialFov, undefined);
  assert.equal(bridgeScene.initialHotspotId, 'xiaofeihong-axis');
  assert.equal(bridgeScene.initialMobileTilt, -4);
  assert.equal(bridgeScene.initialMobileFov, 98);
});

test('liuyuan key scenes open wider and stay anchored to the main subject on mobile', () => {
  const entryScene = liuyuanPanoramaScenesSource.find((scene) => scene.id === 'entry');
  const waterCourtScene = liuyuanPanoramaScenesSource.find((scene) => scene.id === 'water-court');

  assert.ok(entryScene);
  assert.equal(entryScene.initialTilt, undefined);
  assert.equal(entryScene.initialFov, undefined);
  assert.equal(entryScene.initialHotspotId, 'entry-axis');
  assert.equal(entryScene.initialMobileTilt, -6);
  assert.equal(entryScene.initialMobileFov, 98);

  assert.ok(waterCourtScene);
  assert.equal(waterCourtScene.initialTilt, undefined);
  assert.equal(waterCourtScene.initialFov, undefined);
  assert.equal(waterCourtScene.initialHotspotId, 'water-court-frame');
  assert.equal(waterCourtScene.initialMobileTilt, -8);
  assert.equal(waterCourtScene.initialMobileFov, 100);
});

test('panorama scenes keep jpg fallbacks for browsers that reject webp assets', () => {
  const sceneSets = [
    zhuozhengPanoramaScenesSource,
    liuyuanPanoramaScenesSource,
    wangshiyuanPanoramaScenesSource,
  ];

  for (const scenes of sceneSets) {
    assert.ok(scenes.length > 0);

    for (const scene of scenes) {
      assert.match(scene.image, /\.webp(?:$|\?)/);
      assert.match(scene.thumbnail, /\.webp(?:$|\?)/);
      assert.match(scene.fallbackImage, /\.jpg(?:$|\?)/);
      assert.match(scene.fallbackThumbnail, /\.jpg(?:$|\?)/);
    }
  }
});

test('panorama asset data uses statically bundled image URLs', async () => {
  const files = [
    './zhuozhengPanoramaTour.js',
    './liuyuanPanoramaTour.js',
    './wangshiyuanPanoramaTour.js',
  ];

  for (const file of files) {
    const source = await readFile(new URL(file, import.meta.url), 'utf8');

    assert.match(source, /bundledPanoramaAssetModules/);
    assert.match(source, /bundledPanoramaFallbackAssetModules/);
    assert.doesNotMatch(source, /@vite-ignore/);
  }
});
