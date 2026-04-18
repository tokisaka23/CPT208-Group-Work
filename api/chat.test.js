import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildGuideSystemPrompt,
  buildRouteAssistantReply,
} from './chat.js';

test('buildGuideSystemPrompt follows the requested reply language', () => {
  const prompt = buildGuideSystemPrompt({
    gpsLocation: 'Pingjiang Road',
    itineraryRequested: true,
    replyLanguage: 'en',
  });

  assert.match(prompt, /Current page context: Pingjiang Road/);
  assert.match(prompt, /Reply in warm, conversational English/);
  assert.match(prompt, /keep it within 150 words/i);
});

test('buildRouteAssistantReply localizes route summaries in English', () => {
  const reply = buildRouteAssistantReply({
    start: { name: 'Pingjiang Road' },
    end: { name: 'Suzhou Museum' },
    preferredMode: 'walking',
    walkingPlan: { distance: 860, duration: 900 },
    drivingPlan: { distance: 2480, duration: 540 },
    transitPlan: { summary: 'Transit about 18 min, walk 320 m, fare depends on the line.' },
    language: 'en',
  });

  assert.match(reply, /from Pingjiang Road to Suzhou Museum/i);
  assert.match(reply, /I prioritized walking/i);
  assert.match(reply, /Walking about 860 m, about 15 min/i);
  assert.match(reply, /Driving about 2\.5 km, about 9 min/i);
  assert.match(reply, /Transit about 18 min, walk 320 m/i);
});
