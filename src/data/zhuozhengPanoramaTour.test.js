import test from 'node:test';
import assert from 'node:assert/strict';

import { zhuozhengPanoramaScenesSource } from './zhuozhengPanoramaTour.js';

test('zhuozheng panorama entry keeps the original desktop default and a wider mobile framing', () => {
  const entryScene = zhuozhengPanoramaScenesSource.find((scene) => scene.id === 'entry');

  assert.ok(entryScene);
  assert.equal(entryScene.initialPan, 50);
  assert.equal(entryScene.initialTilt, undefined);
  assert.equal(entryScene.initialFov, undefined);
  assert.equal(entryScene.initialMobilePan, 53);
  assert.equal(entryScene.initialMobileTilt, -6);
  assert.equal(entryScene.initialMobileFov, 98);
  assert.equal(entryScene.hotspots[0].yaw, 184);
});
