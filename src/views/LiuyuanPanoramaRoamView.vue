<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import PanoramaSphereViewer from '../components/PanoramaSphereViewer.vue';
import { gardenDetailsSource } from '../data/gardenDetails';
import { liuyuanPanoramaScenesSource } from '../data/liuyuanPanoramaTour';
import { resolveLocalized, useLanguage } from '../i18n';
import { applyImageFallback } from '../shared/imageFallback';
import { derivePanoramaInitialView, panoramaPanToYaw } from '../shared/panoramaView';

const { language } = useLanguage();
const route = useRoute();
const panoramaMusicSrc = new URL('../../music/05. Thin purple.mp3', import.meta.url).href;
const panoramaMusicVolume = 0.25;

const pageTextSource = {
  viewerLabel: { zh: '留园全景漫游', en: 'Lingering Garden Panorama' },
  backAction: { zh: '返回入口', en: 'Back to Entry' },
  detailAction: { zh: '园林详情', en: 'Garden Detail' },
  statusLabel: { zh: '漫游状态', en: 'Tour Status' },
  statusReady: { zh: '自由浏览', en: 'Free Browse' },
  statusAuto: { zh: '自动巡游中', en: 'Autoplay Running' },
  dragHint: {
    zh: '拖拽旋转全景，缩放看细部，轻点热点再读说明。',
    en: 'Drag to rotate, zoom for details, and tap hotspots to read the scene.',
  },
  previousAction: { zh: '上一景', en: 'Previous' },
  nextAction: { zh: '下一景', en: 'Next' },
  autoplayPlay: { zh: '自动巡游', en: 'Autoplay' },
  autoplayPause: { zh: '暂停巡游', en: 'Pause' },
  progressLabel: { zh: '当前进度', en: 'Progress' },
  angleLabel: { zh: '视角方向', en: 'Viewing Angle' },
  noteLabel: { zh: '当前说明', en: 'Current Note' },
  sceneListLabel: { zh: '场景切换', en: 'Scene Switcher' },
  readingLabel: { zh: '阅读方式', en: 'Reading Tip' },
  readingText: {
    zh: '先顺着游线走一遍，再回头看门洞、花窗和山石怎样重组同一处景。',
    en: 'Walk the route once, then look back to see how frames and rockery recompose the scene.',
  },
  infoOpenAction: { zh: '展开说明', en: 'Show Info' },
  infoCloseAction: { zh: '收起说明', en: 'Hide Info' },
  railOpenAction: { zh: '展开场景', en: 'Show Scenes' },
  railCloseAction: { zh: '收起场景', en: 'Hide Scenes' },
  controlsOpenAction: { zh: '展开控制', en: 'Show Controls' },
  controlsCloseAction: { zh: '收起控制', en: 'Hide Controls' },
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const isMobileViewport = () => typeof window !== 'undefined' && window.innerWidth <= 640;

const pageText = computed(() => resolveLocalized(pageTextSource, language.value));
const garden = computed(() => resolveLocalized(gardenDetailsSource.liuyuan, language.value));
const scenes = computed(() =>
  liuyuanPanoramaScenesSource.map((scene, index) => {
    const localizedScene = resolveLocalized(scene, language.value);
    return {
      ...localizedScene,
      id: localizedScene.id || `scene-${index + 1}`,
      order: localizedScene.order || String(index + 1).padStart(2, '0'),
      hotspots: localizedScene.hotspots || [],
      accent: localizedScene.accent || '#8c5b33',
    };
  }),
);

const activeSceneIndex = ref(0);
const activeHotspotId = ref('');
const autoPlay = ref(false);
const infoOpen = ref(false);
const railOpen = ref(false);
const controlsOpen = ref(false);
const viewState = ref({ yaw: 0, pitch: 0, fov: 70 });
const backgroundAudioRef = ref(null);
let resumeAudioListenersBound = false;

const activeScene = computed(() => scenes.value[activeSceneIndex.value] || scenes.value[0] || null);
const activeHotspot = computed(
  () =>
    activeScene.value?.hotspots?.find((item) => item.id === activeHotspotId.value)
    || activeScene.value?.hotspots?.[0]
    || null,
);
const progressRatio = computed(() => (scenes.value.length ? ((activeSceneIndex.value + 1) / scenes.value.length) * 100 : 0));
const normalizedYaw = computed(() => Math.round((((viewState.value.yaw % 360) + 360) % 360)));
const progressLabel = computed(() => {
  const total = String(scenes.value.length).padStart(2, '0');
  const current = String(activeSceneIndex.value + 1).padStart(2, '0');
  return `${current} / ${total}`;
});
const activeSceneBackdropStyle = computed(() => ({
  backgroundImage: activeScene.value?.fallbackImage
    ? `url(${activeScene.value.fallbackImage}), url(${activeScene.value?.image || garden.value.heroImage})`
    : `url(${activeScene.value?.image || garden.value.heroImage})`,
}));
const angleMeterRatio = computed(() => `${clamp((normalizedYaw.value / 360) * 100, 0, 100)}%`);
const activeNoteTitle = computed(() => activeHotspot.value?.title || activeScene.value?.title || '');
const activeNoteDescription = computed(() => activeHotspot.value?.description || activeScene.value?.description || '');

const setActiveScene = (index) => {
  if (index < 0 || index >= scenes.value.length) return;
  activeSceneIndex.value = index;
};

const syncSceneFromRoute = (sceneId) => {
  if (!sceneId || !scenes.value.length) return;
  const nextIndex = scenes.value.findIndex((scene) => scene.id === sceneId);
  if (nextIndex >= 0) activeSceneIndex.value = nextIndex;
};

const setActiveHotspot = (hotspotId) => {
  activeHotspotId.value = hotspotId;
};

const showPreviousScene = () => {
  if (!scenes.value.length) return;
  setActiveScene((activeSceneIndex.value - 1 + scenes.value.length) % scenes.value.length);
};

const showNextScene = () => {
  if (!scenes.value.length) return;
  setActiveScene((activeSceneIndex.value + 1) % scenes.value.length);
};

const toggleAutoPlay = () => {
  autoPlay.value = !autoPlay.value;
};

const toggleInfo = () => {
  infoOpen.value = !infoOpen.value;
};

const toggleRail = () => {
  railOpen.value = !railOpen.value;
};

const toggleControls = () => {
  controlsOpen.value = !controlsOpen.value;
};

const handleViewChange = (nextViewState) => {
  viewState.value = nextViewState;
};

const handleImageError = (event, fallbackImage) => {
  applyImageFallback(event, fallbackImage);
};

const removeResumeAudioListeners = () => {
  if (typeof window === 'undefined' || !resumeAudioListenersBound) return;
  window.removeEventListener('pointerdown', resumeBackgroundMusic);
  window.removeEventListener('touchstart', resumeBackgroundMusic);
  window.removeEventListener('keydown', resumeBackgroundMusic);
  resumeAudioListenersBound = false;
};

async function resumeBackgroundMusic() {
  const audioElement = backgroundAudioRef.value;
  if (!audioElement) return;

  audioElement.volume = panoramaMusicVolume;

  try {
    await audioElement.play();
    removeResumeAudioListeners();
  } catch {
    ensureResumeAudioListeners();
  }
}

const ensureResumeAudioListeners = () => {
  if (typeof window === 'undefined' || resumeAudioListenersBound) return;
  window.addEventListener('pointerdown', resumeBackgroundMusic, { passive: true });
  window.addEventListener('touchstart', resumeBackgroundMusic, { passive: true });
  window.addEventListener('keydown', resumeBackgroundMusic);
  resumeAudioListenersBound = true;
};

watch(
  activeScene,
  (scene) => {
    if (!scene) {
      activeHotspotId.value = '';
      return;
    }
    const nextHotspotId = scene.initialHotspotId || scene.hotspots?.[0]?.id || '';
    const initialView = derivePanoramaInitialView(scene, nextHotspotId, isMobileViewport());
    activeHotspotId.value = nextHotspotId;
    viewState.value = {
      yaw: panoramaPanToYaw(initialView.pan),
      pitch: initialView.tilt ?? 0,
      fov: initialView.fov ?? 70,
    };
  },
  { immediate: true },
);

watch(
  [scenes, () => route.query.scene],
  ([nextScenes, nextSceneId]) => {
    if (!nextScenes.length) return;
    syncSceneFromRoute(typeof nextSceneId === 'string' ? nextSceneId : '');
  },
  { immediate: true },
);

onMounted(() => {
  if (typeof window !== 'undefined') {
    if (window.innerWidth > 640) {
      controlsOpen.value = true;
    } else {
      railOpen.value = true;
    }
  }

  if (backgroundAudioRef.value) {
    backgroundAudioRef.value.volume = panoramaMusicVolume;
  }

  resumeBackgroundMusic().catch(() => {
    ensureResumeAudioListeners();
  });
});

onBeforeUnmount(() => {
  removeResumeAudioListeners();
  const audioElement = backgroundAudioRef.value;
  if (!audioElement) return;

  audioElement.pause();
  audioElement.currentTime = 0;
});
</script>

<template>
  <article v-if="activeScene" class="liuyuan-panorama-viewer">
    <audio
      ref="backgroundAudioRef"
      :src="panoramaMusicSrc"
      autoplay
      loop
      preload="auto"
      playsinline
    />
    <div class="liuyuan-panorama-viewer__backdrop" :style="activeSceneBackdropStyle" />
    <div class="liuyuan-panorama-viewer__veil" />

    <div class="liuyuan-panorama-viewer__viewport">
      <PanoramaSphereViewer
        :scene="activeScene"
        :active-hotspot-id="activeHotspotId"
        :auto-play="autoPlay"
        @hotspot-select="setActiveHotspot"
        @view-change="handleViewChange"
      />
    </div>

    <header class="liuyuan-panorama-viewer__topbar">
      <div class="liuyuan-panorama-viewer__brand glass">
        <span>{{ pageText.viewerLabel }}</span>
        <strong>{{ garden.name }}</strong>
      </div>
      <div class="liuyuan-panorama-viewer__top-actions">
        <RouterLink to="/liu/panorama" class="liuyuan-panorama-viewer__pill glass">{{ pageText.backAction }}</RouterLink>
        <RouterLink to="/liu" class="liuyuan-panorama-viewer__pill glass">{{ pageText.detailAction }}</RouterLink>
      </div>
    </header>

    <section class="liuyuan-panorama-viewer__floating">
      <div class="liuyuan-panorama-viewer__scene-chip glass">
        <div class="liuyuan-panorama-viewer__scene-chip-main">
          <p>{{ activeScene.order }}</p>
          <h1>{{ activeScene.title }}</h1>
          <strong>{{ activeHotspot?.label || pageText.noteLabel }}</strong>
        </div>
        <div class="liuyuan-panorama-viewer__scene-chip-actions">
          <button type="button" class="liuyuan-panorama-viewer__chip-button" @click="toggleInfo">
            {{ infoOpen ? pageText.infoCloseAction : pageText.infoOpenAction }}
          </button>
          <button type="button" class="liuyuan-panorama-viewer__chip-button liuyuan-panorama-viewer__chip-button--strong" @click="toggleRail">
            {{ railOpen ? pageText.railCloseAction : pageText.railOpenAction }}
          </button>
        </div>
      </div>

      <transition name="liuyuan-fade">
        <section v-if="infoOpen" class="liuyuan-panorama-viewer__info-card glass">
          <div class="liuyuan-panorama-viewer__info-copy">
            <p>{{ pageText.noteLabel }}</p>
            <strong>{{ activeNoteTitle }}</strong>
            <span>{{ activeNoteDescription }}</span>
          </div>
          <div class="liuyuan-panorama-viewer__info-copy liuyuan-panorama-viewer__info-copy--subtle">
            <p>{{ pageText.readingLabel }}</p>
            <span>{{ pageText.readingText }}</span>
          </div>
        </section>
      </transition>
    </section>

    <aside class="liuyuan-panorama-viewer__utility glass">
      <div class="liuyuan-panorama-viewer__utility-head">
        <div>
          <p>{{ pageText.statusLabel }}</p>
          <strong>{{ autoPlay ? pageText.statusAuto : pageText.statusReady }}</strong>
        </div>
        <span>{{ progressLabel }}</span>
      </div>
      <button type="button" class="liuyuan-panorama-viewer__utility-toggle" @click="toggleControls">
        {{ controlsOpen ? pageText.controlsCloseAction : pageText.controlsOpenAction }}
      </button>

      <transition name="liuyuan-fade">
        <div v-if="controlsOpen" class="liuyuan-panorama-viewer__utility-body">
          <div class="liuyuan-panorama-viewer__utility-meters">
            <div class="liuyuan-panorama-viewer__utility-metric">
              <small>{{ pageText.progressLabel }}</small>
              <div class="liuyuan-panorama-viewer__meter"><span :style="{ width: `${progressRatio}%` }" /></div>
            </div>
            <div class="liuyuan-panorama-viewer__utility-metric">
              <small>{{ pageText.angleLabel }} {{ normalizedYaw }}°</small>
              <div class="liuyuan-panorama-viewer__meter liuyuan-panorama-viewer__meter--subtle"><span :style="{ width: angleMeterRatio }" /></div>
            </div>
          </div>

          <div class="liuyuan-panorama-viewer__controls">
            <button type="button" class="liuyuan-panorama-viewer__control" @click="showPreviousScene">{{ pageText.previousAction }}</button>
            <button type="button" class="liuyuan-panorama-viewer__control liuyuan-panorama-viewer__control--primary" @click="toggleAutoPlay">
              {{ autoPlay ? pageText.autoplayPause : pageText.autoplayPlay }}
            </button>
            <button type="button" class="liuyuan-panorama-viewer__control" @click="showNextScene">{{ pageText.nextAction }}</button>
          </div>

          <span class="liuyuan-panorama-viewer__hint">{{ pageText.dragHint }}</span>
        </div>
      </transition>
    </aside>

    <footer class="liuyuan-panorama-viewer__bottom" :class="{ 'is-open': railOpen }">
      <section class="liuyuan-panorama-viewer__scene-strip-wrap glass">
        <div class="liuyuan-panorama-viewer__scene-strip-head">
          <div class="liuyuan-panorama-viewer__scene-strip-meta">
            <p>{{ pageText.sceneListLabel }}</p>
            <strong>{{ activeNoteTitle }}</strong>
            <small>{{ activeNoteDescription }}</small>
          </div>
          <button type="button" class="liuyuan-panorama-viewer__rail-toggle" @click="toggleRail">
            {{ railOpen ? pageText.railCloseAction : pageText.railOpenAction }}
          </button>
        </div>

        <transition name="liuyuan-fade">
          <div v-if="railOpen" class="liuyuan-panorama-viewer__scene-strip">
            <button
              v-for="(scene, index) in scenes"
              :key="scene.id"
              type="button"
              :class="['liuyuan-panorama-viewer__scene-card', { 'is-active': index === activeSceneIndex }]"
              :style="{ '--scene-accent': scene.accent }"
              @click="setActiveScene(index)"
            >
              <img
                :src="scene.fallbackThumbnail || scene.fallbackImage || scene.thumbnail || scene.image"
                :alt="scene.title"
                class="liuyuan-panorama-viewer__scene-card-image"
                loading="lazy"
                @error="handleImageError($event, scene.thumbnail || scene.image)"
              />
              <div class="liuyuan-panorama-viewer__scene-card-copy">
                <span>{{ scene.order }}</span>
                <strong>{{ scene.title }}</strong>
              </div>
            </button>
          </div>
        </transition>
      </section>
    </footer>
  </article>
</template>

<style scoped>
.liuyuan-panorama-viewer {
  position: relative;
  min-height: 100vh;
  min-height: 100svh;
  overflow: hidden;
  color: #fff4ea;
  background: #100b08;
}

.liuyuan-panorama-viewer__backdrop,
.liuyuan-panorama-viewer__veil,
.liuyuan-panorama-viewer__viewport {
  position: absolute;
  inset: 0;
}

.liuyuan-panorama-viewer__backdrop {
  background-position: center;
  background-size: cover;
  filter: blur(18px) saturate(1.02);
  transform: scale(1.05);
}

.liuyuan-panorama-viewer__veil {
  background:
    linear-gradient(180deg, rgba(16, 11, 8, 0.08), rgba(16, 11, 8, 0.22) 20%, rgba(16, 11, 8, 0.72)),
    linear-gradient(90deg, rgba(16, 11, 8, 0.18), transparent 18%, transparent 82%, rgba(16, 11, 8, 0.24));
}

.liuyuan-panorama-viewer__viewport {
  z-index: 0;
}

.liuyuan-panorama-viewer__topbar,
.liuyuan-panorama-viewer__floating,
.liuyuan-panorama-viewer__utility,
.liuyuan-panorama-viewer__bottom {
  position: relative;
  z-index: 2;
}

.glass {
  border: 1px solid rgba(255, 238, 225, 0.14);
  background:
    linear-gradient(180deg, rgba(34, 22, 15, 0.42), rgba(14, 10, 8, 0.26)),
    rgba(14, 10, 8, 0.24);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.18);
}

