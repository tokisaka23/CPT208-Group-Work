<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { gardenImmersiveScenes } from '../data/gardenImmersiveScenesDetailed';
import { gardenScenePreviews } from '../data/gardenScenePreviews';
import {
  buildDetailedGardenScene,
  isDetailedSuzhouScene,
  updateDetailedGardenAnimations,
} from '../lib/garden3d/sceneEngine';
import { currentLanguage, resolveLocalized } from '../i18n';

const props = defineProps({
  garden: {
    type: Object,
    required: true,
  },
});

const uiTextSource = {
  autoplay: { zh: '自动巡游', en: 'Auto Tour' },
  pause: { zh: '暂停镜头', en: 'Pause' },
  play: { zh: '继续巡游', en: 'Resume' },
  reset: { zh: '回到总览', en: 'Reset View' },
  cameraLabel: { zh: '镜头说明', en: 'Shot Note' },
  sceneLabel: { zh: '空间提示', en: 'Scene Cue' },
  detailViews: { zh: '细节机位', en: 'Detail Views' },
  stageReady: { zh: '实景预览已就绪', en: 'Preview ready' },
  stageRoaming: { zh: '镜头自动巡游中', en: 'Auto touring' },
  desktopHint: { zh: '可拖动画面旋转，点击热点切换节点。', en: 'Drag to orbit and tap hotspots to switch nodes.' },
  touchHint: { zh: '单指旋转，双指缩放，轻触热点切换节点。', en: 'Use one finger to rotate, two to zoom, and tap hotspots to switch nodes.' },
  unavailable: { zh: '当前园林还没有配置实景预览。', en: 'This garden does not have a scene preview yet.' },
  fallbackTitle: { zh: '当前设备未能开启 3D 预览', en: '3D preview is unavailable on this device' },
  fallbackBody: { zh: '你仍然可以通过右侧镜头卡片和细节机位查看拙政园这一段空间的组织方式。', en: 'You can still inspect the shot cards and detail views on the right.' },
};

const uiText = computed(() => resolveLocalized(uiTextSource, currentLanguage.value));

const sceneKey = computed(() => {
  const variant = props.garden?.design?.variant;
  if (variant === 'zhuozheng') return 'zhuozhengyuan';
  if (variant === 'wangshi') return 'wangshiyuan';
  if (variant === 'liu') return 'liuyuan';

  const slug = props.garden?.design?.slug || props.garden?.slug;
  if (slug) {
    return slug;
  }

  const englishName = props.garden?.englishName || '';
  if (englishName.includes('Humble Administrator')) return 'zhuozhengyuan';
  if (englishName.includes('Lingering Garden')) return 'liuyuan';
  if (englishName.includes('Master of Nets')) return 'wangshiyuan';

  return '';
});

const previewConfig = computed(() => {
  const config = gardenScenePreviews[sceneKey.value];
  return config ? resolveLocalized(config, currentLanguage.value) : null;
});
const rawSceneConfig = computed(() => gardenImmersiveScenes[sceneKey.value] || null);
const sceneConfig = computed(() => (rawSceneConfig.value ? resolveLocalized(rawSceneConfig.value, currentLanguage.value) : null));
const sceneItems = computed(() => sceneConfig.value?.items || []);
const shotItems = computed(() => previewConfig.value?.shots || []);
const statItems = computed(() => previewConfig.value?.stats || []);

const canvasHost = ref(null);
const renderState = ref('loading');
const isTouchLike = ref(false);
const autoplay = ref(true);
const activeShotId = ref('');
const activeItemId = ref('');

const activeShot = computed(
  () => shotItems.value.find((item) => item.id === activeShotId.value) || shotItems.value[0] || null,
);
const activeSceneItem = computed(
  () => sceneItems.value.find((item) => item.id === activeItemId.value)
    || sceneItems.value.find((item) => item.id === activeShot.value?.itemId)
    || null,
);
const activeDetailShots = computed(() => activeSceneItem.value?.detailShots || []);
const statusText = computed(() => (autoplay.value ? uiText.value.stageRoaming : uiText.value.stageReady));
const hintText = computed(() => (isTouchLike.value ? uiText.value.touchHint : uiText.value.desktopHint));

