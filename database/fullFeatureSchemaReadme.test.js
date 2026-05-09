import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('database setup documents full feature schema and demo users', () => {
  const sql = readFileSync('database/004_app_feature_schema_and_demo_data.sql', 'utf8');
  const readme = readFileSync('README.md', 'utf8');

  [
    'create table if not exists public.ugc_pois',
    'create table if not exists public.conversations',
    'create table if not exists public.chat_history',
    'storage.buckets',
    'demo.alice@sucity.local',
    'demo.ben@sucity.local',
  ].forEach((expected) => {
    assert.match(sql, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  });

  assert.match(readme, /database\/004_app_feature_schema_and_demo_data\.sql/);
  assert.match(readme, /demo\.alice@sucity\.local/);
  assert.match(readme, /DemoPass2026!/);
});