.liuyuan-panorama-viewer__topbar {
  position: absolute;
  inset: 0 0 auto;
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  padding: calc(0.75rem + env(safe-area-inset-top, 0px)) 0.75rem 0;
}

.liuyuan-panorama-viewer__brand,
.liuyuan-panorama-viewer__scene-chip,
.liuyuan-panorama-viewer__info-card,
.liuyuan-panorama-viewer__utility,
.liuyuan-panorama-viewer__scene-strip-wrap {
  border-radius: 22px;
}

.liuyuan-panorama-viewer__brand {
  display: grid;
  gap: 0.16rem;
  padding: 0.62rem 0.8rem;
}

.liuyuan-panorama-viewer__brand span,
.liuyuan-panorama-viewer__scene-chip p,
.liuyuan-panorama-viewer__info-copy p,
.liuyuan-panorama-viewer__utility-head p,
.liuyuan-panorama-viewer__utility-metric small,
.liuyuan-panorama-viewer__scene-strip-head p,
.liuyuan-panorama-viewer__scene-card span {
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 239, 226, 0.72);
}

.liuyuan-panorama-viewer__brand strong,
.liuyuan-panorama-viewer__utility-head strong,
.liuyuan-panorama-viewer__utility-head span,
.liuyuan-panorama-viewer__info-copy strong,
.liuyuan-panorama-viewer__scene-strip-meta strong,
.liuyuan-panorama-viewer__scene-card strong {
  color: #fff7f0;
}

