<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { currentLanguage, resolveLocalized } from '../i18n';
import ScenicMapDialog from './maps/ScenicMapDialog.vue';
import { resolveSuzhouPoi } from '../data/poiMapData';

const props = defineProps({
  garden: {
    type: Object,
    required: true,
  },
});

const legacyRouteMap = {
  '#home': '/',
  '#/gardens/zhuozhengyuan': '/zhuozheng',
  '#/gardens/liuyuan': '/liu',
  '#/gardens/wangshiyuan': '/wangshi',
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const isExternalLink = (target) => typeof target === 'string' && /^(https?:)?\/\//.test(target);

const resolveRouteTarget = (target) => {
  if (!target) return '/';
  if (typeof target !== 'string') return target;

  if (legacyRouteMap[target]) {
    return legacyRouteMap[target];
  }

  if (target.startsWith('#/')) {
    return target.slice(1);
  }

  return target;
};

const resolveLinkComponent = (target) => (isExternalLink(target) ? 'a' : RouterLink);

const resolveLinkProps = (target) => {
  if (isExternalLink(target)) {
    return { href: target };
  }

  return { to: resolveRouteTarget(target) };
};

const design = computed(() => props.garden.design || {});
const variant = computed(() => design.value.variant || 'zhuozheng');
const galleryItems = computed(() => props.garden.gallery || []);
const floatingTags = computed(() => design.value.floatingTags || props.garden.badges || []);
const mapVisible = ref(false);
const resolvedPoi = computed(() => (
  resolveSuzhouPoi(props.garden.mapSlug || props.garden.slug || props.garden.name)
));
const immersive = computed(() => props.garden.immersive || null);
const arExperience = computed(() => immersive.value?.ar || null);
const vrExperience = computed(() => immersive.value?.vr || null);
const arHotspots = computed(() => arExperience.value?.hotspots || []);
const vrScenes = computed(() => vrExperience.value?.scenes || []);

const activeImmersiveMode = ref('');
const activeArHotspotId = ref('');
const activeVrSceneId = ref('');
const activeVrHotspotId = ref('');
const vrPan = ref(50);
const vrDragging = ref(false);
const vrDragStartX = ref(0);
const vrDragStartPan = ref(50);

const arVideoRef = ref(null);
const cameraStream = ref(null);
const cameraState = ref('idle');
const cameraError = ref('');

const pageTextSource = {
  preludeLabel: {
    zh: '观园引子',
    en: 'Garden Prelude',
    ja: 'Garden Prelude',
    ko: 'Garden Prelude',
  },
  backLabel: {
    zh: '返回首页',
    en: 'Back to Home',
    ja: 'Back to Home',
    ko: 'Back to Home',
  },
  nextPrefix: {
    zh: '继续看 ',
    en: 'Next: ',
    ja: 'Next: ',
    ko: 'Next: ',
  },
  highlightsEyebrow: {
    zh: '核心看点',
    en: 'Highlights',
    ja: 'Highlights',
    ko: 'Highlights',
  },
  highlightsTitle: {
    zh: '这座园林值得慢慢看的地方',
    en: 'Why this garden deserves a slower look',
    ja: 'Why this garden deserves a slower look',
    ko: 'Why this garden deserves a slower look',
  },
  highlightIntro: {
    zh: '把速度放慢一点，园林真正的层次会在转折、停顿与回望中浮现出来。',
    en: 'Slow down a little and the garden\'s real layers will emerge through turns, pauses, and return glances.',
    ja: 'Slow down a little and the garden\'s real layers will emerge through turns, pauses, and return glances.',
    ko: 'Slow down a little and the garden\'s real layers will emerge through turns, pauses, and return glances.',
  },
  galleryEyebrow: {
    zh: '横向画卷',
    en: 'Horizontal Scroll',
    ja: 'Horizontal Scroll',
    ko: 'Horizontal Scroll',
  },
  galleryTitle: {
    zh: '沿着一卷景色慢慢展开',
    en: 'Unfold the scenery like a long handscroll',
    ja: 'Unfold the scenery like a long handscroll',
    ko: 'Unfold the scenery like a long handscroll',
  },
  galleryIntro: {
    zh: '横向轻扫，让视线像展开手卷一样，一景接一景地慢慢打开。',
    en: 'Move sideways and let the view open scene by scene, like unrolling a scroll.',
    ja: 'Move sideways and let the view open scene by scene, like unrolling a scroll.',
    ko: 'Move sideways and let the view open scene by scene, like unrolling a scroll.',
  },
  stepperEyebrow: {
    zh: '可视化游线',
    en: 'Route in View',
    ja: 'Route in View',
    ko: 'Route in View',
  },
  stepperTitle: {
    zh: '一条更顺的游览顺序',
    en: 'A smoother order for walking through the garden',
    ja: 'A smoother order for walking through the garden',
    ko: 'A smoother order for walking through the garden',
  },
  stepperIntro: {
    zh: '先建立整体感，再回到细节和边缘位置，游园节奏会更顺。',
    en: 'Build an overall sense first, then return to details and edge spaces.',
    ja: 'Build an overall sense first, then return to details and edge spaces.',
    ko: 'Build an overall sense first, then return to details and edge spaces.',
  },
  tipsEyebrow: {
    zh: '慢游贴士',
    en: 'Slow Travel Notes',
    ja: 'Slow Travel Notes',
    ko: 'Slow Travel Notes',
  },
  tipsTitle: {
    zh: '第一次来可以这样安排',
    en: 'A good way to arrange your first visit',
    ja: 'A good way to arrange your first visit',
    ko: 'A good way to arrange your first visit',
  },
  tipsIntro: {
    zh: '不赶时间时，景会慢慢长出来；留白和停顿，也是这页设计里很重要的一部分。',
    en: 'When you are not in a hurry, the scenery grows slowly. Emptiness and pause are part of the design too.',
    ja: 'When you are not in a hurry, the scenery grows slowly. Emptiness and pause are part of the design too.',
    ko: 'When you are not in a hurry, the scenery grows slowly. Emptiness and pause are part of the design too.',
  },
  immersiveEyebrow: {
    zh: '沉浸互动',
    en: 'Immersive Modes',
    ja: 'Immersive Modes',
    ko: 'Immersive Modes',
  },
  immersiveTitle: {
    zh: 'AR / VR 游园体验',
    en: 'AR / VR Garden Experience',
    ja: 'AR / VR Garden Experience',
    ko: 'AR / VR Garden Experience',
  },
  immersiveIntro: {
    zh: '切换到 AR 导览或 VR 漫游，用更贴近现场的方式重新读这座园林。',
    en: 'Switch into AR guidance or VR roaming to read the garden in a more spatial way.',
    ja: 'Switch into AR guidance or VR roaming to read the garden in a more spatial way.',
    ko: 'Switch into AR guidance or VR roaming to read the garden in a more spatial way.',
  },
  arLabel: {
    zh: 'AR 导览',
    en: 'AR Guide',
    ja: 'AR Guide',
    ko: 'AR Guide',
  },
  vrLabel: {
    zh: 'VR 漫游',
    en: 'VR Tour',
    ja: 'VR Tour',
    ko: 'VR Tour',
  },
  hotspotStatLabel: {
    zh: '交互热点',
    en: 'Hotspots',
    ja: 'Hotspots',
    ko: 'Hotspots',
  },
  sceneStatLabel: {
    zh: '漫游场景',
    en: 'Scenes',
    ja: 'Scenes',
    ko: 'Scenes',
  },
  arAction: {
    zh: '开启 AR 导览',
    en: 'Launch AR Guide',
    ja: 'Launch AR Guide',
    ko: 'Launch AR Guide',
  },
  vrAction: {
    zh: '开启 VR 漫游',
    en: 'Launch VR Tour',
    ja: 'Launch VR Tour',
    ko: 'Launch VR Tour',
  },
  closeImmersive: {
    zh: '关闭',
    en: 'Close',
    ja: 'Close',
    ko: 'Close',
  },
  selectedPoint: {
    zh: '当前讲解',
    en: 'Current Hotspot',
    ja: 'Current Hotspot',
    ko: 'Current Hotspot',
  },
  currentScene: {
    zh: '当前场景',
    en: 'Current Scene',
    ja: 'Current Scene',
    ko: 'Current Scene',
  },
  observeLabel: {
    zh: '建议留意',
    en: 'Look For',
    ja: 'Look For',
    ko: 'Look For',
  },
  arUsageHint: {
    zh: '点击画面中的热点，查看园林重点说明。',
    en: 'Tap the hotspots to inspect key garden details.',
    ja: 'Tap the hotspots to inspect key garden details.',
    ko: 'Tap the hotspots to inspect key garden details.',
  },
  vrUsageHint: {
    zh: '左右拖拽画面切换视角，再点热点读取场景说明。',
    en: 'Drag left or right to pan, then tap hotspots to read the scene.',
    ja: 'Drag left or right to pan, then tap hotspots to read the scene.',
    ko: 'Drag left or right to pan, then tap hotspots to read the scene.',
  },
  liveCameraReady: {
    zh: '实景摄像头已开启',
    en: 'Live camera active',
    ja: 'Live camera active',
    ko: 'Live camera active',
  },
  requestingCamera: {
    zh: '正在请求摄像头权限',
    en: 'Requesting camera access',
    ja: 'Requesting camera access',
    ko: 'Requesting camera access',
  },
  cameraFallback: {
    zh: '已切换到图像叠加模式',
    en: 'Switched to image overlay mode',
    ja: 'Switched to image overlay mode',
    ko: 'Switched to image overlay mode',
  },
  cameraUnsupported: {
    zh: '当前设备不支持摄像头叠加',
    en: 'Camera overlay is not supported on this device',
    ja: 'Camera overlay is not supported on this device',
    ko: 'Camera overlay is not supported on this device',
  },
  cameraBlocked: {
    zh: '摄像头未授权，已改为图像叠加模式',
    en: 'Camera access denied, using image overlay mode',
    ja: 'Camera access denied, using image overlay mode',
    ko: 'Camera access denied, using image overlay mode',
  },
  previousScene: {
    zh: '上一景',
    en: 'Previous',
    ja: 'Previous',
    ko: 'Previous',
  },
  nextSceneAction: {
    zh: '下一景',
    en: 'Next',
    ja: 'Next',
    ko: 'Next',
  },
  relatedAction: {
    zh: '跳转详情',
    en: 'Open Detail',
    ja: 'Open Detail',
    ko: 'Open Detail',
  },
  panoramaAction: {
    zh: '全景漫游',
    en: 'Panorama Tour',
    ja: 'Panorama Tour',
    ko: 'Panorama Tour',
  },
  mapAction: {
    zh: '地图导航',
    en: 'Map Navigation',
    ja: 'Map Navigation',
    ko: 'Map Navigation',
  },
  mapTitleSuffix: {
    zh: ' 导航地图',
    en: ' Map',
    ja: ' マップ',
    ko: ' 지도',
  },
};

const pageText = computed(() => resolveLocalized(pageTextSource, currentLanguage.value));

const immersiveModes = computed(() => {
  const modes = [];

  if (arExperience.value) {
    modes.push({
      id: 'ar',
      badge: pageText.value.arLabel,
      headline: arExperience.value.headline || pageText.value.arLabel,
      summary: arExperience.value.summary || pageText.value.arUsageHint,
      statLabel: pageText.value.hotspotStatLabel,
      statValue: String(arHotspots.value.length).padStart(2, '0'),
      actionLabel: pageText.value.arAction,
    });
  }

  if (vrExperience.value) {
    modes.push({
      id: 'vr',
      badge: pageText.value.vrLabel,
      headline: vrExperience.value.headline || pageText.value.vrLabel,
      summary: vrExperience.value.summary || pageText.value.vrUsageHint,
      statLabel: pageText.value.sceneStatLabel,
      statValue: String(vrScenes.value.length).padStart(2, '0'),
      actionLabel: pageText.value.vrAction,
    });
  }

  return modes;
});

const activeArHotspot = computed(
  () => arHotspots.value.find((item) => item.id === activeArHotspotId.value) || arHotspots.value[0] || null,
);

const activeVrScene = computed(
  () => vrScenes.value.find((scene) => scene.id === activeVrSceneId.value) || vrScenes.value[0] || null,
);

const activeVrHotspot = computed(
  () =>
    activeVrScene.value?.hotspots?.find((item) => item.id === activeVrHotspotId.value)
    || activeVrScene.value?.hotspots?.[0]
    || null,
);

const activeVrSceneIndex = computed(() =>
  vrScenes.value.findIndex((scene) => scene.id === activeVrScene.value?.id),
);

const hasPreviousVrScene = computed(() => activeVrSceneIndex.value > 0);
const hasNextVrScene = computed(
  () => activeVrSceneIndex.value >= 0 && activeVrSceneIndex.value < vrScenes.value.length - 1,
);

const activeImmersiveTitle = computed(() =>
  activeImmersiveMode.value === 'ar'
    ? arExperience.value?.headline || pageText.value.arLabel
    : vrExperience.value?.headline || pageText.value.vrLabel,
);

const activeImmersiveSummary = computed(() =>
  activeImmersiveMode.value === 'ar'
    ? arExperience.value?.summary || pageText.value.arUsageHint
    : vrExperience.value?.summary || pageText.value.vrUsageHint,
);

const cameraStatusLabel = computed(() => {
  switch (cameraState.value) {
    case 'ready':
      return pageText.value.liveCameraReady;
    case 'loading':
      return pageText.value.requestingCamera;
    case 'unsupported':
      return pageText.value.cameraUnsupported;
    case 'fallback':
      return pageText.value.cameraFallback;
    default:
      return pageText.value.arUsageHint;
  }
});

const vrSceneTrackStyle = computed(() => {
  const range = activeVrScene.value?.panRange ?? 32;
  const safePan = clamp(vrPan.value, 0, 100);
  const translate = -((range * safePan) / (100 + range));

  return {
    width: `${100 + range}%`,
    transform: `translate3d(${translate}%, 0, 0)`,
  };
});

watch(
  arHotspots,
  (items) => {
    if (!items.length) {
      activeArHotspotId.value = '';
      return;
    }

    if (!items.some((item) => item.id === activeArHotspotId.value)) {
      activeArHotspotId.value = items[0].id;
    }
  },
  { immediate: true },
);

watch(
  vrScenes,
  (scenes) => {
    if (!scenes.length) {
      activeVrSceneId.value = '';
      activeVrHotspotId.value = '';
      return;
    }

    if (!scenes.some((scene) => scene.id === activeVrSceneId.value)) {
      setActiveVrScene(scenes[0].id);
    }
  },
  { immediate: true },
);

watch(
  activeVrScene,
  (scene) => {
    const hotspots = scene?.hotspots || [];

    if (!hotspots.length) {
      activeVrHotspotId.value = '';
      return;
    }

    if (!hotspots.some((item) => item.id === activeVrHotspotId.value)) {
      activeVrHotspotId.value = hotspots[0].id;
    }
  },
  { immediate: true },
);

const setBodyScrollLocked = (locked) => {
  if (typeof document === 'undefined') {
    return;
  }

  document.body.style.overflow = locked ? 'hidden' : '';
};

const handleImmersiveKeydown = (event) => {
  if (event.key === 'Escape' && activeImmersiveMode.value) {
    closeImmersive();
  }
};

const setKeyboardListener = (enabled) => {
  if (typeof window === 'undefined') {
    return;
  }

  const method = enabled ? 'addEventListener' : 'removeEventListener';
  window[method]('keydown', handleImmersiveKeydown);
};

watch(activeImmersiveMode, (mode, previousMode) => {
  const isOpen = Boolean(mode);
  const wasOpen = Boolean(previousMode);

  if (isOpen && !wasOpen) {
    setKeyboardListener(true);
  }

  if (!isOpen && wasOpen) {
    setKeyboardListener(false);
  }

  setBodyScrollLocked(isOpen);

  if (mode !== 'ar') {
    stopArCamera();
  }

  if (mode !== 'vr') {
    releaseVrDrag();
  }
});

async function startArCamera() {
  if (!arExperience.value) {
    return;
  }

  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    cameraState.value = 'unsupported';
    return;
  }

  cameraError.value = '';
  cameraState.value = 'loading';

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
      },
      audio: false,
    });

    if (activeImmersiveMode.value !== 'ar') {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }

    cameraStream.value = stream;
    await nextTick();

    if (arVideoRef.value) {
      arVideoRef.value.srcObject = stream;
      await arVideoRef.value.play().catch(() => {});
    }

    cameraState.value = 'ready';
  } catch (error) {
    cameraState.value = 'fallback';
    cameraError.value =
      error?.name === 'NotAllowedError' || error?.name === 'SecurityError'
        ? pageText.value.cameraBlocked
        : error?.message || pageText.value.cameraFallback;
  }
}