let renderer;
let scene;
let camera;
let controls;
let animationFrame = 0;
let resizeObserver;
let lastAutoStepAt = 0;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const interactiveMeshes = [];
const swayingTrees = [];
const animatedWaters = [];
const animatedHotspots = [];
const pointerState = {
  x: 0,
  y: 0,
  dragging: false,
};

let desiredCamera = null;
let desiredTarget = null;

const disposeMaterial = (material) => {
  if (Array.isArray(material)) {
    material.forEach((item) => disposeMaterial(item));
    return;
  }

  [
    'map',
    'alphaMap',
    'aoMap',
    'bumpMap',
    'displacementMap',
    'emissiveMap',
    'envMap',
    'lightMap',
    'metalnessMap',
    'normalMap',
    'roughnessMap',
    'clearcoatMap',
    'clearcoatNormalMap',
    'clearcoatRoughnessMap',
    'transmissionMap',
    'thicknessMap',
  ].forEach((key) => material?.[key]?.dispose?.());
  material?.dispose?.();
};

const disposeObject = (object) => {
  object.traverse((child) => {
    child.geometry?.dispose?.();
    disposeMaterial(child.material);
  });
};

const clearScene = () => {
  if (!scene) {
    return;
  }

  while (scene.children.length) {
    const child = scene.children[scene.children.length - 1];
    scene.remove(child);
    disposeObject(child);
  }

  interactiveMeshes.length = 0;
  swayingTrees.length = 0;
  animatedWaters.length = 0;
  animatedHotspots.length = 0;
};

const setCameraPose = (cameraPosition, targetPosition, instant = false) => {
  if (!camera || !controls) {
    return;
  }

  const nextCamera = new THREE.Vector3(...cameraPosition);
  const nextTarget = new THREE.Vector3(...targetPosition);

  if (instant) {
    camera.position.copy(nextCamera);
    controls.target.copy(nextTarget);
    desiredCamera = null;
    desiredTarget = null;
    controls.update();
    return;
  }

  desiredCamera = nextCamera;
  desiredTarget = nextTarget;
};

const focusItem = (itemId, options = {}) => {
  const item = sceneItems.value.find((entry) => entry.id === itemId);
  if (!item) {
    return;
  }

  activeItemId.value = item.id;
  const matchingShot = shotItems.value.find((entry) => entry.itemId === item.id);
  if (matchingShot) {
    activeShotId.value = matchingShot.id;
  }

  if (options.focus !== false) {
    setCameraPose(item.camera, item.target, options.instant);
  }

  if (options.userInitiated) {
    autoplay.value = false;
  }
};

const focusShot = (shotId, options = {}) => {
  const shot = shotItems.value.find((entry) => entry.id === shotId);
  if (!shot) {
    return;
  }

  activeShotId.value = shot.id;
  focusItem(shot.itemId, options);
};

const resetPreview = (instant = false) => {
  const current = sceneConfig.value;
  if (!current) {
    return;
  }

  setCameraPose(current.view.camera, current.view.target, instant);
};

const focusDetailShot = (detailShot) => {
  if (!detailShot) {
    return;
  }

  autoplay.value = false;
  setCameraPose(detailShot.camera, detailShot.target);
};

const focusNextShot = () => {
  if (!shotItems.value.length) {
    return;
  }

  const currentIndex = shotItems.value.findIndex((entry) => entry.id === activeShotId.value);
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % shotItems.value.length : 0;
  focusShot(shotItems.value[nextIndex].id, { userInitiated: false });
};

