import test from 'node:test';
import assert from 'node:assert/strict';

import {
  assertReasonableSuzhouRoute,
  extractJsonObject,
  formatDistance,
  formatDuration,
  haversineDistanceMeters,
  isItineraryPlanningRequest,
  isRoutePlanningRequest,
  isWithinSuzhouCity,
  looksLikeDirectDestination,
  mergeRoutePolylines,
  normalizeRouteMode,
  parseAmapPolyline,
} from './lbsRouteAgent.js';

test('isRoutePlanningRequest recognizes navigation prompts', () => {
  assert.equal(isRoutePlanningRequest('从平江路到苏州博物馆怎么走？'), true);
  assert.equal(isRoutePlanningRequest('请给我步行路线到拙政园'), true);
  assert.equal(isRoutePlanningRequest('帮我介绍一下平江路的历史'), false);
  assert.equal(isRoutePlanningRequest('我第一次来苏州，我现在在平江路附近，能不能帮我规划一下游玩路线'), false);
});

test('isItineraryPlanningRequest recognizes travel-planning prompts', () => {
  assert.equal(isItineraryPlanningRequest('我第一次来苏州，我现在在平江路附近，能不能帮我规划一下游玩路线'), true);
  assert.equal(isItineraryPlanningRequest('第一次来苏州应该先去哪里？'), true);
  assert.equal(isItineraryPlanningRequest('从平江路到拙政园怎么走？'), false);
});

test('looksLikeDirectDestination recognizes standalone POI names', () => {
  assert.equal(looksLikeDirectDestination('观前街'), true);
  assert.equal(looksLikeDirectDestination('上海迪士尼'), true);
  assert.equal(looksLikeDirectDestination('帮我介绍观前街的历史'), false);
  assert.equal(looksLikeDirectDestination('第一次来苏州应该先去哪里'), false);
});

test('extractJsonObject parses direct JSON and wrapped JSON', () => {
  assert.deepEqual(extractJsonObject('{"start":"平江路","end":"苏州博物馆"}'), {
    start: '平江路',
    end: '苏州博物馆',
  });

  assert.deepEqual(extractJsonObject('输出如下：\n{"start":"当前位置","end":"拙政园"}\n谢谢'), {
    start: '当前位置',
    end: '拙政园',
  });
});

test('normalizeRouteMode falls back to walking', () => {
  assert.equal(normalizeRouteMode('driving'), 'driving');
  assert.equal(normalizeRouteMode('walking'), 'walking');
  assert.equal(normalizeRouteMode('bus'), 'walking');
});

test('isWithinSuzhouCity matches Suzhou aliases', () => {
  assert.equal(isWithinSuzhouCity('苏州市'), true);
  assert.equal(isWithinSuzhouCity('Suzhou Industrial Park'), true);
  assert.equal(isWithinSuzhouCity('上海市'), false);
});

test('haversineDistanceMeters returns stable distance for nearby points', () => {
  const distance = haversineDistanceMeters(
    { lng: 120.632247, lat: 31.311504 },
    { lng: 120.623563, lat: 31.325536 },
  );

  assert.equal(Number.isFinite(distance), true);
  assert.equal(distance > 1500, true);
  assert.equal(distance < 2500, true);
});

test('assertReasonableSuzhouRoute rejects abnormal routes', () => {
  assert.throws(
    () => assertReasonableSuzhouRoute(
      { lng: 120.632247, lat: 31.311504 },
      { lng: 116.4074, lat: 39.9042 },
    ),
    /苏州市范围/,
  );
});

test('parseAmapPolyline and mergeRoutePolylines deduplicate route points', () => {
  assert.deepEqual(parseAmapPolyline('120.1,31.1;120.2,31.2'), [
    { lng: 120.1, lat: 31.1 },
    { lng: 120.2, lat: 31.2 },
  ]);

  assert.deepEqual(mergeRoutePolylines([
    { polyline: '120.1,31.1;120.2,31.2' },
    { polyline: '120.2,31.2;120.3,31.3' },
  ]), [
    { lng: 120.1, lat: 31.1 },
    { lng: 120.2, lat: 31.2 },
    { lng: 120.3, lat: 31.3 },
  ]);
});

test('distance and duration formatters stay readable', () => {
  assert.equal(formatDistance(860), '860 米');
  assert.equal(formatDistance(2480), '2.5 公里');
  assert.equal(formatDuration(900), '约 15 分钟');
  assert.equal(formatDuration(5400), '约 1 小时 30 分钟');
});

test('distance and duration formatters support multiple reply languages', () => {
  assert.equal(formatDistance(860, 'en'), '860 m');
  assert.equal(formatDistance(2480, 'ja'), '2.5 km');
  assert.equal(formatDuration(900, 'en'), 'about 15 min');
  assert.equal(formatDuration(5400, 'ko'), '약 1시간 30분');
});
