<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import PanoramaSphereViewer from '../components/PanoramaSphereViewer.vue';
import { gardenDetailsSource } from '../data/gardenDetails';
import { zhuozhengPanoramaScenesSource } from '../data/zhuozhengPanoramaTour';
import { resolveLocalized, useLanguage } from '../i18n';
import { derivePanoramaInitialView, panoramaPanToYaw } from '../shared/panoramaView';

const { language } = useLanguage();
const route = useRoute();
const panoramaMusicSrc = new URL('../../music/02. エス.mp3', import.meta.url).href;
const panoramaMusicVolume = 0.25;

const pageTextSource = {
  viewerLabel: { zh: '拙政园全景漫游', en: 'Humble Administrator\'s Garden Panorama' },
  backAction: { zh: '返回入口', en: 'Back to Entry' },
  detailAction: { zh: '园林详情', en: 'Garden Detail' },
  statusLabel: { zh: '漫游状态', en: 'Tour Status' },
  statusReady: { zh: '自由浏览', en: 'Free Browse' },
  statusAuto: { zh: '自动巡游中', en: 'Autoplay Running' },
  dragHint: {
    zh: '拖拽旋转全景，缩放看水院开阔，再点热点读节点说明。',
    en: 'Drag to rotate, zoom for the open waterscape, and tap hotspots for notes.',
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
    zh: '先把主水面与厅堂关系看清，再沿游线慢慢往桥、亭和花窗处切近。',
    en: 'Read the main water court first, then move toward bridges, pavilions, and framed windows.',
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
const garden = computed(() => resolveLocalized(gardenDetailsSource.zhuozhengyuan, language.value));
const scenes = computed(() =>
  zhuozhengPanoramaScenesSource.map((scene, index) => {
    const localizedScene = resolveLocalized(scene, language.value);
    return {
      ...localizedScene,
      id: localizedScene.id || `scene-${index + 1}`,
      order: localizedScene.order || String(index + 1).padStart(2, '0'),
      hotspots: localizedScene.hotspots || [],
      accent: localizedScene.accent || '#b15f45',
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
  <article v-if="activeScene" class="zhuozheng-panorama-viewer">
    <audio
      ref="backgroundAudioRef"
      :src="panoramaMusicSrc"
      autoplay
      loop
      preload="auto"
      playsinline
    />
    <div class="zhuozheng-panorama-viewer__backdrop" :style="activeSceneBackdropStyle" />
    <div class="zhuozheng-panorama-viewer__veil" />

    <div class="zhuozheng-panorama-viewer__viewport">
      <PanoramaSphereViewer
        :scene="activeScene"
        :active-hotspot-id="activeHotspotId"
        :auto-play="autoPlay"
        @hotspot-select="setActiveHotspot"
        @view-change="handleViewChange"
      />
    </div>

    <header class="zhuozheng-panorama-viewer__topbar">
      <div class="zhuozheng-panorama-viewer__brand glass">
        <span>{{ pageText.viewerLabel }}</span>
        <strong>{{ garden.name }}</strong>
      </div>
      <div class="zhuozheng-panorama-viewer__top-actions">
        <RouterLink to="/zhuozheng/panorama" class="zhuozheng-panorama-viewer__pill glass">{{ pageText.backAction }}</RouterLink>
        <RouterLink to="/zhuozheng" class="zhuozheng-panorama-viewer__pill glass">{{ pageText.detailAction }}</RouterLink>
      </div>
    </header>

    <section class="zhuozheng-panorama-viewer__floating">
      <div class="zhuozheng-panorama-viewer__scene-chip glass">
        <div class="zhuozheng-panorama-viewer__scene-chip-main">
          <p>{{ activeScene.order }}</p>
          <h1>{{ activeScene.title }}</h1>
          <strong>{{ activeHotspot?.label || pageText.noteLabel }}</strong>
        </div>
        <div class="zhuozheng-panorama-viewer__scene-chip-actions">
          <button type="button" class="zhuozheng-panorama-viewer__chip-button" @click="toggleInfo">
            {{ infoOpen ? pageText.infoCloseAction : pageText.infoOpenAction }}
          </button>
          <button type="button" class="zhuozheng-panorama-viewer__chip-button zhuozheng-panorama-viewer__chip-button--strong" @click="toggleRail">
            {{ railOpen ? pageText.railCloseAction : pageText.railOpenAction }}
          </button>
        </div>
      </div>

      <transition name="zhuozheng-fade">
        <section v-if="infoOpen" class="zhuozheng-panorama-viewer__info-card glass">
          <div class="zhuozheng-panorama-viewer__info-copy">
            <p>{{ pageText.noteLabel }}</p>
            <strong>{{ activeNoteTitle }}</strong>
            <span>{{ activeNoteDescription }}</span>
          </div>
          <div class="zhuozheng-panorama-viewer__info-copy zhuozheng-panorama-viewer__info-copy--subtle">
            <p>{{ pageText.readingLabel }}</p>
            <span>{{ pageText.readingText }}</span>
          </div>
        </section>
      </transition>
    </section>

    <aside class="zhuozheng-panorama-viewer__utility glass">
      <div class="zhuozheng-panorama-viewer__utility-head">
        <div>
          <p>{{ pageText.statusLabel }}</p>
          <strong>{{ autoPlay ? pageText.statusAuto : pageText.statusReady }}</strong>
        </div>
        <span>{{ progressLabel }}</span>
      </div>
      <button type="button" class="zhuozheng-panorama-viewer__utility-toggle" @click="toggleControls">
        {{ controlsOpen ? pageText.controlsCloseAction : pageText.controlsOpenAction }}
      </button>

      <transition name="zhuozheng-fade">
        <div v-if="controlsOpen" class="zhuozheng-panorama-viewer__utility-body">
          <div class="zhuozheng-panorama-viewer__utility-meters">
            <div class="zhuozheng-panorama-viewer__utility-metric">
              <small>{{ pageText.progressLabel }}</small>
              <div class="zhuozheng-panorama-viewer__meter"><span :style="{ width: `${progressRatio}%` }" /></div>
            </div>
            <div class="zhuozheng-panorama-viewer__utility-metric">
              <small>{{ pageText.angleLabel }} {{ normalizedYaw }}°</small>
              <div class="zhuozheng-panorama-viewer__meter zhuozheng-panorama-viewer__meter--subtle"><span :style="{ width: angleMeterRatio }" /></div>
            </div>
          </div>

          <div class="zhuozheng-panorama-viewer__controls">
            <button type="button" class="zhuozheng-panorama-viewer__control" @click="showPreviousScene">{{ pageText.previousAction }}</button>
            <button type="button" class="zhuozheng-panorama-viewer__control zhuozheng-panorama-viewer__control--primary" @click="toggleAutoPlay">
              {{ autoPlay ? pageText.autoplayPause : pageText.autoplayPlay }}
            </button>
            <button type="button" class="zhuozheng-panorama-viewer__control" @click="showNextScene">{{ pageText.nextAction }}</button>
          </div>

          <span class="zhuozheng-panorama-viewer__hint">{{ pageText.dragHint }}</span>
        </div>
      </transition>
    </aside>

    <footer class="zhuozheng-panorama-viewer__bottom" :class="{ 'is-open': railOpen }">
      <section class="zhuozheng-panorama-viewer__scene-strip-wrap glass">
        <div class="zhuozheng-panorama-viewer__scene-strip-head">
          <div class="zhuozheng-panorama-viewer__scene-strip-meta">
            <p>{{ pageText.sceneListLabel }}</p>
            <strong>{{ activeNoteTitle }}</strong>
            <small>{{ activeNoteDescription }}</small>
          </div>
          <button type="button" class="zhuozheng-panorama-viewer__rail-toggle" @click="toggleRail">
            {{ railOpen ? pageText.railCloseAction : pageText.railOpenAction }}
          </button>
        </div>

        <transition name="zhuozheng-fade">
          <div v-if="railOpen" class="zhuozheng-panorama-viewer__scene-strip">
            <button
              v-for="(scene, index) in scenes"
              :key="scene.id"
              type="button"
              :class="['zhuozheng-panorama-viewer__scene-card', { 'is-active': index === activeSceneIndex }]"
              :style="{ '--scene-accent': scene.accent }"
              @click="setActiveScene(index)"
            >
              <img :src="scene.thumbnail || scene.image" :alt="scene.title" class="zhuozheng-panorama-viewer__scene-card-image" loading="lazy" />
              <div class="zhuozheng-panorama-viewer__scene-card-copy">
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
.zhuozheng-panorama-viewer {
  position: relative;
  min-height: 100vh;
  min-height: 100svh;
  overflow: hidden;
  color: #fff4ee;
  background: #110b09;
}

.zhuozheng-panorama-viewer__backdrop,
.zhuozheng-panorama-viewer__veil,
.zhuozheng-panorama-viewer__viewport {
  position: absolute;
  inset: 0;
}

.zhuozheng-panorama-viewer__backdrop {
  background-position: center;
  background-size: cover;
  filter: blur(18px) saturate(1.02);
  transform: scale(1.05);
}

.zhuozheng-panorama-viewer__veil {
  background:
    linear-gradient(180deg, rgba(17, 11, 9, 0.08), rgba(17, 11, 9, 0.22) 20%, rgba(17, 11, 9, 0.72)),
    linear-gradient(90deg, rgba(17, 11, 9, 0.18), transparent 18%, transparent 82%, rgba(17, 11, 9, 0.24));
}

.zhuozheng-panorama-viewer__viewport {
  z-index: 0;
}

.zhuozheng-panorama-viewer__topbar,
.zhuozheng-panorama-viewer__floating,
.zhuozheng-panorama-viewer__utility,
.zhuozheng-panorama-viewer__bottom {
  position: relative;
  z-index: 2;
}

.glass {
  border: 1px solid rgba(255, 235, 224, 0.14);
  background:
    linear-gradient(180deg, rgba(39, 24, 19, 0.42), rgba(17, 12, 10, 0.26)),
    rgba(17, 12, 10, 0.24);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.18);
}

.zhuozheng-panorama-viewer__topbar {
  position: absolute;
  inset: 0 0 auto;
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  padding: calc(0.75rem + env(safe-area-inset-top, 0px)) 0.75rem 0;
}

.zhuozheng-panorama-viewer__brand,
.zhuozheng-panorama-viewer__scene-chip,
.zhuozheng-panorama-viewer__info-card,
.zhuozheng-panorama-viewer__utility,
.zhuozheng-panorama-viewer__scene-strip-wrap {
  border-radius: 22px;
}

.zhuozheng-panorama-viewer__brand {
  display: grid;
  gap: 0.16rem;
  padding: 0.62rem 0.8rem;
}

.zhuozheng-panorama-viewer__brand span,
.zhuozheng-panorama-viewer__scene-chip p,
.zhuozheng-panorama-viewer__info-copy p,
.zhuozheng-panorama-viewer__utility-head p,
.zhuozheng-panorama-viewer__utility-metric small,
.zhuozheng-panorama-viewer__scene-strip-head p,
.zhuozheng-panorama-viewer__scene-card span {
  font-size: 0.68rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255, 235, 224, 0.72);
}

.zhuozheng-panorama-viewer__brand strong,
.zhuozheng-panorama-viewer__utility-head strong,
.zhuozheng-panorama-viewer__utility-head span,
.zhuozheng-panorama-viewer__info-copy strong,
.zhuozheng-panorama-viewer__scene-strip-meta strong,
.zhuozheng-panorama-viewer__scene-card strong {
  color: #fff7f1;
}

.zhuozheng-panorama-viewer__top-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
  width: min(320px, 100%);
}

.zhuozheng-panorama-viewer__pill,
.zhuozheng-panorama-viewer__chip-button,
.zhuozheng-panorama-viewer__utility-toggle,
.zhuozheng-panorama-viewer__control,
.zhuozheng-panorama-viewer__rail-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.35rem;
  padding: 0 0.88rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 235, 224, 0.12);
  background: rgba(255, 249, 244, 0.06);
  color: #fff7f1;
  text-decoration: none;
}

.zhuozheng-panorama-viewer__floating {
  position: absolute;
  top: calc(4.5rem + env(safe-area-inset-top, 0px));
  left: 0.75rem;
  width: min(320px, calc(100vw - 1.5rem));
  display: grid;
  gap: 0.55rem;
}

.zhuozheng-panorama-viewer__scene-chip {
  display: grid;
  gap: 0.72rem;
  padding: 0.82rem 0.88rem;
}

.zhuozheng-panorama-viewer__scene-chip-main {
  display: grid;
  gap: 0.28rem;
}

.zhuozheng-panorama-viewer__scene-chip h1 {
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(1.45rem, 8vw, 2rem);
  line-height: 1.04;
  color: #fff7f1;
}

.zhuozheng-panorama-viewer__scene-chip-main strong {
  display: inline-flex;
  width: fit-content;
  padding: 0.34rem 0.56rem;
  border-radius: 999px;
  background: rgba(199, 114, 88, 0.18);
  color: #ffece4;
  font-size: 0.76rem;
}

.zhuozheng-panorama-viewer__scene-chip-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

.zhuozheng-panorama-viewer__chip-button--strong,
.zhuozheng-panorama-viewer__control--primary {
  background: linear-gradient(135deg, rgba(163, 86, 61, 0.96), rgba(210, 143, 114, 0.9));
  border-color: rgba(255, 221, 209, 0.18);
}

.zhuozheng-panorama-viewer__info-card {
  display: grid;
  gap: 0.78rem;
  padding: 0.82rem 0.88rem;
}

.zhuozheng-panorama-viewer__info-copy {
  display: grid;
  gap: 0.34rem;
}

.zhuozheng-panorama-viewer__info-copy span,
.zhuozheng-panorama-viewer__hint,
.zhuozheng-panorama-viewer__scene-strip-meta small {
  line-height: 1.5;
  color: rgba(255, 243, 236, 0.82);
}

.zhuozheng-panorama-viewer__info-copy--subtle {
  padding-top: 0.14rem;
  border-top: 1px solid rgba(255, 235, 224, 0.08);
}

.zhuozheng-panorama-viewer__utility {
  position: absolute;
  left: 0.75rem;
  right: 0.75rem;
  bottom: calc(0.75rem + env(safe-area-inset-bottom, 0px));
  display: grid;
  gap: 0.62rem;
  padding: 0.82rem 0.88rem;
}

.zhuozheng-panorama-viewer__utility-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: start;
}

