import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./ScenicMapDialog.vue', import.meta.url), 'utf8');

test('ScenicMapDialog uses language-aware scenic map i18n helpers', () => {
  assert.match(source, /import \{ useLanguage \} from '\.\.\/\.\.\/i18n';/);
  assert.match(source, /getScenicMapDialogText/);
  assert.match(source, /getScenicSearchOptions/);
  assert.match(source, /watch\(\(\) => language\.value, async \(\) => \{/);
});

test('ScenicMapDialog no longer hardcodes key navigation controls in Chinese', () => {
  assert.doesNotMatch(source, />步行导航</);
  assert.doesNotMatch(source, />车行导航</);
  assert.doesNotMatch(source, />刷新路线</);
  assert.doesNotMatch(source, />缩到侧边</);
  assert.doesNotMatch(source, />导航顺序</);
  assert.doesNotMatch(source, />AI 路线步骤</);
});
