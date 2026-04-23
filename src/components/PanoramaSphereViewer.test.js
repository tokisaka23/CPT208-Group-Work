import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('PanoramaSphereViewer keeps fallback hotspots out of spherical scenes', async () => {
  const source = await readFile(new URL('./PanoramaSphereViewer.vue', import.meta.url), 'utf8');

  assert.match(
    source,
    /const fallbackHotspots = computed\(\(\) => \{\s*if \(useSphereMode\.value && hasSphericalHotspots\.value\) \{\s*return \[\];/s,
  );
});

test('PanoramaSphereViewer applies sharper texture sampling for mobile panoramas', async () => {
  const source = await readFile(new URL('./PanoramaSphereViewer.vue', import.meta.url), 'utf8');

  assert.match(source, /LinearMipmapLinearFilter/);
  assert.match(source, /texture\.anisotropy = Math\.min/);
  assert.match(source, /renderer\.setPixelRatio\(Math\.min\(window\.devicePixelRatio \|\| 1, isMobileViewport\(\) \? 2 : 2\)\)/);
  assert.match(source, /renderer\.setSize\(width, height\);/);
  assert.match(source, /renderer\.domElement\.style\.width = '100%';/);
});