function stopArCamera() {
  if (arVideoRef.value) {
    arVideoRef.value.pause();
    arVideoRef.value.srcObject = null;
  }

  if (cameraStream.value) {
    cameraStream.value.getTracks().forEach((track) => track.stop());
    cameraStream.value = null;
  }

  cameraState.value = 'idle';
}

async function openImmersive(mode) {
  activeImmersiveMode.value = mode;

  if (mode === 'ar') {
    await nextTick();
    await startArCamera();
  }

  if (mode === 'vr' && !activeVrScene.value && vrScenes.value.length) {
    setActiveVrScene(vrScenes.value[0].id);
  }
}

function closeImmersive() {
  activeImmersiveMode.value = '';
}

function hotspotStyle(hotspot) {
  return {
    left: `${hotspot.x}%`,
    top: `${hotspot.y}%`,
  };
}

function setActiveArHotspot(hotspotId) {
  activeArHotspotId.value = hotspotId;
}

function setActiveVrScene(sceneId) {
  const nextScene = vrScenes.value.find((scene) => scene.id === sceneId);

  if (!nextScene) {
    return;
  }

  activeVrSceneId.value = sceneId;
  vrPan.value = nextScene.initialPan ?? 50;
}

function setActiveVrHotspot(hotspotId) {
  activeVrHotspotId.value = hotspotId;
}

