<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import PanoramaSphereViewer from '../components/PanoramaSphereViewer.vue';
import { gardenDetailsSource } from '../data/gardenDetails';
import { wangshiyuanPanoramaScenesSource } from '../data/wangshiyuanPanoramaTour';
import { resolveLocalized, useLanguage } from '../i18n';
import { derivePanoramaInitialView, panoramaPanToYaw } from '../shared/panoramaView';

const { language } = useLanguage();
const route = useRoute();
const panoramaMusicSrc = new URL('../../music/03. Crescent.mp3', import.meta.url).href;
const panoramaMusicVolume = 0.25;

const pageTextSource = {
  viewerLabel: { zh: '网师园全景漫游', en: 'Master of Nets Panorama' },
  backAction: { zh: '返回入口', en: 'Back to Entry' },
  detailAction: { zh: '园林详情', en: 'Garden Detail' },
  statusLabel: { zh: '漫游状态', en: 'Tour Status' },
  statusReady: { zh: '静读中', en: 'Quiet Browse' },
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
    zh: '先读尺度，再贴近细部，最后回到池边看边界和留白。',
    en: 'Read proportions first, move close to details, and end by the pond edge.',
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
const garden = computed(() => resolveLocalized(gardenDetailsSource.wangshiyuan, language.value));
const scenes = computed(() =>
  wangshiyuanPanoramaScenesSource.map((scene, index) => {
    const localizedScene = resolveLocalized(scene, language.value);
    return {
      ...localizedScene,
      id: localizedScene.id || `scene-${index + 1}`,
      order: localizedScene.order || String(index + 1).padStart(2, '0'),
      hotspots: localizedScene.hotspots || [],
      accent: localizedScene.accent || '#8b4f44',
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
  backgroundImage: `url(${activeScene.value?.image || garden.value.heroImage})`,
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
  <article v-if="activeScene" class="wangshi-panorama-viewer">
    <audio
      ref="backgroundAudioRef"
      :src="panoramaMusicSrc"
      autoplay
      loop
      preload="auto"
      playsinline
    />
    <div class="wangshi-panorama-viewer__backdrop" :style="activeSceneBackdropStyle" />
    <div class="wangshi-panorama-viewer__veil" />

    <div class="wangshi-panorama-viewer__viewport">
      <PanoramaSphereViewer
        :scene="activeScene"
        :active-hotspot-id="activeHotspotId"
        :auto-play="autoPlay"
        @hotspot-select="setActiveHotspot"
        @view-change="handleViewChange"
      />
    </div>

    <header class="wangshi-panorama-viewer__topbar">
      <div class="wangshi-panorama-viewer__brand glass">
        <span>{{ pageText.viewerLabel }}</span>
        <strong>{{ garden.name }}</strong>
      </div>
      <div class="wangshi-panorama-viewer__top-actions">
        <RouterLink to="/wangshi/panorama" class="wangshi-panorama-viewer__pill glass">{{ pageText.backAction }}</RouterLink>
        <RouterLink to="/wangshi" class="wangshi-panorama-viewer__pill glass">{{ pageText.detailAction }}</RouterLink>
      </div>
    </header>

    <section class="wangshi-panorama-viewer__floating">
      <div class="wangshi-panorama-viewer__scene-chip glass">
        <div class="wangshi-panorama-viewer__scene-chip-main">
          <p>{{ activeScene.order }}</p>
          <h1>{{ activeScene.title }}</h1>
          <strong>{{ activeHotspot?.label || pageText.noteLabel }}</strong>
        </div>
        <div class="wangshi-panorama-viewer__scene-chip-actions">
          <button type="button" class="wangshi-panorama-viewer__chip-button" @click="toggleInfo">
            {{ infoOpen ? pageText.infoCloseAction : pageText.infoOpenAction }}
          </button>
          <button type="button" class="wangshi-panorama-viewer__chip-button wangshi-panorama-viewer__chip-button--strong" @click="toggleRail">
            {{ railOpen ? pageText.railCloseAction : pageText.railOpenAction }}
          </button>
        </div>
      </div>

      <transition name="wangshi-fade">
        <section v-if="infoOpen" class="wangshi-panorama-viewer__info-card glass">
          <div class="wangshi-panorama-viewer__info-copy">
            <p>{{ pageText.noteLabel }}</p>
            <strong>{{ activeNoteTitle }}</strong>
            <span>{{ activeNoteDescription }}</span>
          </div>
          <div class="wangshi-panorama-viewer__info-copy wangshi-panorama-viewer__info-copy--subtle">
            <p>{{ pageText.readingLabel }}</p>
            <span>{{ pageText.readingText }}</span>
          </div>
        </section>
      </transition>
    </section>

    <aside class="wangshi-panorama-viewer__utility glass">
      <div class="wangshi-panorama-viewer__utility-head">
        <div>
          <p>{{ pageText.statusLabel }}</p>
          <strong>{{ autoPlay ? pageText.statusAuto : pageText.statusReady }}</strong>
        </div>
        <span>{{ progressLabel }}</span>
      </div>
      <button type="button" class="wangshi-panorama-viewer__utility-toggle" @click="toggleControls">
        {{ controlsOpen ? pageText.controlsCloseAction : pageText.controlsOpenAction }}
      </button>

      <transition name="wangshi-fade">
        <div v-if="controlsOpen" class="wangshi-panorama-viewer__utility-body">
          <div class="wangshi-panorama-viewer__utility-meters">
            <div class="wangshi-panorama-viewer__utility-metric">
              <small>{{ pageText.progressLabel }}</small>
              <div class="wangshi-panorama-viewer__meter"><span :style="{ width: `${progressRatio}%` }" /></div>
            </div>
            <div class="wangshi-panorama-viewer__utility-metric">
              <small>{{ pageText.angleLabel }} {{ normalizedYaw }}°</small>
              <div class="wangshi-panorama-viewer__meter wangshi-panorama-viewer__meter--subtle"><span :style="{ width: angleMeterRatio }" /></div>
            </div>
          </div>

          <div class="wangshi-panorama-viewer__controls">
            <button type="button" class="wangshi-panorama-viewer__control" @click="showPreviousScene">{{ pageText.previousAction }}</button>
            <button type="button" class="wangshi-panorama-viewer__control wangshi-panorama-viewer__control--primary" @click="toggleAutoPlay">
              {{ autoPlay ? pageText.autoplayPause : pageText.autoplayPlay }}
            </button>
            <button type="button" class="wangshi-panorama-viewer__control" @click="showNextScene">{{ pageText.nextAction }}</button>
          </div>

          <span class="wangshi-panorama-viewer__hint">{{ pageText.dragHint }}</span>
        </div>
      </transition>
    </aside>

    <footer class="wangshi-panorama-viewer__bottom" :class="{ 'is-open': railOpen }">
      <section class="wangshi-panorama-viewer__scene-strip-wrap glass">
        <div class="wangshi-panorama-viewer__scene-strip-head">
          <div class="wangshi-panorama-viewer__scene-strip-meta">
            <p>{{ pageText.sceneListLabel }}</p>
            <strong>{{ activeNoteTitle }}</strong>
            <small>{{ activeNoteDescription }}</small>
          </div>
          <button type="button" class="wangshi-panorama-viewer__rail-toggle" @click="toggleRail">
            {{ railOpen ? pageText.railCloseAction : pageText.railOpenAction }}
          </button>
        </div>

        <transition name="wangshi-fade">
          <div v-if="railOpen" class="wangshi-panorama-viewer__scene-strip">
            <button
              v-for="(scene, index) in scenes"
              :key="scene.id"
              type="button"
              :class="['wangshi-panorama-viewer__scene-card', { 'is-active': index === activeSceneIndex }]"
              :style="{ '--scene-accent': scene.accent }"
              @click="setActiveScene(index)"
            >
              <img :src="scene.thumbnail || scene.image" :alt="scene.title" class="wangshi-panorama-viewer__scene-card-image" loading="lazy" />
              <div class="wangshi-panorama-viewer__scene-card-copy">
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
.wangshi-panorama-viewer {
  position: relative;
  min-height: 100vh;
  min-height: 100svh;
  overflow: hidden;
  color: #f8f1ea;
  background: #0e0b09;
}

.wangshi-panorama-viewer__backdrop,
.wangshi-panorama-viewer__veil,
.wangshi-panorama-viewer__viewport {
  position: absolute;
  inset: 0;
}

.wangshi-panorama-viewer__backdrop {
  background-position: center;
  background-size: cover;
  filter: blur(18px) saturate(0.98);
  transform: scale(1.05);
}

.wangshi-panorama-viewer__veil {
  background:
    linear-gradient(180deg, rgba(14, 11, 9, 0.08), rgba(14, 11, 9, 0.22) 20%, rgba(14, 11, 9, 0.72)),
    linear-gradient(90deg, rgba(14, 11, 9, 0.18), transparent 18%, transparent 82%, rgba(14, 11, 9, 0.22));
}

.wangshi-panorama-viewer__viewport {
  z-index: 0;
}

.wangshi-panorama-viewer__topbar,
.wangshi-panorama-viewer__floating,
.wangshi-panorama-viewer__utility,
.wangshi-panorama-viewer__bottom {
  position: relative;
  z-index: 2;
}

.glass {
  border: 1px solid rgba(255, 241, 229, 0.14);
  background:
    linear-gradient(180deg, rgba(34, 24, 20, 0.42), rgba(16, 12, 10, 0.26)),
    rgba(16, 12, 10, 0.24);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.18);
}

.wangshi-panorama-viewer__topbar {
  position: absolute;
  inset: 0 0 auto;
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  padding: calc(0.75rem + env(safe-area-inset-top, 0px)) 0.75rem 0;
}

.wangshi-panorama-viewer__brand,
.wangshi-panorama-viewer__scene-chip,
.wangshi-panorama-viewer__info-card,
.wangshi-panorama-viewer__utility,
.wangshi-panorama-viewer__scene-strip-wrap {
  border-radius: 22px;
}

.wangshi-panorama-viewer__brand {
  display: grid;
  gap: 0.16rem;
  padding: 0.62rem 0.8rem;
}

.wangshi-panorama-viewer__brand span,
.wangshi-panorama-viewer__scene-chip p,
.wangshi-panorama-viewer__info-copy p,
.wangshi-panorama-viewer__utility-head p,
.wangshi-panorama-viewer__utility-metric small,
.wangshi-panorama-viewer__scene-strip-head p,
.wangshi-panorama-viewer__scene-card span {
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(248, 241, 234, 0.72);
}

.wangshi-panorama-viewer__brand strong,
.wangshi-panorama-viewer__utility-head strong,
.wangshi-panorama-viewer__utility-head span,
.wangshi-panorama-viewer__info-copy strong,
.wangshi-panorama-viewer__scene-strip-meta strong,
.wangshi-panorama-viewer__scene-card strong {
  color: #fff8f2;
}

.wangshi-panorama-viewer__top-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
  width: min(320px, 100%);
}

.wangshi-panorama-viewer__pill,
.wangshi-panorama-viewer__chip-button,
.wangshi-panorama-viewer__utility-toggle,
.wangshi-panorama-viewer__control,
.wangshi-panorama-viewer__rail-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.35rem;
  padding: 0 0.88rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 241, 229, 0.12);
  background: rgba(255, 250, 245, 0.06);
  color: #fff8f2;
  text-decoration: none;
}

.wangshi-panorama-viewer__floating {
  position: absolute;
  top: calc(4.5rem + env(safe-area-inset-top, 0px));
  left: 0.75rem;
  width: min(320px, calc(100vw - 1.5rem));
  display: grid;
  gap: 0.55rem;
}

.wangshi-panorama-viewer__scene-chip {
  display: grid;
  gap: 0.72rem;
  padding: 0.82rem 0.88rem;
}

.wangshi-panorama-viewer__scene-chip-main {
  display: grid;
  gap: 0.28rem;
}

.wangshi-panorama-viewer__scene-chip h1 {
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(1.45rem, 8vw, 2rem);
  line-height: 1.04;
  color: #fff8f2;
}

.wangshi-panorama-viewer__scene-chip-main strong {
  display: inline-flex;
  width: fit-content;
  padding: 0.34rem 0.56rem;
  border-radius: 999px;
  background: rgba(170, 96, 79, 0.18);
  color: #ffece5;
  font-size: 0.76rem;
}

.wangshi-panorama-viewer__scene-chip-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

.wangshi-panorama-viewer__chip-button--strong,
.wangshi-panorama-viewer__control--primary {
  background: linear-gradient(135deg, rgba(132, 59, 48, 0.96), rgba(172, 103, 86, 0.9));
  border-color: rgba(255, 221, 210, 0.18);
}

.wangshi-panorama-viewer__info-card {
  display: grid;
  gap: 0.78rem;
  padding: 0.82rem 0.88rem;
}

.wangshi-panorama-viewer__info-copy {
  display: grid;
  gap: 0.34rem;
}

.wangshi-panorama-viewer__info-copy span,
.wangshi-panorama-viewer__hint,
.wangshi-panorama-viewer__scene-strip-meta small {
  line-height: 1.5;
  color: rgba(248, 241, 234, 0.82);
}

.wangshi-panorama-viewer__info-copy--subtle {
  padding-top: 0.14rem;
  border-top: 1px solid rgba(255, 241, 229, 0.08);
}

.wangshi-panorama-viewer__utility {
  position: absolute;
  left: 0.75rem;
  right: 0.75rem;
  bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));
  display: grid;
  gap: 0.62rem;
  padding: 0.82rem 0.88rem;
}