.liuyuan-panorama-viewer__top-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
  width: min(320px, 100%);
}

.liuyuan-panorama-viewer__pill,
.liuyuan-panorama-viewer__chip-button,
.liuyuan-panorama-viewer__utility-toggle,
.liuyuan-panorama-viewer__control,
.liuyuan-panorama-viewer__rail-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.35rem;
  padding: 0 0.88rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 238, 225, 0.12);
  background: rgba(255, 250, 246, 0.06);
  color: #fff7f0;
  text-decoration: none;
}

.liuyuan-panorama-viewer__floating {
  position: absolute;
  top: calc(4.5rem + env(safe-area-inset-top, 0px));
  left: 0.75rem;
  width: min(320px, calc(100vw - 1.5rem));
  display: grid;
  gap: 0.55rem;
}

.liuyuan-panorama-viewer__scene-chip {
  display: grid;
  gap: 0.72rem;
  padding: 0.82rem 0.88rem;
}

.liuyuan-panorama-viewer__scene-chip-main {
  display: grid;
  gap: 0.28rem;
}

.liuyuan-panorama-viewer__scene-chip h1 {
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(1.45rem, 8vw, 2rem);
  line-height: 1.04;
  color: #fff7f0;
}

.liuyuan-panorama-viewer__scene-chip-main strong {
  display: inline-flex;
  width: fit-content;
  padding: 0.34rem 0.56rem;
  border-radius: 999px;
  background: rgba(196, 138, 89, 0.18);
  color: #fff0e2;
  font-size: 0.76rem;
}

