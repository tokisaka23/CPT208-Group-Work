import test from 'node:test';
import assert from 'node:assert/strict';

import {
  detectMessageLanguage,
  inferChatLanguage,
} from './chatLanguage.js';

test('detectMessageLanguage recognizes supported chat languages', () => {
  assert.equal(detectMessageLanguage('Could you help me plan an itinerary around Pingjiang Road?'), 'en');
  assert.equal(detectMessageLanguage('可以帮我规划一下平江路附近的路线吗？'), 'zh');
  assert.equal(detectMessageLanguage('平江路はどこから歩くのがおすすめですか？'), 'ja');
  assert.equal(detectMessageLanguage('평강로 근처에서 어떻게 시작하면 좋을까요?'), 'ko');
});

test('detectMessageLanguage prefers English for Latin-dominant mixed prompts', () => {
  assert.equal(detectMessageLanguage('How do I get from 平江路 to Suzhou Museum?'), 'en');
});

test('inferChatLanguage falls back to the latest user-language signal', () => {
  assert.equal(inferChatLanguage({
    message: '...',
    messages: [
      { role: 'assistant', content: '当然可以。' },
      { role: 'user', content: 'Can you help me plan an itinerary?' },
      { role: 'assistant', content: 'Sure.' },
    ],
    fallbackLanguage: 'zh',
  }), 'en');
});

test('inferChatLanguage uses the provided fallback when no signal exists', () => {
  assert.equal(inferChatLanguage({
    message: '12345',
    messages: [],
    fallbackLanguage: 'ko',
  }), 'ko');
});