.wangshi-panorama-viewer__utility-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: start;
}

.wangshi-panorama-viewer__utility-body {
  display: grid;
  gap: 0.7rem;
}

.wangshi-panorama-viewer__utility-meters {
  display: grid;
  gap: 0.52rem;
}

.wangshi-panorama-viewer__utility-metric {
  display: grid;
  gap: 0.3rem;
}

.wangshi-panorama-viewer__meter {
  position: relative;
  height: 0.36rem;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 241, 229, 0.12);
}

.wangshi-panorama-viewer__meter span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(170, 96, 79, 0.98), rgba(244, 210, 197, 0.94));
}

.wangshi-panorama-viewer__meter--subtle span {
  background: linear-gradient(90deg, rgba(90, 126, 107, 0.98), rgba(200, 228, 215, 0.94));
}

.wangshi-panorama-viewer__controls {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
}

.wangshi-panorama-viewer__hint {
  font-size: 0.8rem;
}

.wangshi-panorama-viewer__bottom {
  position: absolute;
  left: 0.75rem;
  right: 0.75rem;
  bottom: calc(5.4rem + env(safe-area-inset-bottom, 0px));
}

.wangshi-panorama-viewer__scene-strip-wrap {
  display: grid;
  gap: 0.6rem;
  padding: 0.74rem 0.8rem;
}