.liuyuan-panorama-viewer__scene-chip-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

.liuyuan-panorama-viewer__chip-button--strong,
.liuyuan-panorama-viewer__control--primary {
  background: linear-gradient(135deg, rgba(143, 89, 46, 0.96), rgba(201, 145, 92, 0.88));
  border-color: rgba(255, 228, 206, 0.18);
}

.liuyuan-panorama-viewer__info-card {
  display: grid;
  gap: 0.78rem;
  padding: 0.82rem 0.88rem;
}

.liuyuan-panorama-viewer__info-copy {
  display: grid;
  gap: 0.34rem;
}

.liuyuan-panorama-viewer__info-copy span,
.liuyuan-panorama-viewer__hint,
.liuyuan-panorama-viewer__scene-strip-meta small {
  line-height: 1.5;
  color: rgba(255, 243, 232, 0.82);
}

.liuyuan-panorama-viewer__info-copy--subtle {
  padding-top: 0.14rem;
  border-top: 1px solid rgba(255, 238, 225, 0.08);
}

.liuyuan-panorama-viewer__utility {
  position: absolute;
  left: 0.75rem;
  right: 0.75rem;
  bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));
  display: grid;
  gap: 0.62rem;
  padding: 0.82rem 0.88rem;
}

.liuyuan-panorama-viewer__utility-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: start;
}