function showPreviousScene() {
  if (!hasPreviousVrScene.value) {
    return;
  }

  setActiveVrScene(vrScenes.value[activeVrSceneIndex.value - 1].id);
}

function showNextScene() {
  if (!hasNextVrScene.value) {
    return;
  }

  setActiveVrScene(vrScenes.value[activeVrSceneIndex.value + 1].id);
}

function releaseVrDrag() {
  vrDragging.value = false;
}

function handleVrPointerDown(event) {
  if (event.pointerType === 'mouse' && event.button !== 0) {
    return;
  }

  vrDragging.value = true;
  vrDragStartX.value = event.clientX;
  vrDragStartPan.value = vrPan.value;
  event.currentTarget?.setPointerCapture?.(event.pointerId);
}

function handleVrPointerMove(event) {
  if (!vrDragging.value) {
    return;
  }

  const width = event.currentTarget?.clientWidth || 1;
  const deltaX = event.clientX - vrDragStartX.value;
  vrPan.value = clamp(vrDragStartPan.value - (deltaX / width) * 100, 0, 100);
}

function handleVrPointerUp(event) {
  releaseVrDrag();
  event.currentTarget?.releasePointerCapture?.(event.pointerId);
}

onBeforeUnmount(() => {
  stopArCamera();
  setBodyScrollLocked(false);
  setKeyboardListener(false);
});

const themeStyle = computed(() => ({
  '--garden-accent': design.value.accent || '#5F7F72',
  '--garden-accent-rgb': design.value.accentRgb || '95, 127, 114',
  '--garden-secondary': design.value.secondary || design.value.accent || '#5F7F72',
  '--garden-secondary-rgb': design.value.secondaryRgb || design.value.accentRgb || '95, 127, 114',
  '--garden-paper': design.value.paper || 'rgba(255, 255, 255, 0.78)',
  '--garden-paper-strong': design.value.paperStrong || 'rgba(255, 255, 255, 0.9)',
  '--garden-muted': design.value.muted || 'rgba(68, 64, 60, 0.84)',
  '--garden-shadow': design.value.shadow || '0 32px 80px rgba(28, 25, 23, 0.14)',
}));

const resolveGalleryImage = (item) => item?.src || props.garden.heroImage;
const resolveGalleryAlt = (item) => item?.alt || item?.title || props.garden.heroAlt || props.garden.name;
const galleryCardClass = (item) => ['gallery-card', `gallery-card--${item?.ratio || 'landscape'}`];
</script>