const buildScene = () => {
  if (!scene || !renderer || !sceneConfig.value || !isDetailedSuzhouScene(sceneConfig.value)) {
    return;
  }

  clearScene();

  buildDetailedGardenScene({
    scene,
    renderer,
    config: sceneConfig.value,
    sceneItems: sceneItems.value,
    interactiveMeshes,
    swayingTrees,
    animatedWaters,
    animatedHotspots,
  });

  controls.minDistance = sceneConfig.value.view.minDistance;
  controls.maxDistance = sceneConfig.value.view.maxDistance;
  resetPreview(true);
};

const resizeRenderer = () => {
  if (!canvasHost.value || !renderer || !camera) {
    return;
  }

  const width = canvasHost.value.clientWidth || 1;
  const height = canvasHost.value.clientHeight || 1;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
};

const pickItem = (event) => {
  if (!renderer || !camera) {
    return;
  }

  const bounds = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
  pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  const hit = raycaster.intersectObjects(interactiveMeshes, false).find((entry) => entry.object.userData.itemId);
  if (hit?.object?.userData?.itemId) {
    focusItem(hit.object.userData.itemId, { userInitiated: true });
  }
};

const handlePointerDown = (event) => {
  pointerState.x = event.clientX;
  pointerState.y = event.clientY;
  pointerState.dragging = false;
};

const handlePointerMove = (event) => {
  const deltaX = event.clientX - pointerState.x;
  const deltaY = event.clientY - pointerState.y;

  if (Math.hypot(deltaX, deltaY) > 6) {
    pointerState.dragging = true;
  }

  if (!renderer || pointerState.dragging) {
    return;
  }

  const bounds = renderer.domElement.getBoundingClientRect();
  pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
  pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hovering = raycaster.intersectObjects(interactiveMeshes, false).some((entry) => entry.object.userData.itemId);
  renderer.domElement.style.cursor = hovering ? 'pointer' : '';
};

const handlePointerUp = (event) => {
  if (!pointerState.dragging) {
    pickItem(event);
  }
};

const animate = () => {
  animationFrame = window.requestAnimationFrame(animate);
  const elapsed = performance.now() * 0.001;

  updateDetailedGardenAnimations({
    elapsed,
    camera,
    activeItemId: activeItemId.value,
    swayingTrees,
    animatedWaters,
    animatedHotspots,
  });

  if (camera && controls && desiredCamera && desiredTarget) {
    camera.position.lerp(desiredCamera, 0.08);
    controls.target.lerp(desiredTarget, 0.1);

    if (camera.position.distanceTo(desiredCamera) < 0.05 && controls.target.distanceTo(desiredTarget) < 0.05) {
      camera.position.copy(desiredCamera);
      controls.target.copy(desiredTarget);
      desiredCamera = null;
      desiredTarget = null;
    }
  }

  if (controls) {
    controls.autoRotate = autoplay.value && !desiredCamera;
    controls.autoRotateSpeed = 0.35;
    controls.update();
  }

  if (
    autoplay.value
    && shotItems.value.length > 1
    && !desiredCamera
    && performance.now() - lastAutoStepAt > 5600
  ) {
    focusNextShot();
    lastAutoStepAt = performance.now();
  }

  renderer?.render(scene, camera);

  if (renderer && renderState.value !== 'ready') {
    renderState.value = 'ready';
  }
};

const initThree = () => {
  if (!canvasHost.value) {
    return;
  }

  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.03;
  } catch (error) {
    renderState.value = 'fallback';
    return;
  }

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(42, 1, 0.1, 140);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.screenSpacePanning = true;
  controls.minPolarAngle = 0.72;
  controls.maxPolarAngle = 1.42;
  controls.touches.ONE = THREE.TOUCH.ROTATE;
  controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
  controls.addEventListener('start', () => {
    autoplay.value = false;
  });

  renderer.domElement.addEventListener('pointerdown', handlePointerDown);
  renderer.domElement.addEventListener('pointermove', handlePointerMove);
  renderer.domElement.addEventListener('pointerup', handlePointerUp);
  renderer.domElement.addEventListener('pointercancel', () => {
    pointerState.dragging = false;
  });

  canvasHost.value.appendChild(renderer.domElement);
  resizeRenderer();
  animate();

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => resizeRenderer());
    resizeObserver.observe(canvasHost.value);
  }
};

