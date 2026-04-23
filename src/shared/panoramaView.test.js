import test from 'node:test';
import assert from 'node:assert/strict';

import { derivePanoramaInitialView, panoramaPanToYaw } from './panoramaView.js';

test('panoramaPanToYaw maps panorama center to the forward-facing camera heading', () => {
  assert.equal(panoramaPanToYaw(0), 0);
  assert.equal(panoramaPanToYaw(25), 90);
  assert.equal(panoramaPanToYaw(50), 180);
  assert.equal(panoramaPanToYaw(75), 270);
});

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

test('derivePanoramaInitialView defaults to a closer mobile framing', () => {
  const view = derivePanoramaInitialView({
    hotspots: [
      { id: 'main', x: 51, y: 54, pitch: -6 },
    ],
  }, 'main', true);

  assert.deepEqual(view, {
    pan: 51,
    tilt: -8,
    fov: 74,
  });
});

test('derivePanoramaInitialView respects explicit scene mobile overrides within the mobile-safe range', () => {
  const view = derivePanoramaInitialView({
    initialMobilePan: 57,
    initialMobileTilt: -6,
    initialMobileFov: 76,
    hotspots: [
      { id: 'main', x: 70, y: 40, pitch: 15 },
    ],
  }, 'main', true);

  assert.deepEqual(view, {
    pan: 57,
    tilt: -6,
    fov: 76,
  });
});

test('derivePanoramaInitialView clamps overly wide mobile overrides back to a phone-friendly range', () => {
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
    fov: 78,
  });
});

test('derivePanoramaInitialView keeps the desktop FOV when it is already mobile-friendly', () => {
  const view = derivePanoramaInitialView({
    initialPan: 50,
    initialTilt: 0,
    initialFov: 70,
    hotspots: [
      { id: 'main', x: 63, y: 52, pitch: -3 },
    ],
  }, 'main', true);

  assert.deepEqual(view, {
    pan: 50,
    tilt: 0,
    fov: 70,
  });
});
