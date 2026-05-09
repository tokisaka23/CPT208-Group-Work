import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import test from 'node:test';

test('ai logs document primary prompts for core components', () => {
  const files = readdirSync('ai-logs').filter((file) => /^\d{2}-.+\.md$/.test(file));

  assert.ok(files.length >= 6);

  const combined = files
    .map((file) => readFileSync(`ai-logs/${file}`, 'utf8'))
    .join('\n');

  [
    'Primary Prompt Summary',
    'Human Review And Verification',
    'AI guide',
    '720',
    'Supabase',
    'UGC',
    'WebP',
    'MP3',
    'SQL',
    'demo user',
  ].forEach((expected) => {
    assert.match(combined, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  });
});