const destroyThree = () => {
  if (animationFrame) {
    window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  }

  if (renderer?.domElement) {
    renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
    renderer.domElement.removeEventListener('pointermove', handlePointerMove);
    renderer.domElement.removeEventListener('pointerup', handlePointerUp);
    renderer.domElement.remove();
  }

  resizeObserver?.disconnect();
  clearScene();
  controls?.dispose();
  renderer?.dispose();

  renderer = null;
  scene = null;
  camera = null;
  controls = null;
  resizeObserver = null;
  renderState.value = 'loading';
};

const toggleAutoplay = () => {
  autoplay.value = !autoplay.value;
  lastAutoStepAt = performance.now();

  if (autoplay.value && activeShot.value) {
    focusShot(activeShot.value.id, { userInitiated: false });
  }
};

watch(sceneKey, () => {
  if (!sceneConfig.value || !previewConfig.value) {
    return;
  }

  renderState.value = 'loading';
  activeShotId.value = shotItems.value[0]?.id || '';
  activeItemId.value = shotItems.value[0]?.itemId || '';

  if (scene) {
    buildScene();
    if (activeShotId.value) {
      focusShot(activeShotId.value, { instant: true, userInitiated: false });
    }
  }
}, { immediate: true });

onMounted(() => {
  isTouchLike.value = window.matchMedia?.('(pointer: coarse)').matches ?? false;
  initThree();

  if (sceneConfig.value && previewConfig.value) {
    buildScene();
    if (shotItems.value[0]) {
      focusShot(shotItems.value[0].id, { instant: true, userInitiated: false });
    }
  }
});

onBeforeUnmount(() => {
  destroyThree();
});
</script>

<template>
  <section
    :class="[
      'detail-panel',
      'scene-preview',
      { 'scene-preview--empty': !previewConfig || !sceneConfig },
    ]"
  >
    <template v-if="previewConfig && sceneConfig">
    <div class="scene-preview__header">
      <div class="scene-preview__copy">
        <p class="eyebrow">{{ previewConfig.eyebrow }}</p>
        <h2>{{ previewConfig.title }}</h2>
        <p>{{ previewConfig.intro }}</p>
      </div>

      <div class="scene-preview__stats">
        <article v-for="item in statItems" :key="item.label" class="scene-preview__stat">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </article>
      </div>
    </div>

    <div class="scene-preview__layout">
      <div class="scene-preview__stage-card">
        <div class="scene-preview__toolbar">
          <span class="scene-preview__status">{{ statusText }}</span>
          <div class="scene-preview__actions">
            <button type="button" class="scene-preview__button" @click="toggleAutoplay">
              {{ autoplay ? uiText.pause : uiText.play }}
            </button>
            <button type="button" class="scene-preview__button scene-preview__button--ghost" @click="resetPreview()">
              {{ uiText.reset }}
            </button>
          </div>
        </div>

        <div class="scene-preview__stage">
          <div ref="canvasHost" class="scene-preview__canvas" />

          <div v-if="renderState === 'fallback'" class="scene-preview__fallback">
            <strong>{{ uiText.fallbackTitle }}</strong>
            <span>{{ uiText.fallbackBody }}</span>
          </div>

          <div class="scene-preview__hud">
            <span>{{ hintText }}</span>
          </div>
        </div>

        <div class="scene-preview__timeline">
          <button
            v-for="shot in shotItems"
            :key="shot.id"
            type="button"
            :class="['scene-preview__timeline-item', { 'is-active': shot.id === activeShot?.id }]"
            @click="focusShot(shot.id, { userInitiated: true })"
          >
            <img v-if="shot.image" :src="shot.image" :alt="shot.title" />
            <span>{{ shot.label }}</span>
            <strong>{{ shot.title }}</strong>
          </button>
        </div>
      </div>

      <aside class="scene-preview__panel">
        <article class="scene-preview__focus">
          <p class="eyebrow">{{ activeShot?.label }}</p>
          <h3>{{ activeShot?.title }}</h3>
          <p>{{ activeShot?.summary }}</p>

          <div v-if="activeShot?.tags?.length" class="scene-preview__tags">
            <span v-for="tag in activeShot.tags" :key="tag">{{ tag }}</span>
          </div>
        </article>

        <article class="scene-preview__info">
          <span>{{ uiText.sceneLabel }}</span>
          <p>{{ activeSceneItem?.history }}</p>
        </article>

        <article class="scene-preview__info">
          <span>{{ uiText.cameraLabel }}</span>
          <p>{{ activeSceneItem?.play }}</p>
        </article>

        <article v-if="activeDetailShots.length" class="scene-preview__details">
          <span>{{ uiText.detailViews }}</span>
          <div class="scene-preview__detail-grid">
            <button
              v-for="detailShot in activeDetailShots"
              :key="detailShot.label"
              type="button"
              class="scene-preview__detail-chip"
              @click="focusDetailShot(detailShot)"
            >
              {{ detailShot.label }}
            </button>
          </div>
        </article>
      </aside>
    </div>
    </template>

    <template v-else>
      <p>{{ uiText.unavailable }}</p>
    </template>
  </section>
