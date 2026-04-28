import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { formatUgcSubmitMessage, getUgcSubmitText } from './ugcSubmitI18n.js';

test('ugc submit copy resolves with the active language', () => {
  const english = getUgcSubmitText('en');
  const chinese = getUgcSubmitText('zh');
  const japanese = getUgcSubmitText('ja');
  const korean = getUgcSubmitText('ko');

  assert.equal(english.title, 'Upload a New Place');
  assert.equal(english.submitButton, 'Submit Place');
  assert.equal(english.locationSuccess, 'Location found');
  assert.equal(chinese.title, '上传新景点');
  assert.equal(japanese.applyCrop, 'トリミングを適用');
  assert.equal(korean.uploadImage, '이미지 업로드');
});

test('ugc submit dynamic messages are localizable', () => {
  const english = getUgcSubmitText('en');

  assert.equal(
    formatUgcSubmitMessage(english.uploadFailedResult, { message: 'network error' }),
    'Image upload failed: network error',
  );
  assert.equal(
    formatUgcSubmitMessage(english.submitSuccessResult, { name: 'Pingjiang Teahouse' }),
    'Submitted: Pingjiang Teahouse',
  );
});

test('ugc submit component binds visible copy through the i18n text object', () => {
  const source = readFileSync(new URL('./UgcSubmit.vue', import.meta.url), 'utf8');

  assert.match(source, /getUgcSubmitText/);
  assert.match(source, /const text = computed/);
  assert.match(source, /\{\{ text\.title \}\}/);
  assert.match(source, /:label="text\.nameLabel"/);
  assert.match(source, /:placeholder="text\.descriptionPlaceholder"/);
  assert.match(source, /showFailToast\(text\.value\.loginRequired\)/);
  assert.match(source, /showSuccessToast\(text\.value\.submitSuccess\)/);
});