.wangshi-panorama-viewer__scene-strip-head {
  display: flex;
  justify-content: space-between;
  gap: 0.7rem;
  align-items: center;
}

.wangshi-panorama-viewer__scene-strip-meta {
  display: grid;
  gap: 0.18rem;
}

.wangshi-panorama-viewer__scene-strip-meta small {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.wangshi-panorama-viewer__scene-strip {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(120px, 1fr);
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.08rem;
}

.wangshi-panorama-viewer__scene-card {
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: 6.5rem;
  padding: 0;
  border-radius: 16px;
  border: 1px solid rgba(255, 241, 229, 0.12);
  background:
    linear-gradient(160deg, color-mix(in srgb, var(--scene-accent) 22%, rgba(255, 255, 255, 0.06)), rgba(16, 12, 10, 0.74)),
    rgba(16, 12, 10, 0.3);
  color: #fff8f2;
  text-align: left;
}

.wangshi-panorama-viewer__scene-card-image {
  display: block;
  width: 100%;
  height: 3.25rem;
  object-fit: cover;
}

.wangshi-panorama-viewer__scene-card-copy {
  display: grid;
  gap: 0.24rem;
  padding: 0.48rem 0.55rem 0.58rem;
}

.wangshi-panorama-viewer__scene-card strong {
  font-size: 0.8rem;
}

.wangshi-panorama-viewer__scene-card.is-active {
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.22);
}