</template>

<style scoped>
.scene-preview {
  display: grid;
  gap: 22px;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(var(--garden-accent-rgb), 0.14), transparent 32%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(247, 244, 238, 0.92));
}

.scene-preview__header,
.scene-preview__layout {
  display: grid;
  gap: 18px;
}

.scene-preview__header {
  grid-template-columns: minmax(0, 1.25fr) minmax(280px, 0.75fr);
  align-items: start;
}

.scene-preview__copy {
  display: grid;
  gap: 10px;
}

.scene-preview__copy h2,
.scene-preview__focus h3 {
  margin: 0;
  font-family: var(--font-serif);
  line-height: 1.28;
}

.scene-preview__copy p:last-child,
.scene-preview__focus p,
.scene-preview__info p,
.scene-preview__fallback span,
.scene-preview__hud span,
.scene-preview--empty p {
  margin: 0;
  color: var(--garden-muted);
  line-height: 1.78;
}

.scene-preview__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.scene-preview__stat,
.scene-preview__focus,
.scene-preview__info,
.scene-preview__details,
.scene-preview__panel {
  border: 1px solid rgba(var(--garden-accent-rgb), 0.12);
  background: rgba(255, 255, 255, 0.76);
}

.scene-preview__stat {
  display: grid;
  gap: 8px;
  padding: 18px;
  border-radius: 20px;
}

.scene-preview__stat span,
.scene-preview__info span,
.scene-preview__details > span {
  color: var(--garden-accent);
}

.scene-preview__stat strong {
  line-height: 1.4;
}

.scene-preview__layout {
  grid-template-columns: minmax(0, 1.28fr) minmax(320px, 0.72fr);
  align-items: start;
}

.scene-preview__stage-card {
  display: grid;
  gap: 16px;
}

.scene-preview__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.scene-preview__status {
  padding: 0.48rem 0.8rem;
  border-radius: 999px;
  background: rgba(var(--garden-accent-rgb), 0.1);
  color: var(--garden-accent);
  font-size: 0.8rem;
  letter-spacing: 0.08em;
}

.scene-preview__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.scene-preview__button,
.scene-preview__timeline-item,
.scene-preview__detail-chip {
  border: 1px solid rgba(var(--garden-accent-rgb), 0.16);
  background: rgba(255, 255, 255, 0.82);
  color: var(--garden-accent);
  transition:
    transform 0.24s ease,
    border-color 0.24s ease,
    box-shadow 0.24s ease,
    background-color 0.24s ease;
}

