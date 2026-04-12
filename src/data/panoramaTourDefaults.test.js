import test from 'node:test';
import assert from 'node:assert/strict';

import { liuyuanPanoramaScenesSource } from './liuyuanPanoramaTour.js';
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