.zhuozheng-panorama-viewer__utility-body {
  display: grid;
  gap: 0.7rem;
}

.zhuozheng-panorama-viewer__utility-meters {
  display: grid;
  gap: 0.52rem;
}

.zhuozheng-panorama-viewer__utility-metric {
  display: grid;
  gap: 0.3rem;
}

.zhuozheng-panorama-viewer__meter {
  position: relative;
  height: 0.36rem;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 235, 224, 0.12);
}

.zhuozheng-panorama-viewer__meter span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(184, 102, 74, 0.98), rgba(248, 216, 203, 0.92));
}

.zhuozheng-panorama-viewer__meter--subtle span {
  background: linear-gradient(90deg, rgba(104, 145, 128, 0.98), rgba(210, 236, 228, 0.9));
}

.zhuozheng-panorama-viewer__controls {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
}

.zhuozheng-panorama-viewer__hint {
  font-size: 0.8rem;
}

.zhuozheng-panorama-viewer__bottom {
  position: absolute;
  left: 0.75rem;
  right: 0.75rem;
  bottom: calc(5.4rem + env(safe-area-inset-bottom, 0px));
}

.zhuozheng-panorama-viewer__scene-strip-wrap {
  display: grid;
  gap: 0.6rem;
  padding: 0.74rem 0.8rem;
}