.scene-preview__button {
  padding: 0.76rem 0.96rem;
  border-radius: 999px;
  cursor: pointer;
}

.scene-preview__button--ghost {
  background: rgba(255, 255, 255, 0.56);
}

.scene-preview__button:hover,
.scene-preview__timeline-item:hover,
.scene-preview__timeline-item.is-active,
.scene-preview__detail-chip:hover {
  transform: translateY(-1px);
  border-color: rgba(var(--garden-accent-rgb), 0.3);
  background: rgba(var(--garden-accent-rgb), 0.12);
  box-shadow: 0 14px 24px rgba(var(--garden-accent-rgb), 0.12);
}

.scene-preview__stage {
  position: relative;
  min-height: 640px;
  overflow: hidden;
  border-radius: 30px;
  border: 1px solid rgba(var(--garden-accent-rgb), 0.14);
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.34), transparent 34%),
    linear-gradient(180deg, rgba(216, 228, 220, 0.76), rgba(242, 236, 224, 0.96));
}

.scene-preview__canvas {
  width: 100%;
  height: 100%;
  min-height: 640px;
  touch-action: none;
}

.scene-preview__canvas :deep(canvas) {
  display: block;
  width: 100% !important;
  height: 100% !important;
}

.scene-preview__fallback {
  position: absolute;
  inset: 18px;
  display: grid;
  place-content: center;
  gap: 10px;
  padding: 24px;
  border-radius: 24px;
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.62), transparent 38%),
    linear-gradient(180deg, rgba(240, 235, 224, 0.74), rgba(228, 239, 233, 0.82));
  color: var(--garden-accent);
  text-align: center;
}

.scene-preview__hud {
  position: absolute;
  left: 20px;
  bottom: 20px;
  max-width: min(420px, calc(100% - 40px));
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.64);
  backdrop-filter: blur(12px);
}

.scene-preview__timeline {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.scene-preview__timeline-item {
  display: grid;
  gap: 10px;
  padding: 10px;
  border-radius: 20px;
  text-align: left;
  cursor: pointer;
}

.scene-preview__timeline-item img {
  width: 100%;
  height: 96px;
  object-fit: cover;
  border-radius: 14px;
}

.scene-preview__timeline-item span {
  color: var(--garden-muted);
  font-size: 0.8rem;
}

.scene-preview__timeline-item strong {
  line-height: 1.45;
}

.scene-preview__panel {
  display: grid;
  gap: 14px;
  padding: 14px;
  border-radius: 28px;
}

.scene-preview__focus,
.scene-preview__info,
.scene-preview__details {
  display: grid;
  gap: 10px;
  padding: 20px;
  border-radius: 22px;
}

.scene-preview__tags,
.scene-preview__detail-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.scene-preview__tags span {
  padding: 0.44rem 0.74rem;
  border-radius: 999px;
  background: rgba(var(--garden-accent-rgb), 0.08);
  color: var(--garden-accent);
}

.scene-preview__detail-chip {
  padding: 0.62rem 0.88rem;
  border-radius: 999px;
  cursor: pointer;
}

.scene-preview--empty {
  min-height: auto;
}

@media (max-width: 1120px) {
  .scene-preview__header,
  .scene-preview__layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 820px) {
  .scene-preview__stats,
  .scene-preview__timeline {
    grid-template-columns: 1fr;
  }

  .scene-preview__stage,
  .scene-preview__canvas {
    min-height: 520px;
  }
}

@media (max-width: 640px) {
  .scene-preview__toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .scene-preview__actions {
    justify-content: stretch;
  }

  .scene-preview__button {
    width: 100%;
  }

  .scene-preview__stage,
  .scene-preview__canvas {
    min-height: 420px;
  }
}
</style>
