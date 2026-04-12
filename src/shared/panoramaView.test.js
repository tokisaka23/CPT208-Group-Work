import test from 'node:test';
import assert from 'node:assert/strict';

import { derivePanoramaInitialView } from './panoramaView.js';

test('derivePanoramaInitialView preserves the original desktop defaults', () => {
  const view = derivePanoramaInitialView({
    initialPan: 50,
    hotspots: [
      { id: 'main', x: 70, y: 40, pitch: 15 },
    ],
  }, 'main', false);

  assert.deepEqual(view, {
    pan: 50,
    tilt: 0,
    fov: 70,
  });
});

test('derivePanoramaInitialView defaults to a lower and wider mobile framing', () => {
  const view = derivePanoramaInitialView({
    hotspots: [
      { id: 'main', x: 51, y: 54, pitch: -6 },
    ],
  }, 'main', true);

  assert.deepEqual(view, {
    pan: 52,
    tilt: -8,
    fov: 96,
  });
});

test('derivePanoramaInitialView respects explicit scene mobile overrides', () => {
  const view = derivePanoramaInitialView({
    initialMobilePan: 57,
    initialMobileTilt: -6,
    initialMobileFov: 100,
    hotspots: [
      { id: 'main', x: 70, y: 40, pitch: 15 },
    ],
  }, 'main', true);

  assert.deepEqual(view, {
    pan: 57,
    tilt: -6,
    fov: 100,
  });
});
