import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

import { resolveSuzhouPoi } from '../data/poiMapData.js';

test('resolveSuzhouPoi resolves configured garden slugs', () => {
  const poi = resolveSuzhouPoi('zhuozhengyuan');

  assert.ok(poi);
  assert.equal(poi.id, 'zhuozhengyuan');
  assert.equal(typeof poi.lng, 'number');
  assert.equal(typeof poi.lat, 'number');
});

test('GardenDetailPage keeps the map navigation wiring in place', async () => {
  const source = await readFile(new URL('./GardenDetailPage.vue', import.meta.url), 'utf8');

  assert.match(source, /import ScenicMapDialog from '\.\/maps\/ScenicMapDialog\.vue';/);
  assert.match(source, /const mapVisible = ref\(false\);/);
  assert.match(source, /const resolvedPoi = computed\(\(\) => \(/);
  assert.match(source, /pageText\.mapAction/);
  assert.match(source, /<ScenicMapDialog/);
});