.zhuozheng-panorama-viewer__scene-strip-head {
  display: flex;
  justify-content: space-between;
  gap: 0.7rem;
  align-items: center;
}

.zhuozheng-panorama-viewer__scene-strip-meta {
  display: grid;
  gap: 0.18rem;
}

.zhuozheng-panorama-viewer__scene-strip-meta small {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.zhuozheng-panorama-viewer__scene-strip {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(120px, 1fr);
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.08rem;
}

.zhuozheng-panorama-viewer__scene-card {
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: 6.5rem;
  padding: 0;
  border-radius: 16px;
  border: 1px solid rgba(255, 235, 224, 0.12);
  background:
    linear-gradient(160deg, color-mix(in srgb, var(--scene-accent) 22%, rgba(255, 255, 255, 0.06)), rgba(17, 12, 10, 0.74)),
    rgba(17, 12, 10, 0.3);
  color: #fff7f1;
  text-align: left;
}

.zhuozheng-panorama-viewer__scene-card-image {
  display: block;
  width: 100%;
  height: 3.25rem;
  object-fit: cover;
}

.zhuozheng-panorama-viewer__scene-card-copy {
  display: grid;
  gap: 0.24rem;
  padding: 0.48rem 0.55rem 0.58rem;
}

.zhuozheng-panorama-viewer__scene-card strong {
  font-size: 0.8rem;
}

.zhuozheng-panorama-viewer__scene-card.is-active {
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.22);
}

