import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolveLocalized } from '../i18n/index.js';

const pingjiangRoadSource = {
  name: { zh: '平江路', en: 'Pingjiang Road', ja: '平江路', ko: '평강로' },
  nextGarden: {
    label: { zh: '苏州博物馆', en: 'Suzhou Museum', ja: '蘇州博物館', ko: '쑤저우 박물관' },
    href: '/suzhou-museum',
  },
};

const homeSeasonSource = {
  title: {
    zh: '先去天平山看枫叶，再把园林和古街的秋意接起来。',
    en: 'Start with the maples of Tianping Mountain, then connect that autumn mood back to gardens and old streets.',
    ja: 'まず天平山の紅葉へ行き、その秋の気配を庭園と古い街路へつないでいく。',
    ko: '먼저 천평산의 단풍을 보고, 그 가을 분위기를 정원과 옛 거리로 이어간다.',
  },
};

test('localized route content resolves the new Pingjiang Road page title for each language', () => {
  assert.equal(resolveLocalized(pingjiangRoadSource, 'zh').name, '平江路');
  assert.equal(resolveLocalized(pingjiangRoadSource, 'en').name, 'Pingjiang Road');
  assert.equal(resolveLocalized(pingjiangRoadSource, 'ja').name, '平江路');
  assert.equal(resolveLocalized(pingjiangRoadSource, 'ko').name, '평강로');
});

test('localized route content keeps the linked destination for the new detail pages', () => {
  const localized = resolveLocalized(pingjiangRoadSource, 'en');
  assert.equal(localized.nextGarden.label, 'Suzhou Museum');
  assert.equal(localized.nextGarden.href, '/suzhou-museum');
});

test('autumn home copy resolves cleanly in all supported languages', () => {
  assert.match(resolveLocalized(homeSeasonSource, 'zh').title, /天平山/);
  assert.match(resolveLocalized(homeSeasonSource, 'en').title, /Tianping Mountain/);
  assert.match(resolveLocalized(homeSeasonSource, 'ja').title, /天平山/);
  assert.match(resolveLocalized(homeSeasonSource, 'ko').title, /천평산/);
});

test('router points the remaining localized routes at the new I18n views', () => {
  const routerSource = readFileSync(new URL('../router/index.js', import.meta.url), 'utf8');
  assert.match(routerSource, /PingjiangI18n\.vue/);
  assert.match(routerSource, /PingjiangRoadViewI18n\.vue/);
  assert.match(routerSource, /SuzhouMuseumViewI18n\.vue/);
  assert.match(routerSource, /TianpingShanViewI18n\.vue/);
});