<template>
  <article
    :class="['garden-detail-page', 'page-shell', `garden-detail-page--${variant}`]"
    :style="themeStyle"
  >
    <span v-if="design.watermark" class="detail-watermark" aria-hidden="true">{{ design.watermark }}</span>

    <section class="detail-hero">
      <div class="detail-hero-media">
        <div class="detail-hero-image-shell">
          <img
            :src="garden.heroImage"
            :alt="garden.heroAlt || garden.name"
            class="detail-hero-image"
            :style="{ objectPosition: design.heroImagePosition || 'center center' }"
          />
        </div>

        <div v-if="floatingTags.length" class="detail-floating-tags" aria-hidden="true">
          <span v-for="tag in floatingTags.slice(0, 3)" :key="tag">{{ tag }}</span>
        </div>
      </div>

      <div class="detail-hero-card">
        <div class="detail-copy">
          <p class="eyebrow">{{ garden.kicker }}</p>
          <div
            v-if="design.heroPreludeTitle || design.heroPreludeText || design.heroPreludeChips?.length"
            class="detail-prelude"
          >
            <div class="detail-prelude__copy">
              <span class="detail-prelude__label">{{ design.heroPreludeLabel || pageText.preludeLabel }}</span>
              <strong v-if="design.heroPreludeTitle">{{ design.heroPreludeTitle }}</strong>
              <p v-if="design.heroPreludeText">{{ design.heroPreludeText }}</p>
            </div>

            <div v-if="design.heroPreludeChips?.length" class="detail-prelude__chips">
              <span v-for="chip in design.heroPreludeChips" :key="chip">{{ chip }}</span>
            </div>
          </div>

          <div class="detail-badges" v-if="garden.badges?.length">
            <span v-for="badge in garden.badges" :key="badge">{{ badge }}</span>
          </div>
          <h1 class="detail-title">
            {{ garden.name }}
            <span>{{ garden.englishName }}</span>
          </h1>
          <p class="detail-intro">{{ garden.intro }}</p>
        </div>

        <div class="detail-metrics">
          <article v-for="fact in garden.facts" :key="fact.label" class="detail-metric">
            <span>{{ fact.label }}</span>
            <strong>{{ fact.value }}</strong>
          </article>
        </div>

        <div class="detail-actions">
          <component
            :is="resolveLinkComponent(garden.backHref || '/')"
            class="detail-action-link detail-action-link--primary"
            v-bind="resolveLinkProps(garden.backHref || '/')"
          >
            {{ garden.backLabel || pageText.backLabel }}
          </component>
          <component
            v-if="garden.nextGarden"
            :is="resolveLinkComponent(garden.nextGarden.href)"
            class="detail-action-link detail-action-link--ghost"
            v-bind="resolveLinkProps(garden.nextGarden.href)"
          >
            {{ pageText.nextPrefix }}{{ garden.nextGarden.label }}
          </component>
          <RouterLink
            v-if="garden.panoramaHref"
            :to="garden.panoramaHref"
            class="detail-action-link detail-action-link--soft"
          >
            {{ pageText.panoramaAction }}
          </RouterLink>
          <button
            v-if="resolvedPoi"
            type="button"
            class="detail-action-link detail-action-link--ghost"
            @click="mapVisible = true"
          >
            {{ pageText.mapAction }}
          </button>
        </div>
      </div>

      <div v-if="design.heroQuote || design.heroCaption" class="detail-hero-note">
        <strong v-if="design.heroQuote">{{ design.heroQuote }}</strong>
        <span v-if="design.heroCaption">{{ design.heroCaption }}</span>
      </div>
    </section>

    <section class="detail-panel detail-panel--highlights">
      <div class="detail-panel__header">
        <p class="eyebrow">{{ pageText.highlightsEyebrow }}</p>
        <h2>{{ pageText.highlightsTitle }}</h2>
        <p>{{ design.highlightIntro || pageText.highlightIntro }}</p>
      </div>

      <div class="detail-highlight-list">
        <article v-for="item in garden.highlights" :key="item.title" class="detail-highlight-item">
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
        </article>
      </div>
    </section>

    <section v-if="galleryItems.length" class="detail-panel horizontal-gallery">
      <div class="detail-panel__header horizontal-gallery__header">
        <p class="eyebrow">{{ pageText.galleryEyebrow }}</p>
        <h2>{{ design.galleryTitle || pageText.galleryTitle }}</h2>
        <p>{{ design.galleryIntro || pageText.galleryIntro }}</p>
      </div>

      <div class="horizontal-gallery__track">
        <article
          v-for="item in galleryItems"
          :key="`${item.title}-${item.caption}`"
          :class="galleryCardClass(item)"
        >
          <img
            :src="resolveGalleryImage(item)"
            :alt="resolveGalleryAlt(item)"
            class="gallery-card__image"
            :style="{ objectPosition: item.focusPosition || design.heroImagePosition || 'center center' }"
          />
          <div class="gallery-card__overlay">
            <strong>{{ item.title }}</strong>
            <span>{{ item.caption }}</span>
          </div>
        </article>
      </div>
    </section>

    <section class="detail-grid">
      <aside class="detail-panel detail-panel--stepper">
        <div class="detail-panel__header">
          <p class="eyebrow">{{ pageText.stepperEyebrow }}</p>
          <h2>{{ pageText.stepperTitle }}</h2>
          <p>{{ design.stepperIntro || pageText.stepperIntro }}</p>
        </div>

        <ol class="tour-stepper">
          <li v-for="(item, index) in garden.itinerary" :key="item.title" class="tour-stepper__item">
            <span class="tour-stepper__dot" aria-hidden="true" />
            <span class="tour-stepper__count">{{ String(index + 1).padStart(2, '0') }}</span>
            <div class="tour-stepper__content">
              <strong>{{ item.title }}</strong>
              <span>{{ item.description }}</span>
            </div>
          </li>
        </ol>
      </aside>

      <section class="detail-panel detail-panel--tips">
        <div class="detail-panel__header">
          <p class="eyebrow">{{ pageText.tipsEyebrow }}</p>
          <h2>{{ design.tipsTitle || pageText.tipsTitle }}</h2>
          <p>{{ design.tipsIntro || pageText.tipsIntro }}</p>
        </div>

        <ul class="detail-tips-list">
          <li v-for="tip in garden.tips" :key="tip">{{ tip }}</li>
        </ul>
      </section>
    </section>

    <section class="detail-related">
      <article v-for="item in garden.relatedGardens" :key="item.href" class="related-card">
        <p class="eyebrow">{{ item.kicker }}</p>
        <h3>{{ item.label }}</h3>
        <span>{{ item.description }}</span>
        <component
          :is="resolveLinkComponent(item.href)"
          class="detail-action-link detail-action-link--inline"
          v-bind="resolveLinkProps(item.href)"
        >
          {{ pageText.relatedAction }}
        </component>
      </article>
    </section>

    <ScenicMapDialog
      :show="mapVisible"
      :poi="resolvedPoi"
      :title="`${garden.name}${pageText.mapTitleSuffix}`"
      @update:show="mapVisible = $event"
    />
  </article>
</template>

<style scoped>
.garden-detail-page {
  position: relative;
  display: grid;
  gap: 30px;
  padding-top: 28px;
  padding-bottom: 104px;
  isolation: isolate;
}

.garden-detail-page > * {
  opacity: 0;
  transform: translateY(24px);
  filter: blur(10px);
  animation: page-reveal 0.92s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.garden-detail-page > :nth-child(2) {
  animation-delay: 0.12s;
}

.garden-detail-page > :nth-child(3) {
  animation-delay: 0.24s;
}

.garden-detail-page > :nth-child(4) {
  animation-delay: 0.36s;
}

.garden-detail-page > :nth-child(5) {
  animation-delay: 0.48s;
}

.garden-detail-page > :nth-child(6) {
  animation-delay: 0.6s;
}

.detail-watermark {
  position: absolute;
  top: 10%;
  right: -5%;
  z-index: -1;
  color: rgba(var(--garden-accent-rgb), 0.04);
  font-family: var(--font-serif);
  font-size: min(40vw, 32rem);
  line-height: 0.82;
  user-select: none;
  pointer-events: none;
}

.detail-hero,
.detail-panel,
.related-card {
  border: 1px solid rgba(var(--garden-accent-rgb), 0.14);
  box-shadow: 0 24px 60px rgba(28, 25, 23, 0.08);
}

.detail-hero {
  position: relative;
  min-height: 680px;
  overflow: clip;
  border-radius: 40px;
  background:
    linear-gradient(135deg, rgba(var(--garden-accent-rgb), 0.08), rgba(255, 255, 255, 0.5)),
    rgba(255, 255, 255, 0.68);
}

.detail-hero-media {
  position: absolute;
  inset: 0;
}

.detail-hero-image-shell {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.detail-hero-image-shell::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(105deg, rgba(17, 24, 39, 0.42) 0%, rgba(17, 24, 39, 0.12) 38%, rgba(255, 255, 255, 0) 65%),
    linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(17, 24, 39, 0.12) 100%);
}