.zhuozheng-fade-enter-active,
.zhuozheng-fade-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.zhuozheng-fade-enter-from,
.zhuozheng-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

@media (min-width: 641px) {
  .zhuozheng-panorama-viewer__floating {
    top: 5.2rem;
    left: 1rem;
    width: min(380px, calc(100vw - 2rem));
  }

  .zhuozheng-panorama-viewer__topbar {
    padding: 0.8rem 0.8rem 0;
  }

  .zhuozheng-panorama-viewer__top-actions {
    width: auto;
    display: flex;
  }

  .zhuozheng-panorama-viewer__pill,
  .zhuozheng-panorama-viewer__chip-button,
  .zhuozheng-panorama-viewer__utility-toggle,
  .zhuozheng-panorama-viewer__control,
  .zhuozheng-panorama-viewer__rail-toggle {
    min-height: 2.6rem;
  }

  .zhuozheng-panorama-viewer__scene-chip h1 {
    font-size: clamp(1.8rem, 4vw, 2.6rem);
  }

  .zhuozheng-panorama-viewer__utility {
    left: auto;
    right: 1rem;
    top: 5rem;
    bottom: auto;
    width: min(300px, calc(100vw - 2rem));
  }

  .zhuozheng-panorama-viewer__controls {
    grid-template-columns: 1fr;
  }

  .zhuozheng-panorama-viewer__utility-toggle {
    display: none;
  }

  .zhuozheng-panorama-viewer__utility-body {
    display: grid !important;
  }

  .zhuozheng-panorama-viewer__bottom {
    left: 50%;
    right: auto;
    bottom: 1rem;
    width: min(1080px, calc(100vw - 2rem));
    transform: translateX(-50%);
  }

  .zhuozheng-panorama-viewer__scene-card {
    min-height: 7.6rem;
  }

  .zhuozheng-panorama-viewer__scene-card-image {
    height: 4.4rem;
  }

  .zhuozheng-panorama-viewer__scene-card strong {
    font-size: 0.92rem;
  }
}