.wangshi-fade-enter-active,
.wangshi-fade-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.wangshi-fade-enter-from,
.wangshi-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

@media (min-width: 641px) {
  .wangshi-panorama-viewer__floating {
    top: 5.2rem;
    left: 1rem;
    width: min(380px, calc(100vw - 2rem));
  }

  .wangshi-panorama-viewer__topbar {
    padding: 0.8rem 0.8rem 0;
  }

  .wangshi-panorama-viewer__top-actions {
    width: auto;
    display: flex;
  }

  .wangshi-panorama-viewer__pill,
  .wangshi-panorama-viewer__chip-button,
  .wangshi-panorama-viewer__utility-toggle,
  .wangshi-panorama-viewer__control,
  .wangshi-panorama-viewer__rail-toggle {
    min-height: 2.6rem;
  }

  .wangshi-panorama-viewer__scene-chip h1 {
    font-size: clamp(1.8rem, 4vw, 2.6rem);
  }

  .wangshi-panorama-viewer__utility {
    left: auto;
    right: 1rem;
    top: 5rem;
    bottom: auto;
    width: min(300px, calc(100vw - 2rem));
  }

  .wangshi-panorama-viewer__controls {
    grid-template-columns: 1fr;
  }

  .wangshi-panorama-viewer__utility-toggle {
    display: none;
  }

  .wangshi-panorama-viewer__utility-body {
    display: grid !important;
  }

  .wangshi-panorama-viewer__bottom {
    left: 50%;
    right: auto;
    bottom: 1rem;
    width: min(1080px, calc(100vw - 2rem));
    transform: translateX(-50%);
  }

  .wangshi-panorama-viewer__scene-card {
    min-height: 7.6rem;
  }

  .wangshi-panorama-viewer__scene-card-image {
    height: 4.4rem;
  }

  .wangshi-panorama-viewer__scene-card strong {
    font-size: 0.92rem;
  }
}