.liuyuan-panorama-viewer__utility-body {
  display: grid;
  gap: 0.7rem;
}

.liuyuan-panorama-viewer__utility-meters {
  display: grid;
  gap: 0.52rem;
}

.liuyuan-panorama-viewer__utility-metric {
  display: grid;
  gap: 0.3rem;
}

.liuyuan-panorama-viewer__meter {
  position: relative;
  height: 0.36rem;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 238, 225, 0.12);
}

.liuyuan-panorama-viewer__meter span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(170, 110, 62, 0.98), rgba(247, 217, 188, 0.84));
}

.liuyuan-panorama-viewer__meter--subtle span {
  background: linear-gradient(90deg, rgba(88, 127, 112, 0.96), rgba(210, 236, 228, 0.82));
}

.liuyuan-panorama-viewer__controls {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
}

.liuyuan-panorama-viewer__hint {
  font-size: 0.8rem;
}

.liuyuan-panorama-viewer__bottom {
  position: absolute;
  left: 0.75rem;
  right: 0.75rem;
  bottom: calc(5.4rem + env(safe-area-inset-bottom, 0px));
}

.liuyuan-panorama-viewer__scene-strip-wrap {
  display: grid;
  gap: 0.6rem;
  padding: 0.74rem 0.8rem;
}

