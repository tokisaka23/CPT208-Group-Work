import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getPoiDisplayAddress,
  getPoiDisplayName,
  resolveSuzhouPoi,
} from './poiMapData.js';

test('poi map resolves localized english names', () => {
  const poi = resolveSuzhouPoi('zhuozhengyuan');

  assert.equal(getPoiDisplayName(poi, 'en'), 'Humble Administrator\'s Garden');
  assert.equal(getPoiDisplayName('suzhoumuseum', 'en'), 'Suzhou Museum');
});

test('poi map resolves localized english addresses', () => {
  const poi = resolveSuzhouPoi('pingjiangroad');

  assert.equal(getPoiDisplayAddress(poi, 'en'), 'Pingjiang Road, Gusu District, Suzhou, Jiangsu');
  assert.equal(getPoiDisplayAddress('liuyuan', 'en'), '338 Liuyuan Road, Gusu District, Suzhou, Jiangsu');
});
