import test from 'node:test';
import assert from 'node:assert/strict';
import {
  extractAmapRouteSummary,
  formatFriendCoordinate,
  formatFriendRouteDistance,
  formatFriendRouteDuration,
  getFriendLocationFallbackMessage,
  hasRenderableFriendLocation,
  isRecentLocationUpdate,
  summarizeFriendRoute,
} from './friendLocation.js';

test('hasRenderableFriendLocation only returns true for shared locations with valid coordinates', () => {
  assert.equal(hasRenderableFriendLocation(null), false);
  assert.equal(hasRenderableFriendLocation({}), false);
  assert.equal(hasRenderableFriendLocation({
    isLocationSharingEnabled: true,
    latitude: 31.23,
    longitude: 120.58,
  }), true);
  assert.equal(hasRenderableFriendLocation({
    isLocationSharingEnabled: false,
    latitude: 31.23,
    longitude: 120.58,
  }), false);
  assert.equal(hasRenderableFriendLocation({
    isLocationSharingEnabled: true,
    latitude: null,
    longitude: 120.58,
  }), false);
});

test('formatFriendCoordinate keeps six decimal places and falls back safely', () => {
  assert.equal(formatFriendCoordinate(31.2304567), '31.230457');
  assert.equal(formatFriendCoordinate('120.580001'), '120.580001');
  assert.equal(formatFriendCoordinate(null), '--');
  assert.equal(formatFriendCoordinate('abc'), '--');
});

test('friend route formatters summarize distance and duration clearly', () => {
  assert.equal(formatFriendRouteDistance(850), '850 m');
  assert.equal(formatFriendRouteDistance(1280), '1.3 km');
  assert.equal(formatFriendRouteDistance(null), '--');

  assert.equal(formatFriendRouteDuration(540), '9 min');
  assert.equal(formatFriendRouteDuration(3900), '1 h 5 min');
  assert.equal(formatFriendRouteDuration(null), '--');

  assert.equal(
    summarizeFriendRoute({ mode: 'walking', distanceMeters: 1280, durationSeconds: 900 }, 'zh'),
    '步行约 1.3 km · 15 min',
  );
  assert.equal(
    summarizeFriendRoute({ mode: 'driving', distanceMeters: 4200, durationSeconds: 720 }, 'zh'),
    '驾车约 4.2 km · 12 min',
  );
});

test('isRecentLocationUpdate treats recent timestamps as online-friendly', () => {
  const now = new Date('2026-04-13T10:00:00.000Z');

  assert.equal(isRecentLocationUpdate('2026-04-13T09:57:00.000Z', 5 * 60 * 1000, now), true);
  assert.equal(isRecentLocationUpdate('2026-04-13T09:40:00.000Z', 5 * 60 * 1000, now), false);
  assert.equal(isRecentLocationUpdate('', 5 * 60 * 1000, now), false);
});

test('extractAmapRouteSummary reads route metrics and steps from AMap result payloads', () => {
  assert.deepEqual(
    extractAmapRouteSummary({
      routes: [
        {
          distance: '1280',
          time: '900',
          steps: [
            { instruction: '向东步行 200 米' },
            { instruction: '右转进入人民路' },
          ],
        },
      ],
    }),
    {
      distanceMeters: 1280,
      durationSeconds: 900,
      steps: ['向东步行 200 米', '右转进入人民路'],
    },
  );

  assert.deepEqual(
    extractAmapRouteSummary({
      route: {
        paths: [
          {
            distance: '4200',
            duration: '720',
            rides: [
              { instruction: '沿干将路直行' },
            ],
          },
        ],
      },
    }),
    {
      distanceMeters: 4200,
      durationSeconds: 720,
      steps: ['沿干将路直行'],
    },
  );
});

test('getFriendLocationFallbackMessage explains why a map cannot be shown', () => {
  assert.equal(
    getFriendLocationFallbackMessage({ isOnline: false, isLocationSharingEnabled: true }, 'zh'),
    '好友当前离线，暂时没有实时定位。',
  );
  assert.equal(
    getFriendLocationFallbackMessage({ isOnline: true, isLocationSharingEnabled: false }, 'zh'),
    '对方暂未开放位置共享。',
  );
  assert.equal(
    getFriendLocationFallbackMessage({ isOnline: true, isLocationSharingEnabled: true, latitude: null, longitude: null }, 'zh'),
    '暂时没有可展示的定位数据。',
  );
});
