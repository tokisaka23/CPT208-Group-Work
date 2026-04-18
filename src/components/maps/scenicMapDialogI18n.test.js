import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildScenicAgentRouteSummary,
  buildScenicCurrentMarkerLabel,
  buildScenicDestinationMarkerLabel,
  buildScenicManualRouteSummary,
  buildScenicNearbySuccessMessage,
  buildScenicSearchSummary,
  getScenicMapDialogText,
  getScenicSearchOptions,
} from './scenicMapDialogI18n.js';

test('scenic map dialog resolves English ui text', () => {
  const text = getScenicMapDialogText('en');

  assert.equal(text.close, 'Close');
  assert.equal(text.walkingNavigation, 'Walking Navigation');
  assert.equal(text.drivingNavigation, 'Driving Navigation');
  assert.equal(text.currentLocationLabel, 'My Location');
  assert.equal(text.navigationOrder, 'Navigation Order');
});

test('scenic map dialog resolves English search options', () => {
  const options = getScenicSearchOptions('en');

  assert.equal(options[0].label, 'food spots');
  assert.equal(options[1].label, 'cinemas');
  assert.equal(options[2].label, 'malls');
});

test('scenic map dialog builds English route and marker summaries', () => {
  assert.equal(buildScenicManualRouteSummary([{ id: 1 }, { id: 2 }], 'en'), 'My Location -> 1 -> 2 -> Destination');
  assert.equal(buildScenicDestinationMarkerLabel('Humble Administrator\'s Garden', 'en'), 'Destination · Humble Administrator\'s Garden');
  assert.equal(buildScenicCurrentMarkerLabel('en'), 'Start · My Location');
  assert.equal(
    buildScenicAgentRouteSummary({
      startName: 'My Location',
      endName: 'Humble Administrator\'s Garden',
      routeMode: 'walking',
      distanceMeters: 860,
      durationSeconds: 900,
      language: 'en',
    }),
    'My Location · Humble Administrator\'s Garden · Walking · 860 m · about 15 min',
  );
});

test('scenic map dialog builds English nearby-search copy', () => {
  assert.equal(buildScenicSearchSummary({ count: 0, searchLabel: 'food spots', language: 'en' }), 'Search food spots');
  assert.equal(buildScenicSearchSummary({ count: 4, searchLabel: 'food spots', language: 'en' }), 'Showing 4 food spots');
  assert.equal(buildScenicNearbySuccessMessage({ count: 4, searchLabel: 'food spots', language: 'en' }), 'Found 4 nearby food spots');
});