.detail-hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.01);
}

.detail-floating-tags {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.detail-floating-tags span {
  position: absolute;
  padding: 0.62rem 0.95rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.26);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.26);
  color: rgba(255, 255, 255, 0.94);
  font-size: 0.78rem;
  letter-spacing: 0.12em;
}

.detail-floating-tags span:nth-child(1) {
  top: 2rem;
  right: 2.2rem;
}

.detail-floating-tags span:nth-child(2) {
  top: 6rem;
  right: 8rem;
}

.detail-floating-tags span:nth-child(3) {
  bottom: 2.2rem;
  right: 22%;
}

.detail-hero-card,
.detail-hero-note {
  position: relative;
  z-index: 3;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.detail-hero-card {
  display: grid;
  gap: 22px;
  width: min(560px, calc(100% - 2.5rem));
  margin: auto auto 2rem 2rem;
  padding: 28px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.24);
  box-shadow: var(--garden-shadow);
}

.detail-copy {
  display: grid;
  gap: 14px;
}

.detail-prelude {
  display: grid;
  gap: 12px;
  padding: 18px 20px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.detail-prelude__copy {
  display: grid;
  gap: 8px;
}

.detail-prelude__label {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.74rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.detail-prelude__copy strong {
  color: white;
  font-family: var(--font-serif);
  font-size: 1.04rem;
  line-height: 1.5;
}

.detail-prelude__copy p {
  color: rgba(255, 255, 255, 0.84);
  line-height: 1.76;
}

.detail-prelude__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-prelude__chips span {
  padding: 0.42rem 0.76rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.92);
  font-size: 0.76rem;
}

.detail-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.detail-badges span {
  padding: 0.48rem 0.82rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.94);
  font-size: 0.82rem;
}

.detail-title {
  margin: 0;
  display: grid;
  gap: 8px;
  color: white;
  font-size: clamp(2.5rem, 5vw, 4.2rem);
  line-height: 1.06;
}

.detail-title span {
  color: rgba(255, 255, 255, 0.76);
  font-size: clamp(1.05rem, 2vw, 1.4rem);
  font-weight: 500;
  letter-spacing: 0.04em;
}

.detail-intro {
  max-width: 34rem;
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.92;
}

.detail-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.detail-metric {
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.detail-metric span {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.82rem;
  letter-spacing: 0.08em;
}

.detail-metric strong {
  color: white;
  line-height: 1.45;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.detail-action-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.9rem 1.25rem;
  border-radius: 999px;
  text-decoration: none;
  transition:
    transform 0.32s ease,
    box-shadow 0.32s ease,
    background-color 0.32s ease,
    border-color 0.32s ease;
}

.detail-action-link:hover {
  transform: translateY(-2px);
}

.detail-action-link--primary {
  background: var(--garden-accent);
  color: white;
  box-shadow: 0 16px 36px rgba(var(--garden-accent-rgb), 0.26);
}

.detail-action-link--ghost,
.detail-action-link--inline {
  border: 1px solid rgba(var(--garden-accent-rgb), 0.22);
  background: rgba(255, 255, 255, 0.7);
  color: var(--garden-accent);
}

.detail-action-link--soft {
  border: 1px solid rgba(255, 255, 255, 0.22);
  background: rgba(var(--garden-accent-rgb), 0.12);
  color: white;
}

.detail-hero-note {
  position: absolute;
  right: 2rem;
  bottom: 2rem;
  display: grid;
  gap: 10px;
  width: min(300px, calc(100% - 4rem));
  padding: 18px 20px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: rgba(255, 255, 255, 0.92);
}

.detail-hero-note strong {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  line-height: 1.5;
}

.detail-hero-note span {
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.8;
}

.detail-panel {
  position: relative;
  display: grid;
  gap: 22px;
  padding: 30px;
  border-radius: 32px;
  background: var(--garden-paper);
}

.detail-panel__header {
  display: grid;
  gap: 12px;
  max-width: 54rem;
}

.detail-panel__header h2,
.detail-highlight-item h3,
.related-card h3 {
  margin: 0;
  line-height: 1.28;
}

.detail-panel__header p:last-child,
.related-card span,
.detail-highlight-item p,
.tour-stepper__content span,
.detail-tips-list li {
  color: var(--garden-muted);
  line-height: 1.88;
}

.detail-highlight-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.detail-highlight-item {
  display: grid;
  gap: 12px;
  padding: 22px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(var(--garden-accent-rgb), 0.12);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.65),
    0 18px 40px rgba(28, 25, 23, 0.06);
}

.immersive-mode-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.immersive-card {
  display: grid;
  gap: 12px;
  padding: 22px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(var(--garden-accent-rgb), 0.12);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.65),
    0 18px 40px rgba(28, 25, 23, 0.06);
}

.immersive-card__head {
  display: grid;
  gap: 10px;
}

.immersive-card__head strong {
  line-height: 1.4;
}

.immersive-card > p {
  margin: 0;
  color: var(--garden-muted);
  line-height: 1.82;
}

.immersive-card__badge {
  width: fit-content;
  padding: 0.4rem 0.72rem;
  border-radius: 999px;
  background: rgba(var(--garden-accent-rgb), 0.08);
  color: rgba(var(--garden-accent-rgb), 0.9);
  font-size: 0.76rem;
  letter-spacing: 0.12em;
}

.immersive-card__stats {
  display: flex;
  align-items: baseline;
  gap: 10px;
  color: var(--garden-muted);
}

.immersive-card__stats strong {
  color: var(--garden-accent);
  font-size: 1.8rem;
}

.immersive-card__action {
  justify-self: start;
}

.horizontal-gallery {
  overflow: hidden;
}

.horizontal-gallery__track {
  display: flex;
  gap: 18px;
  overflow-x: auto;
  padding-bottom: 6px;
  scrollbar-width: none;
  -ms-overflow-style: none;
  overscroll-behavior-x: contain;
  touch-action: pan-x;
}

.horizontal-gallery__track::-webkit-scrollbar {
  display: none;
}

.gallery-card {
  position: relative;
  flex: 0 0 auto;
  overflow: hidden;
  border-radius: 30px;
  border: 1px solid rgba(var(--garden-accent-rgb), 0.15);
  background: rgba(var(--garden-accent-rgb), 0.08);
  box-shadow: 0 18px 42px rgba(28, 25, 23, 0.08);
  scroll-snap-align: start;
}

.gallery-card--panorama {
  width: min(68vw, 620px);
  aspect-ratio: 21 / 9;
}

.gallery-card--landscape {
  width: min(56vw, 440px);
  aspect-ratio: 4 / 3;
}

.gallery-card--portrait {
  width: min(34vw, 288px);
  aspect-ratio: 3 / 4;
}

.gallery-card--square {
  width: min(38vw, 320px);
  aspect-ratio: 1;
}

.gallery-card--tall {
  width: min(34vw, 280px);
  aspect-ratio: 5 / 7;
}

.gallery-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.gallery-card:hover .gallery-card__image {
  transform: scale(1.05);
}