.liuyuan-panorama-viewer__scene-strip-head {
  display: flex;
  justify-content: space-between;
  gap: 0.7rem;
  align-items: center;
}

.liuyuan-panorama-viewer__scene-strip-meta {
  display: grid;
  gap: 0.18rem;
}

.liuyuan-panorama-viewer__scene-strip-meta small {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.liuyuan-panorama-viewer__scene-strip {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(120px, 1fr);
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.08rem;
}

.liuyuan-panorama-viewer__scene-card {
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: 6.5rem;
  padding: 0;
  border-radius: 16px;
  border: 1px solid rgba(255, 238, 225, 0.12);
  background:
    linear-gradient(160deg, color-mix(in srgb, var(--scene-accent) 22%, rgba(255, 255, 255, 0.06)), rgba(14, 10, 8, 0.74)),
    rgba(14, 10, 8, 0.3);
  color: #fff7f0;
  text-align: left;
}

.liuyuan-panorama-viewer__scene-card-image {
  display: block;
  width: 100%;
  height: 3.25rem;
  object-fit: cover;
}

.liuyuan-panorama-viewer__scene-card-copy {
  display: grid;
  gap: 0.24rem;
  padding: 0.48rem 0.55rem 0.58rem;
}

.liuyuan-panorama-viewer__scene-card strong {
  font-size: 0.8rem;
}

.liuyuan-panorama-viewer__scene-card.is-active {
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.22);
}