@media (max-width: 640px) {
  .zhuozheng-panorama-viewer__backdrop {
    filter: none;
    transform: none;
    background-position: center;
    background-size: cover;
  }

  .zhuozheng-panorama-viewer__veil {
    background:
      linear-gradient(180deg, rgba(17, 11, 9, 0.02), rgba(17, 11, 9, 0.12) 18%, rgba(17, 11, 9, 0.46) 78%, rgba(17, 11, 9, 0.62)),
      linear-gradient(90deg, rgba(17, 11, 9, 0.08), transparent 12%, transparent 88%, rgba(17, 11, 9, 0.1));
  }

  .zhuozheng-panorama-viewer__topbar {
    align-items: stretch;
    padding: calc(0.65rem + env(safe-area-inset-top, 0px)) 0.65rem 0;
  }

  .zhuozheng-panorama-viewer__brand {
    display: none;
  }

  .zhuozheng-panorama-viewer__top-actions {
    width: 100%;
  }

  .zhuozheng-panorama-viewer__pill,
  .zhuozheng-panorama-viewer__chip-button,
  .zhuozheng-panorama-viewer__utility-toggle,
  .zhuozheng-panorama-viewer__control,
  .zhuozheng-panorama-viewer__rail-toggle {
    min-height: 2.2rem;
    padding: 0 0.72rem;
    font-size: 0.74rem;
  }

  .zhuozheng-panorama-viewer__floating {
    top: calc(3.55rem + env(safe-area-inset-top, 0px));
    left: 0.65rem;
    right: auto;
    width: min(16rem, calc(100vw - 1.3rem));
    gap: 0.38rem;
  }

  .zhuozheng-panorama-viewer__scene-chip,
  .zhuozheng-panorama-viewer__info-card,
  .zhuozheng-panorama-viewer__utility,
  .zhuozheng-panorama-viewer__scene-strip-wrap {
    border-radius: 24px;
  }

  .zhuozheng-panorama-viewer__scene-chip {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    padding: 0.56rem 0.64rem;
    gap: 0.4rem;
  }

  .zhuozheng-panorama-viewer__scene-chip-main {
    min-width: 0;
    gap: 0.16rem;
  }

  .zhuozheng-panorama-viewer__scene-chip p {
    font-size: 0.58rem;
  }

  .zhuozheng-panorama-viewer__scene-chip h1 {
    font-size: 1rem;
    line-height: 1.1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .zhuozheng-panorama-viewer__scene-chip-main strong {
    display: none;
  }

  .zhuozheng-panorama-viewer__scene-chip-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.3rem;
  }

  .zhuozheng-panorama-viewer__info-card {
    max-width: min(19rem, calc(100vw - 1.3rem));
    padding: 0.7rem 0.78rem;
    max-height: min(24vh, 11rem);
    overflow-y: auto;
  }

  .zhuozheng-panorama-viewer__utility {
    display: none;
  }

  .zhuozheng-panorama-viewer__utility-head {
    align-items: center;
  }

  .zhuozheng-panorama-viewer__utility-head p {
    display: none;
  }

  .zhuozheng-panorama-viewer__utility-head strong {
    font-size: 0.84rem;
  }

  .zhuozheng-panorama-viewer__utility-head span {
    flex: 0 0 auto;
    font-size: 0.76rem;
  }

  .zhuozheng-panorama-viewer__utility-body {
    gap: 0.5rem;
  }

  .zhuozheng-panorama-viewer__utility-meters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.4rem;
  }

  .zhuozheng-panorama-viewer__utility-metric {
    gap: 0.22rem;
  }

  .zhuozheng-panorama-viewer__utility-metric small {
    font-size: 0.58rem;
  }

  .zhuozheng-panorama-viewer__meter {
    height: 0.28rem;
  }

  .zhuozheng-panorama-viewer__controls {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.34rem;
  }

  .zhuozheng-panorama-viewer__hint {
    display: none;
  }

  .zhuozheng-panorama-viewer__bottom {
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

  .zhuozheng-panorama-viewer__bottom.is-open {
    bottom: calc(0.55rem + env(safe-area-inset-bottom, 0px));
  }

  .zhuozheng-panorama-viewer__scene-strip-wrap {
    padding: 0.42rem 0.48rem;
    gap: 0.36rem;
  }

  .zhuozheng-panorama-viewer__scene-strip-head {
    align-items: center;
    gap: 0.55rem;
  }

  .zhuozheng-panorama-viewer__scene-strip-meta {
    min-width: 0;
    gap: 0.1rem;
  }

  .zhuozheng-panorama-viewer__scene-strip-meta strong {
    font-size: 0.82rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .zhuozheng-panorama-viewer__scene-strip-meta small {
    display: none;
  }

  .zhuozheng-panorama-viewer__scene-strip {
    grid-auto-columns: minmax(8.4rem, 63vw);
    padding-bottom: 0.16rem;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
  }

  .zhuozheng-panorama-viewer__scene-strip::-webkit-scrollbar {
    display: none;
  }

  .zhuozheng-panorama-viewer__scene-card {
    min-height: 5.35rem;
    border-radius: 14px;
    scroll-snap-align: start;
  }

  .zhuozheng-panorama-viewer__scene-card-image {
    height: 3rem;
  }

  .zhuozheng-panorama-viewer__scene-card-copy {
    padding: 0.42rem 0.48rem 0.5rem;
  }

  .zhuozheng-panorama-viewer__scene-card strong {
    font-size: 0.76rem;
  }
}
</style>