.gallery-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(17, 24, 39, 0) 32%, rgba(17, 24, 39, 0.58) 100%);
}

.gallery-card__overlay {
  position: absolute;
  right: 14px;
  bottom: 14px;
  left: 14px;
  z-index: 1;
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: white;
}

.gallery-card__overlay strong {
  font-family: var(--font-serif);
  font-size: 1rem;
}

.gallery-card__overlay span {
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.9rem;
  line-height: 1.72;
}

.detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
  gap: 24px;
}

.tour-stepper {
  position: relative;
  display: grid;
  gap: 22px;
  margin: 0;
  padding: 6px 0 0;
  list-style: none;
}

.tour-stepper::before {
  content: '';
  position: absolute;
  left: 19px;
  top: 8px;
  bottom: 8px;
  width: 10px;
  border-radius: 999px;
  background: repeating-linear-gradient(
    to bottom,
    rgba(var(--garden-accent-rgb), 0.62) 0 8px,
    transparent 8px 18px
  );
  opacity: 0.8;
}

.tour-stepper__item {
  position: relative;
  display: grid;
  grid-template-columns: auto auto 1fr;
  gap: 14px;
  align-items: start;
}

.tour-stepper__dot {
  position: relative;
  z-index: 1;
  width: 14px;
  height: 14px;
  margin-top: 8px;
  border-radius: 50%;
  border: 2px solid var(--garden-accent);
  background: white;
  box-shadow: 0 0 0 6px rgba(var(--garden-accent-rgb), 0.12);
}

.tour-stepper__count {
  min-width: 2.2rem;
  color: rgba(var(--garden-accent-rgb), 0.72);
  font-family: var(--font-serif);
  font-size: 1rem;
  line-height: 1.9;
}

.tour-stepper__content {
  display: grid;
  gap: 8px;
}

.tour-stepper__content strong {
  line-height: 1.5;
}

.detail-tips-list {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.detail-tips-list li {
  position: relative;
  padding: 16px 18px 16px 44px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.64);
  border: 1px solid rgba(var(--garden-accent-rgb), 0.1);
}

.detail-tips-list li::before {
  content: '';
  position: absolute;
  top: 22px;
  left: 18px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(var(--garden-secondary-rgb), 0.82);
  box-shadow: 0 0 0 6px rgba(var(--garden-secondary-rgb), 0.12);
}

.detail-related {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.related-card {
  display: grid;
  gap: 14px;
  min-width: 0;
  padding: 24px;
  border-radius: 28px;
  background: var(--garden-paper-strong);
}

.related-card::before {
  content: '';
  width: 64px;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--garden-accent), rgba(var(--garden-secondary-rgb), 0.38));
}

.immersive-dialog {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: grid;
  place-items: center;
  padding: 2rem;
}

.immersive-dialog__backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  background: rgba(10, 14, 20, 0.72);
  cursor: pointer;
}

.immersive-dialog__panel {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 20px;
  width: min(1200px, 100%);
  max-height: calc(100vh - 4rem);
  padding: 24px;
  overflow: auto;
  border-radius: 32px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 246, 243, 0.94)),
    rgba(255, 255, 255, 0.96);
  box-shadow: 0 40px 120px rgba(0, 0, 0, 0.34);
}

.immersive-dialog__header {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 16px;
}

.immersive-dialog__copy {
  display: grid;
  gap: 10px;
  max-width: 56rem;
}

.immersive-dialog__copy h2,
.immersive-sidepanel__section h3 {
  margin: 0;
}

.immersive-dialog__copy p:last-child,
.immersive-sidepanel__section p,
.immersive-sidepanel__item span {
  color: var(--garden-muted);
  line-height: 1.82;
}

.immersive-dialog__close,
.vr-stage__nav {
  padding: 0.8rem 1rem;
  border-radius: 999px;
  border: 1px solid rgba(var(--garden-accent-rgb), 0.18);
  background: white;
  color: var(--garden-accent);
  cursor: pointer;
}

.immersive-dialog__body {
  display: grid;
  gap: 20px;
}

.immersive-dialog__body--ar,
.vr-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(320px, 0.7fr);
  gap: 20px;
}

.immersive-stage,
.immersive-sidepanel {
  display: grid;
  gap: 16px;
  padding: 20px;
  border-radius: 28px;
  border: 1px solid rgba(var(--garden-accent-rgb), 0.12);
  background: rgba(255, 255, 255, 0.78);
}

.immersive-stage__status {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  align-items: center;
  color: var(--garden-muted);
}

.immersive-status-chip {
  padding: 0.38rem 0.72rem;
  border-radius: 999px;
  background: rgba(var(--garden-accent-rgb), 0.08);
  color: var(--garden-accent);
  font-size: 0.78rem;
  letter-spacing: 0.08em;
}

.immersive-stage__media,
.vr-stage__viewport {
  position: relative;
  overflow: hidden;
  min-height: 460px;
  border-radius: 24px;
  background: rgba(10, 14, 20, 0.08);
}

.immersive-stage__media::after,
.vr-stage__viewport::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.06), rgba(0, 0, 0, 0.28)),
    linear-gradient(90deg, rgba(0, 0, 0, 0.14), transparent 24%, transparent 76%, rgba(0, 0, 0, 0.14));
  pointer-events: none;
}

.immersive-video,
.immersive-fallback,
.vr-stage__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.vr-stage__track {
  position: absolute;
  inset: 0;
  height: 100%;
  transition: transform 0.36s ease;
}

.ar-hud {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.ar-hud__reticle {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 110px;
  height: 110px;
  border: 1px solid rgba(255, 255, 255, 0.64);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 0 18px rgba(255, 255, 255, 0.08);
}

.ar-hud__scanline {
  position: absolute;
  left: 8%;
  right: 8%;
  top: 18%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.84), transparent);
  animation: scanline 3.2s ease-in-out infinite;
}

.immersive-hotspot {
  position: absolute;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  transform: translate(-50%, -50%);
  padding: 0.5rem 0.82rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  background: rgba(13, 18, 24, 0.44);
  color: white;
  cursor: pointer;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition:
    transform 0.24s ease,
    background-color 0.24s ease,
    box-shadow 0.24s ease;
}

.immersive-hotspot:hover,
.immersive-hotspot.is-active {
  transform: translate(-50%, -50%) scale(1.04);
  background: rgba(var(--garden-accent-rgb), 0.76);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.18);
}

.immersive-hotspot span {
  font-size: 0.82rem;
  white-space: nowrap;
}

.immersive-hotspot::before {
  content: '';
  width: 12px;
  height: 12px;
  flex: none;
  border-radius: 50%;
  background: white;
  box-shadow: 0 0 0 8px rgba(255, 255, 255, 0.14);
}

.immersive-sidepanel {
  align-content: start;
}

.immersive-sidepanel__section {
  display: grid;
  gap: 10px;
}

.immersive-sidepanel__section p {
  margin: 0;
}

.immersive-sidepanel__fact {
  display: grid;
  gap: 8px;
  padding: 16px;
  border-radius: 20px;
  background: rgba(var(--garden-accent-rgb), 0.06);
  color: var(--garden-muted);
}

.immersive-sidepanel__fact strong {
  color: var(--garden-accent);
}

.immersive-sidepanel__note {
  margin: 0;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(159, 63, 52, 0.08);
  color: #8d3a30;
  line-height: 1.7;
}