.liuyuan-fade-enter-active,
.liuyuan-fade-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.liuyuan-fade-enter-from,
.liuyuan-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

@media (min-width: 641px) {
  .liuyuan-panorama-viewer__floating {
    top: 5.2rem;
    left: 1rem;
    width: min(380px, calc(100vw - 2rem));
  }

  .liuyuan-panorama-viewer__topbar {
    padding: 0.8rem 0.8rem 0;
  }

  .liuyuan-panorama-viewer__top-actions {
    width: auto;
    display: flex;
  }

  .liuyuan-panorama-viewer__pill,
  .liuyuan-panorama-viewer__chip-button,
  .liuyuan-panorama-viewer__utility-toggle,
  .liuyuan-panorama-viewer__control,
  .liuyuan-panorama-viewer__rail-toggle {
    min-height: 2.6rem;
  }

  .liuyuan-panorama-viewer__scene-chip h1 {
    font-size: clamp(1.8rem, 4vw, 2.6rem);
  }

  .liuyuan-panorama-viewer__utility {
    left: auto;
    right: 1rem;
    top: 5rem;
    bottom: auto;
    width: min(300px, calc(100vw - 2rem));
  }

  .liuyuan-panorama-viewer__controls {
    grid-template-columns: 1fr;
  }

  .liuyuan-panorama-viewer__utility-toggle {
    display: none;
  }

  .liuyuan-panorama-viewer__utility-body {
    display: grid !important;
  }

  .liuyuan-panorama-viewer__bottom {
    left: 50%;
    right: auto;
    bottom: 1rem;
    width: min(1080px, calc(100vw - 2rem));
    transform: translateX(-50%);
  }

  .liuyuan-panorama-viewer__scene-card {
    min-height: 7.6rem;
  }

  .liuyuan-panorama-viewer__scene-card-image {
    height: 4.4rem;
  }

  .liuyuan-panorama-viewer__scene-card strong {
    font-size: 0.92rem;
  }
}

