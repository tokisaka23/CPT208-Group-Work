import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Zhuozheng panorama roam view wires background music autoplay', async () => {
  const source = await readFile(new URL('./ZhuozhengPanoramaRoamView.vue', import.meta.url), 'utf8');

  assert.match(source, /new URL\('\.\.\/\.\.\/music\/02\.[\s\S]*\.mp3', import\.meta\.url\)\.href/);
  assert.match(source, /const panoramaMusicVolume = 0\.25;/);
  assert.match(source, /<audio[\s\S]*ref="backgroundAudioRef"[\s\S]*autoplay[\s\S]*loop[\s\S]*playsinline/);
  assert.match(source, /audioElement\.volume = panoramaMusicVolume;/);
  assert.match(source, /resumeBackgroundMusic\(\)\.catch\(\(\) => \{\s*ensureResumeAudioListeners\(\);/);
  assert.match(source, /audioElement\.pause\(\);\s*audioElement\.currentTime = 0;/);
});