.immersive-sidepanel__list {
  display: grid;
  gap: 10px;
}

.immersive-sidepanel__item {
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  text-align: left;
  border-radius: 18px;
  border: 1px solid rgba(var(--garden-accent-rgb), 0.12);
  background: rgba(255, 255, 255, 0.76);
  cursor: pointer;
  transition:
    transform 0.24s ease,
    border-color 0.24s ease,
    box-shadow 0.24s ease;
}

.immersive-sidepanel__item:hover,
.immersive-sidepanel__item.is-active {
  transform: translateY(-1px);
  border-color: rgba(var(--garden-accent-rgb), 0.28);
  box-shadow: 0 12px 24px rgba(28, 25, 23, 0.08);
}

.immersive-sidepanel__item strong {
  line-height: 1.45;
}

.vr-stage__viewport {
  touch-action: none;
  cursor: grab;
}

.vr-stage__viewport:active {
  cursor: grabbing;
}

.vr-stage__hint {
  position: absolute;
  left: 18px;
  right: 18px;
  bottom: 18px;
  z-index: 2;
  padding: 0.75rem 0.95rem;
  border-radius: 16px;
  background: rgba(13, 18, 24, 0.4);
  color: rgba(255, 255, 255, 0.88);
  font-size: 0.84rem;
  line-height: 1.6;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.vr-stage__controls {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 14px;
  align-items: center;
}

.vr-stage__nav:disabled {
  opacity: 0.46;
  cursor: not-allowed;
}

.vr-stage__meter {
  position: relative;
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(var(--garden-accent-rgb), 0.08);
}

.vr-stage__meter span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, var(--garden-accent), rgba(var(--garden-secondary-rgb), 0.56));
}

.garden-detail-page--zhuozheng .detail-hero {
  min-height: min(78vh, 760px);
}

.garden-detail-page--zhuozheng .detail-hero-card {
  background: rgba(242, 248, 245, 0.18);
}

.garden-detail-page--zhuozheng .detail-hero-note {
  background: rgba(240, 248, 244, 0.24);
}

.garden-detail-page--zhuozheng .tour-stepper::before {
  width: 18px;
  left: 14px;
  background:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='120' viewBox='0 0 18 120'%3E%3Cpath d='M9 0 C3 10 3 20 9 30 S15 50 9 60 S3 80 9 90 S15 110 9 120' fill='none' stroke='%237FB9AE' stroke-width='2.5' stroke-linecap='round' stroke-dasharray='4 8'/%3E%3C/svg%3E") center top / 18px 120px repeat-y;
  opacity: 0.84;
}

.garden-detail-page--liuyuan .detail-watermark {
  color: rgba(109, 67, 36, 0.045);
}

.garden-detail-page--liuyuan .detail-hero {
  display: grid;
  grid-template-columns: minmax(0, 0.88fr) minmax(360px, 1.12fr);
  align-items: center;
  min-height: 720px;
  padding: 2.2rem;
}

.garden-detail-page--liuyuan .detail-hero-image-shell {
  inset: 7% 3% 7% auto;
  width: min(620px, 100%);
  aspect-ratio: 1;
  border-radius: 36px;
  clip-path: circle(40% at 56% 50%);
}

.garden-detail-page--liuyuan .detail-hero-media::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 8%;
  width: min(520px, 74%);
  aspect-ratio: 1;
  border-radius: 50%;
  border: 1px solid rgba(var(--garden-accent-rgb), 0.2);
  transform: translateY(-50%);
}

.garden-detail-page--liuyuan .detail-hero-card {
  align-self: center;
  margin: 0;
  width: min(520px, 100%);
  background: rgba(255, 247, 239, 0.42);
}

.garden-detail-page--liuyuan .detail-title,
.garden-detail-page--liuyuan .detail-intro,
.garden-detail-page--liuyuan .detail-metric strong,
.garden-detail-page--liuyuan .detail-metric span,
.garden-detail-page--liuyuan .detail-badges span {
  color: #2c1b10;
}

.garden-detail-page--liuyuan .detail-badges span,
.garden-detail-page--liuyuan .detail-metric,
.garden-detail-page--liuyuan .detail-hero-note {
  background: rgba(255, 250, 245, 0.62);
  border-color: rgba(109, 67, 36, 0.14);
}

.garden-detail-page--liuyuan .detail-hero-note {
  top: 5rem;
  right: 4rem;
  bottom: auto;
  color: #4f341f;
}

.garden-detail-page--liuyuan .detail-hero-note span {
  color: rgba(79, 52, 31, 0.84);
}

.garden-detail-page--liuyuan .detail-floating-tags span {
  background: rgba(255, 250, 245, 0.8);
  border-color: rgba(109, 67, 36, 0.12);
  color: #6d4324;
}

.garden-detail-page--liuyuan .detail-floating-tags span:nth-child(1) {
  top: 18%;
  right: 17%;
}

.garden-detail-page--liuyuan .detail-floating-tags span:nth-child(2) {
  top: 30%;
  right: 6%;
}

.garden-detail-page--liuyuan .detail-floating-tags span:nth-child(3) {
  bottom: 18%;
  right: 14%;
}

.garden-detail-page--liuyuan .horizontal-gallery__track {
  align-items: flex-end;
  padding-top: 8px;
}

.garden-detail-page--liuyuan .gallery-card:nth-child(2n) {
  transform: translateY(24px);
}

.garden-detail-page--liuyuan .gallery-card:nth-child(3n) {
  transform: translateY(-10px);
}

.garden-detail-page--wangshiyuan .detail-watermark {
  color: rgba(28, 25, 23, 0.04);
  top: 12%;
  right: -2%;
}

.garden-detail-page--wangshiyuan .detail-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.18fr) minmax(320px, 0.82fr);
  grid-template-areas:
    'card media'
    'note media';
  gap: 24px 30px;
  align-items: start;
  min-height: 760px;
  padding: 3rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 246, 243, 0.98)),
    rgba(255, 255, 255, 0.92);
}

.garden-detail-page--wangshiyuan .detail-hero-media {
  position: relative;
  inset: auto;
  grid-area: media;
  display: grid;
  align-content: start;
  min-height: 100%;
}

.garden-detail-page--wangshiyuan .detail-hero-image-shell {
  position: relative;
  top: auto;
  right: auto;
  bottom: auto;
  left: auto;
  width: min(100%, 380px);
  height: clamp(520px, 66vh, 620px);
  margin-left: auto;
  border-radius: 32px;
  box-shadow: 0 26px 60px rgba(28, 25, 23, 0.18);
}

.garden-detail-page--wangshiyuan .detail-hero-image-shell::after {
  background:
    linear-gradient(180deg, rgba(28, 25, 23, 0.08) 0%, rgba(28, 25, 23, 0.34) 100%),
    linear-gradient(120deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0));
}

.garden-detail-page--wangshiyuan .detail-hero-card {
  grid-area: card;
  width: 100%;
  margin: 0;
  align-self: start;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(28, 25, 23, 0.1);
}

.garden-detail-page--wangshiyuan .detail-prelude {
  background: linear-gradient(135deg, rgba(28, 25, 23, 0.03), rgba(159, 63, 52, 0.08));
  border-color: rgba(159, 63, 52, 0.14);
}