@media (max-width: 640px) {
  .liuyuan-panorama-viewer__backdrop {
    filter: none;
    transform: none;
    background-position: center;
    background-size: cover;
  }

  .liuyuan-panorama-viewer__veil {
    background:
      linear-gradient(180deg, rgba(16, 11, 8, 0.02), rgba(16, 11, 8, 0.12) 18%, rgba(16, 11, 8, 0.44) 78%, rgba(16, 11, 8, 0.6)),
      linear-gradient(90deg, rgba(16, 11, 8, 0.08), transparent 12%, transparent 88%, rgba(16, 11, 8, 0.1));
  }

  .liuyuan-panorama-viewer__topbar {
    align-items: stretch;
    padding: calc(0.65rem + env(safe-area-inset-top, 0px)) 0.65rem 0;
  }

  .liuyuan-panorama-viewer__brand {
    display: none;
  }

  .liuyuan-panorama-viewer__top-actions {
    width: 100%;
  }

  .liuyuan-panorama-viewer__pill,
  .liuyuan-panorama-viewer__chip-button,
  .liuyuan-panorama-viewer__utility-toggle,
  .liuyuan-panorama-viewer__control,
  .liuyuan-panorama-viewer__rail-toggle {
    min-height: 2.2rem;
    padding: 0 0.72rem;
    font-size: 0.74rem;
  }

  .liuyuan-panorama-viewer__floating {
    top: calc(3.55rem + env(safe-area-inset-top, 0px));
    left: 0.65rem;
    right: auto;
    width: min(16rem, calc(100vw - 1.3rem));
    gap: 0.38rem;
  }

  .liuyuan-panorama-viewer__scene-chip,
  .liuyuan-panorama-viewer__info-card,
  .liuyuan-panorama-viewer__utility,
  .liuyuan-panorama-viewer__scene-strip-wrap {
    border-radius: 24px;
  }

  .liuyuan-panorama-viewer__scene-chip {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    padding: 0.56rem 0.64rem;
    gap: 0.4rem;
  }

  .liuyuan-panorama-viewer__scene-chip-main {
    min-width: 0;
    gap: 0.16rem;
  }

  .liuyuan-panorama-viewer__scene-chip p {
    font-size: 0.58rem;
  }

  .liuyuan-panorama-viewer__scene-chip h1 {
    font-size: 1rem;
    line-height: 1.1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .liuyuan-panorama-viewer__scene-chip-main strong {
    display: none;
  }

  .liuyuan-panorama-viewer__scene-chip-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.3rem;
  }

  .liuyuan-panorama-viewer__info-card {
    max-width: min(19rem, calc(100vw - 1.3rem));
    padding: 0.7rem 0.78rem;
    max-height: min(24vh, 11rem);
    overflow-y: auto;
  }

  .liuyuan-panorama-viewer__utility {
    display: none;
  }

  .liuyuan-panorama-viewer__utility-head {
    align-items: center;
  }

  .liuyuan-panorama-viewer__utility-head p {
    display: none;
  }

  .liuyuan-panorama-viewer__utility-head strong {
    font-size: 0.84rem;
  }

  .liuyuan-panorama-viewer__utility-head span {
    flex: 0 0 auto;
    font-size: 0.76rem;
  }

  .liuyuan-panorama-viewer__utility-body {
    gap: 0.5rem;
  }

  .liuyuan-panorama-viewer__utility-meters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.4rem;
  }

  .liuyuan-panorama-viewer__utility-metric {
    gap: 0.22rem;
  }

  .liuyuan-panorama-viewer__utility-metric small {
    font-size: 0.58rem;
  }

  .liuyuan-panorama-viewer__meter {
    height: 0.28rem;
  }

  .liuyuan-panorama-viewer__controls {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.34rem;
  }

  .liuyuan-panorama-viewer__hint {
    display: none;
  }

  .liuyuan-panorama-viewer__bottom {
    position: fixed;
    left: 0.65rem;
    right: 0.65rem;
    bottom: calc(0.55rem + env(safe-area-inset-bottom, 0px));
    z-index: 4;
    transition:
      bottom 0.24s ease,
      transform 0.24s ease,
      opacity 0.24s ease;
  }

  .liuyuan-panorama-viewer__bottom.is-open {
    bottom: calc(0.55rem + env(safe-area-inset-bottom, 0px));
  }

  .liuyuan-panorama-viewer__scene-strip-wrap {
    padding: 0.42rem 0.48rem;
    gap: 0.36rem;
  }

  .liuyuan-panorama-viewer__scene-strip-head {
    align-items: center;
    gap: 0.55rem;
  }

  .liuyuan-panorama-viewer__scene-strip-meta {
    min-width: 0;
    gap: 0.1rem;
  }

  .liuyuan-panorama-viewer__scene-strip-meta strong {
    font-size: 0.82rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .liuyuan-panorama-viewer__scene-strip-meta small {
    display: none;
  }

  .liuyuan-panorama-viewer__scene-strip {
    grid-auto-columns: minmax(8.4rem, 63vw);
    padding-bottom: 0.16rem;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
  }

  .liuyuan-panorama-viewer__scene-strip::-webkit-scrollbar {
    display: none;
  }

  .liuyuan-panorama-viewer__scene-card {
    min-height: 5.35rem;
    border-radius: 14px;
    scroll-snap-align: start;
  }

  .liuyuan-panorama-viewer__scene-card-image {
    height: 3rem;
  }

  .liuyuan-panorama-viewer__scene-card-copy {
    padding: 0.42rem 0.48rem 0.5rem;
  }

  .liuyuan-panorama-viewer__scene-card strong {
    font-size: 0.76rem;
  }
}
</style>