@media (max-width: 640px) {
  .wangshi-panorama-viewer__backdrop {
    filter: none;
    transform: none;
    background-position: center;
    background-size: cover;
  }

  .wangshi-panorama-viewer__veil {
    background:
      linear-gradient(180deg, rgba(14, 11, 9, 0.02), rgba(14, 11, 9, 0.12) 18%, rgba(14, 11, 9, 0.44) 78%, rgba(14, 11, 9, 0.6)),
      linear-gradient(90deg, rgba(14, 11, 9, 0.08), transparent 12%, transparent 88%, rgba(14, 11, 9, 0.1));
  }

  .wangshi-panorama-viewer__topbar {
    align-items: stretch;
    padding: calc(0.65rem + env(safe-area-inset-top, 0px)) 0.65rem 0;
  }

  .wangshi-panorama-viewer__brand {
    display: none;
  }

  .wangshi-panorama-viewer__top-actions {
    width: 100%;
  }

  .wangshi-panorama-viewer__pill,
  .wangshi-panorama-viewer__chip-button,
  .wangshi-panorama-viewer__utility-toggle,
  .wangshi-panorama-viewer__control,
  .wangshi-panorama-viewer__rail-toggle {
    min-height: 2.2rem;
    padding: 0 0.72rem;
    font-size: 0.74rem;
  }

  .wangshi-panorama-viewer__floating {
    top: calc(3.55rem + env(safe-area-inset-top, 0px));
    left: 0.65rem;
    right: auto;
    width: min(16rem, calc(100vw - 1.3rem));
    gap: 0.38rem;
  }

  .wangshi-panorama-viewer__scene-chip,
  .wangshi-panorama-viewer__info-card,
  .wangshi-panorama-viewer__utility,
  .wangshi-panorama-viewer__scene-strip-wrap {
    border-radius: 24px;
  }

  .wangshi-panorama-viewer__scene-chip {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    padding: 0.56rem 0.64rem;
    gap: 0.4rem;
  }

  .wangshi-panorama-viewer__scene-chip-main {
    min-width: 0;
    gap: 0.16rem;
  }

  .wangshi-panorama-viewer__scene-chip p {
    font-size: 0.58rem;
  }

  .wangshi-panorama-viewer__scene-chip h1 {
    font-size: 1rem;
    line-height: 1.1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .wangshi-panorama-viewer__scene-chip-main strong {
    display: none;
  }

  .wangshi-panorama-viewer__scene-chip-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.3rem;
  }

  .wangshi-panorama-viewer__info-card {
    max-width: min(19rem, calc(100vw - 1.3rem));
    padding: 0.7rem 0.78rem;
    max-height: min(24vh, 11rem);
    overflow-y: auto;
  }

  .wangshi-panorama-viewer__utility {
    display: none;
  }

  .wangshi-panorama-viewer__utility-head {
    align-items: center;
  }

  .wangshi-panorama-viewer__utility-head p {
    display: none;
  }

  .wangshi-panorama-viewer__utility-head strong {
    font-size: 0.84rem;
  }

  .wangshi-panorama-viewer__utility-head span {
    flex: 0 0 auto;
    font-size: 0.76rem;
  }

  .wangshi-panorama-viewer__utility-body {
    gap: 0.5rem;
  }

  .wangshi-panorama-viewer__utility-meters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.4rem;
  }

  .wangshi-panorama-viewer__utility-metric {
    gap: 0.22rem;
  }

  .wangshi-panorama-viewer__utility-metric small {
    font-size: 0.58rem;
  }

  .wangshi-panorama-viewer__meter {
    height: 0.28rem;
  }

  .wangshi-panorama-viewer__controls {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.34rem;
  }

  .wangshi-panorama-viewer__hint {
    display: none;
  }

  .wangshi-panorama-viewer__bottom {
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

  .wangshi-panorama-viewer__bottom.is-open {
    bottom: calc(0.55rem + env(safe-area-inset-bottom, 0px));
  }

  .wangshi-panorama-viewer__scene-strip-wrap {
    padding: 0.42rem 0.48rem;
    gap: 0.36rem;
  }

  .wangshi-panorama-viewer__scene-strip-head {
    align-items: center;
    gap: 0.55rem;
  }

  .wangshi-panorama-viewer__scene-strip-meta {
    min-width: 0;
    gap: 0.1rem;
  }

  .wangshi-panorama-viewer__scene-strip-meta strong {
    font-size: 0.82rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .wangshi-panorama-viewer__scene-strip-meta small {
    display: none;
  }

  .wangshi-panorama-viewer__scene-strip {
    grid-auto-columns: minmax(8.4rem, 63vw);
    padding-bottom: 0.16rem;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
  }

  .wangshi-panorama-viewer__scene-strip::-webkit-scrollbar {
    display: none;
  }

  .wangshi-panorama-viewer__scene-card {
    min-height: 5.35rem;
    border-radius: 14px;
    scroll-snap-align: start;
  }

  .wangshi-panorama-viewer__scene-card-image {
    height: 3rem;
  }

  .wangshi-panorama-viewer__scene-card-copy {
    padding: 0.42rem 0.48rem 0.5rem;
  }

  .wangshi-panorama-viewer__scene-card strong {
    font-size: 0.76rem;
  }
}
</style>