.garden-detail-page--wangshiyuan .detail-prelude__label,
.garden-detail-page--wangshiyuan .detail-title span,
.garden-detail-page--wangshiyuan .detail-metric span,
.garden-detail-page--wangshiyuan .detail-intro,
.garden-detail-page--wangshiyuan .detail-badges span {
  color: rgba(28, 25, 23, 0.72);
}

.garden-detail-page--wangshiyuan .detail-prelude__copy strong,
.garden-detail-page--wangshiyuan .detail-prelude__chips span {
  color: var(--ink-900);
}

.garden-detail-page--wangshiyuan .detail-prelude__copy p {
  color: rgba(68, 64, 60, 0.86);
}

.garden-detail-page--wangshiyuan .detail-prelude__chips span {
  background: rgba(255, 255, 255, 0.7);
  border-color: rgba(159, 63, 52, 0.14);
}

.garden-detail-page--wangshiyuan .detail-title,
.garden-detail-page--wangshiyuan .detail-intro {
  color: var(--ink-900);
}

.garden-detail-page--wangshiyuan .detail-metric {
  background: rgba(28, 25, 23, 0.04);
  border-color: rgba(28, 25, 23, 0.08);
}

.garden-detail-page--wangshiyuan .detail-metric strong {
  color: var(--ink-900);
}

.garden-detail-page--wangshiyuan .detail-badges span,
.garden-detail-page--wangshiyuan .detail-floating-tags span {
  background: rgba(28, 25, 23, 0.08);
  border-color: rgba(28, 25, 23, 0.08);
  color: var(--ink-900);
}

.garden-detail-page--wangshiyuan .detail-floating-tags span:nth-child(1) {
  top: 1.2rem;
  left: 0;
}

.garden-detail-page--wangshiyuan .detail-floating-tags span:nth-child(2) {
  top: 5.8rem;
  right: 0.2rem;
}

.garden-detail-page--wangshiyuan .detail-floating-tags span:nth-child(3) {
  bottom: 1.6rem;
  left: 1rem;
}

.garden-detail-page--wangshiyuan .detail-hero-note {
  position: relative;
  inset: auto;
  grid-area: note;
  width: min(420px, 100%);
  margin-top: 4px;
  background: rgba(28, 25, 23, 0.04);
  border-color: rgba(159, 63, 52, 0.18);
  color: var(--ink-900);
}

.garden-detail-page--wangshiyuan .detail-hero-note strong {
  color: var(--ink-900);
}

.garden-detail-page--wangshiyuan .detail-hero-note span {
  color: rgba(28, 25, 23, 0.72);
}

.garden-detail-page--wangshiyuan .detail-action-link--ghost,
.garden-detail-page--wangshiyuan .detail-action-link--inline {
  color: #9f3f34;
  border-color: rgba(159, 63, 52, 0.2);
}

.garden-detail-page--wangshiyuan .detail-tips-list li::before {
  background: rgba(159, 63, 52, 0.84);
  box-shadow: 0 0 0 6px rgba(159, 63, 52, 0.1);
}

@keyframes page-reveal {
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

@keyframes scanline {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.6;
  }

  50% {
    transform: translateY(260px);
    opacity: 1;
  }
}

@media (max-width: 1180px) {
  .detail-highlight-list,
  .immersive-mode-grid,
  .detail-related,
  .detail-grid,
  .immersive-dialog__body--ar,
  .vr-layout {
    grid-template-columns: 1fr;
  }

  .garden-detail-page--wangshiyuan .detail-hero {
    grid-template-columns: minmax(0, 1fr) minmax(280px, 0.78fr);
    gap: 22px 24px;
    padding: 2.4rem;
  }

  .garden-detail-page--wangshiyuan .detail-hero-card {
    width: 100%;
  }

  .garden-detail-page--wangshiyuan .detail-hero-note {
    width: 100%;
  }
}

@media (max-width: 960px) {
  .garden-detail-page {
    gap: 22px;
    padding-top: 20px;
    padding-bottom: 80px;
  }

  .detail-watermark {
    top: 7rem;
    right: -7%;
    font-size: 46vw;
  }

  .detail-hero,
  .garden-detail-page--liuyuan .detail-hero,
  .garden-detail-page--wangshiyuan .detail-hero {
    display: grid;
    gap: 18px;
    grid-template-columns: 1fr;
    grid-template-areas: none;
    min-height: auto;
    padding: 20px;
  }

  .detail-hero-media,
  .garden-detail-page--wangshiyuan .detail-hero-media {
    position: relative;
    inset: auto;
    min-height: 320px;
    order: 1;
  }

  .detail-hero-image-shell,
  .garden-detail-page--liuyuan .detail-hero-image-shell,
  .garden-detail-page--wangshiyuan .detail-hero-image-shell {
    position: relative;
    inset: auto;
    width: 100%;
    aspect-ratio: 16 / 10;
    border-radius: 28px;
    clip-path: none;
  }

  .garden-detail-page--liuyuan .detail-hero-media::after {
    display: none;
  }

  .detail-floating-tags {
    position: relative;
    inset: auto;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 12px;
  }

  .detail-floating-tags span,
  .garden-detail-page--liuyuan .detail-floating-tags span,
  .garden-detail-page--wangshiyuan .detail-floating-tags span {
    position: relative;
    top: auto;
    right: auto;
    bottom: auto;
    left: auto;
  }

  .detail-hero-card,
  .garden-detail-page--liuyuan .detail-hero-card,
  .garden-detail-page--wangshiyuan .detail-hero-card {
    grid-area: auto;
    width: 100%;
    margin: 0;
    order: 2;
  }

  .detail-hero-note,
  .garden-detail-page--liuyuan .detail-hero-note,
  .garden-detail-page--wangshiyuan .detail-hero-note {
    position: relative;
    inset: auto;
    grid-area: auto;
    width: 100%;
    order: 3;
  }

  .immersive-dialog {
    padding: 1rem;
  }

  .immersive-dialog__panel {
    max-height: calc(100vh - 2rem);
    padding: 18px;
  }

  .immersive-dialog__header {
    flex-direction: column;
  }

  .immersive-stage__media,
  .vr-stage__viewport {
    min-height: 360px;
  }

  .gallery-card--panorama,
  .gallery-card--landscape,
  .gallery-card--portrait,
  .gallery-card--square,
  .gallery-card--tall {
    width: min(78vw, 420px);
  }

  .gallery-card--portrait,
  .gallery-card--tall {
    width: min(62vw, 320px);
  }

  .garden-detail-page--liuyuan .gallery-card:nth-child(2n),
  .garden-detail-page--liuyuan .gallery-card:nth-child(3n) {
    transform: none;
  }
}

@media (max-width: 640px) {
  .detail-panel,
  .related-card,
  .detail-hero-card,
  .immersive-stage,
  .immersive-sidepanel {
    padding: 22px;
  }

  .detail-title {
    font-size: 2.2rem;
  }

  .detail-metrics {
    grid-template-columns: 1fr;
  }

  .detail-actions {
    flex-direction: column;
  }

  .detail-action-link {
    width: 100%;
  }

  .detail-watermark {
    font-size: 52vw;
  }

  .immersive-stage__media,
  .vr-stage__viewport {
    min-height: 300px;
  }

  .vr-stage__controls {
    grid-template-columns: 1fr;
  }

  .gallery-card--panorama,
  .gallery-card--landscape,
  .gallery-card--portrait,
  .gallery-card--square,
  .gallery-card--tall {
    width: min(84vw, 360px);
  }
}
</style>


