<script setup>
import { computed, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import PanoramaSphereViewer from '../components/PanoramaSphereViewer.vue';
import { gardenDetailsSource } from '../data/gardenDetails';
import { wangshiyuanPanoramaScenesSource } from '../data/wangshiyuanPanoramaTour';
import { resolveLocalized, useLanguage } from '../i18n';

const { language } = useLanguage();
const route = useRoute();

const pageTextSource = {
  viewerLabel: { zh: '网师园全景漫游', en: 'Master of Nets Panorama' },
  backAction: { zh: '返回入口', en: 'Back to Entry' },
  detailAction: { zh: '园林详情', en: 'Garden Detail' },
  statusLabel: { zh: '漫游状态', en: 'Tour Status' },
  statusReady: { zh: '静读中', en: 'Quiet Browse' },
  statusAuto: { zh: '自动巡游中', en: 'Autoplay Running' },
  dragHint: {
    zh: '拖拽旋转全景，滚轮缩放，点击热点查看网师园节点说明。',
    en: 'Drag to rotate, wheel to zoom, and tap hotspots to inspect the scene.',
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
    zh: '先看尺度关系，再贴近细部，最后回到池边看边界与留白，最容易读出网师园的安静。',
    en: 'Read proportions first, move close to details, and end by the pond edge.',
  },
  infoOpenAction: { zh: '展开说明', en: 'Show Info' },
  infoCloseAction: { zh: '收起说明', en: 'Hide Info' },
  railOpenAction: { zh: '展开场景', en: 'Show Scenes' },
  railCloseAction: { zh: '收起场景', en: 'Hide Scenes' },
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

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
      accent: localizedScene.accent || '#7d483f',
      initialPan: localizedScene.initialPan ?? 50,
      initialTilt: localizedScene.initialTilt ?? 0,
      initialFov: localizedScene.initialFov ?? 70,
    };
  }),
);

const activeSceneIndex = ref(0);
const activeHotspotId = ref('');
const autoPlay = ref(false);
const infoOpen = ref(true);
const railOpen = ref(true);
const viewState = ref({ yaw: 0, pitch: 0, fov: 70 });

const activeScene = computed(() => scenes.value[activeSceneIndex.value] || scenes.value[0] || null);
const activeHotspot = computed(
  () =>
    activeScene.value?.hotspots?.find((item) => item.id === activeHotspotId.value)
    || activeScene.value?.hotspots?.[0]
    || null,
);

const progressRatio = computed(() => {
  if (!scenes.value.length) return 0;
  return ((activeSceneIndex.value + 1) / scenes.value.length) * 100;
});

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

const handleViewChange = (nextViewState) => {
  viewState.value = nextViewState;
};

watch(
  activeScene,
  (scene) => {
    if (!scene) {
      activeHotspotId.value = '';
      return;
    }

    activeHotspotId.value = scene.hotspots?.[0]?.id || '';
    viewState.value = {
      yaw: ((scene.initialPan ?? 50) - 50) * 1.8,
      pitch: scene.initialTilt ?? 0,
      fov: scene.initialFov ?? 70,
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
</script>

<template>
  <article v-if="activeScene" class="wangshi-panorama-viewer">
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
      <div class="wangshi-panorama-viewer__brand paper">
        <span>{{ pageText.viewerLabel }}</span>
        <strong>{{ garden.name }}</strong>
      </div>

      <div class="wangshi-panorama-viewer__top-actions">
        <RouterLink to="/wangshi/panorama" class="wangshi-panorama-viewer__pill paper">
          {{ pageText.backAction }}
        </RouterLink>
        <RouterLink to="/wangshi" class="wangshi-panorama-viewer__pill paper">
          {{ pageText.detailAction }}
        </RouterLink>
      </div>
    </header>

    <section class="wangshi-panorama-viewer__floating">
      <div class="wangshi-panorama-viewer__scene-chip paper">
        <div class="wangshi-panorama-viewer__scene-chip-main">
          <p>{{ activeScene.order }}</p>
          <h1>{{ activeScene.title }}</h1>
          <strong>{{ activeHotspot?.label || pageText.noteLabel }}</strong>
        </div>

        <div class="wangshi-panorama-viewer__scene-chip-actions">
          <button type="button" class="wangshi-panorama-viewer__chip-button" @click="toggleInfo">
            {{ infoOpen ? pageText.infoCloseAction : pageText.infoOpenAction }}
          </button>
          <button
            type="button"
            class="wangshi-panorama-viewer__chip-button wangshi-panorama-viewer__chip-button--strong"
            @click="toggleRail"
          >
            {{ railOpen ? pageText.railCloseAction : pageText.railOpenAction }}
          </button>
        </div>
      </div>

      <transition name="wangshi-fade">
        <section v-if="infoOpen" class="wangshi-panorama-viewer__info-card paper">
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

    <aside class="wangshi-panorama-viewer__utility paper">
      <div class="wangshi-panorama-viewer__utility-head">
        <div>
          <p>{{ pageText.statusLabel }}</p>
          <strong>{{ autoPlay ? pageText.statusAuto : pageText.statusReady }}</strong>
        </div>
        <span>{{ progressLabel }}</span>
      </div>

      <div class="wangshi-panorama-viewer__utility-meters">
        <div class="wangshi-panorama-viewer__utility-metric">
          <small>{{ pageText.progressLabel }}</small>
          <div class="wangshi-panorama-viewer__meter">
            <span :style="{ width: `${progressRatio}%` }" />
          </div>
        </div>

        <div class="wangshi-panorama-viewer__utility-metric">
          <small>{{ pageText.angleLabel }} {{ normalizedYaw }}°</small>
          <div class="wangshi-panorama-viewer__meter wangshi-panorama-viewer__meter--subtle">
            <span :style="{ width: angleMeterRatio }" />
          </div>
        </div>
      </div>

      <div class="wangshi-panorama-viewer__controls">
        <button type="button" class="wangshi-panorama-viewer__control" @click="showPreviousScene">
          {{ pageText.previousAction }}
        </button>
        <button type="button" class="wangshi-panorama-viewer__control wangshi-panorama-viewer__control--primary" @click="toggleAutoPlay">
          {{ autoPlay ? pageText.autoplayPause : pageText.autoplayPlay }}
        </button>
        <button type="button" class="wangshi-panorama-viewer__control" @click="showNextScene">
          {{ pageText.nextAction }}
        </button>
      </div>

      <span class="wangshi-panorama-viewer__hint">{{ pageText.dragHint }}</span>
    </aside>

    <footer class="wangshi-panorama-viewer__bottom">
      <section class="wangshi-panorama-viewer__scene-strip-wrap paper">
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
  overflow: hidden;
  color: #221c17;
  background: #13100d;
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
  filter: blur(18px) saturate(0.96);
  transform: scale(1.05);
}

.wangshi-panorama-viewer__veil {
  background:
    linear-gradient(180deg, rgba(19, 16, 13, 0.12), rgba(19, 16, 13, 0.42) 72%, rgba(19, 16, 13, 0.76)),
    linear-gradient(90deg, rgba(19, 16, 13, 0.18), transparent 16%, transparent 84%, rgba(19, 16, 13, 0.22));
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

.wangshi-panorama-viewer__topbar > *,
.wangshi-panorama-viewer__floating > *,
.wangshi-panorama-viewer__utility > *,
.wangshi-panorama-viewer__bottom > * {
  pointer-events: auto;
}

.paper {
  border: 1px solid rgba(255, 248, 240, 0.26);
  background:
    linear-gradient(180deg, rgba(255, 252, 247, 0.84), rgba(244, 237, 229, 0.74)),
    rgba(255, 252, 247, 0.78);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 18px 42px rgba(12, 10, 8, 0.18);
}

.wangshi-panorama-viewer__topbar {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.8rem 0.8rem 0;
  pointer-events: none;
}

.wangshi-panorama-viewer__brand {
  display: grid;
  gap: 0.2rem;
  padding: 0.72rem 0.9rem;
  border-radius: 20px;
}

.wangshi-panorama-viewer__brand span,
.wangshi-panorama-viewer__scene-strip-head p,
.wangshi-panorama-viewer__scene-card span,
.wangshi-panorama-viewer__scene-chip p,
.wangshi-panorama-viewer__info-copy p,
.wangshi-panorama-viewer__utility-head p,
.wangshi-panorama-viewer__utility-metric small {
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(51, 42, 35, 0.7);
}

.wangshi-panorama-viewer__brand strong,
.wangshi-panorama-viewer__scene-chip h1,
.wangshi-panorama-viewer__utility-head strong,
.wangshi-panorama-viewer__utility-head span,
.wangshi-panorama-viewer__scene-strip-meta strong,
.wangshi-panorama-viewer__scene-card strong,
.wangshi-panorama-viewer__info-copy strong {
  color: #201915;
}

.wangshi-panorama-viewer__top-actions {
  display: flex;
  gap: 0.75rem;
}

.wangshi-panorama-viewer__pill,
.wangshi-panorama-viewer__control,
.wangshi-panorama-viewer__chip-button,
.wangshi-panorama-viewer__rail-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.8rem;
  padding: 0 1rem;
  border-radius: 999px;
  color: #201915;
  text-decoration: none;
}

.wangshi-panorama-viewer__floating {
  position: absolute;
  top: 5rem;
  left: 1rem;
  display: grid;
  gap: 0.75rem;
  width: min(380px, calc(100vw - 2rem));
}

.wangshi-panorama-viewer__scene-chip,
.wangshi-panorama-viewer__info-card,
.wangshi-panorama-viewer__scene-strip-wrap {
  border-radius: 24px;
}

.wangshi-panorama-viewer__scene-chip {
  display: grid;
  gap: 0.9rem;
  padding: 0.95rem 1rem;
}

.wangshi-panorama-viewer__scene-chip-main {
  display: grid;
  gap: 0.25rem;
}

.wangshi-panorama-viewer__scene-chip h1 {
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(2rem, 4vw, 2.7rem);
  line-height: 1;
}

.wangshi-panorama-viewer__scene-chip-main strong {
  display: inline-flex;
  width: fit-content;
  padding: 0.4rem 0.7rem;
  border-radius: 999px;
  background: rgba(159, 63, 52, 0.1);
  font-size: 0.82rem;
  color: #7d483f;
}

.wangshi-panorama-viewer__scene-chip-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.wangshi-panorama-viewer__chip-button,
.wangshi-panorama-viewer__rail-toggle {
  border: 1px solid rgba(32, 25, 21, 0.1);
  background: rgba(255, 255, 255, 0.48);
  cursor: pointer;
}

.wangshi-panorama-viewer__chip-button--strong {
  background: linear-gradient(135deg, rgba(132, 59, 48, 0.98), rgba(172, 103, 86, 0.9));
  border-color: rgba(132, 59, 48, 0.18);
  color: #fffaf5;
}

.wangshi-panorama-viewer__info-card {
  display: grid;
  gap: 0.9rem;
  padding: 0.95rem 1rem;
}

.wangshi-panorama-viewer__info-copy {
  display: grid;
  gap: 0.35rem;
}

.wangshi-panorama-viewer__info-copy span,
.wangshi-panorama-viewer__hint,
.wangshi-panorama-viewer__scene-strip-meta small {
  line-height: 1.72;
  color: rgba(42, 34, 29, 0.82);
}

.wangshi-panorama-viewer__info-copy--subtle {
  padding-top: 0.1rem;
  border-top: 1px solid rgba(32, 25, 21, 0.08);
}

.wangshi-panorama-viewer__utility {
  position: absolute;
  top: 5rem;
  right: 1rem;
  display: grid;
  gap: 0.9rem;
  width: min(286px, calc(100vw - 2rem));
  padding: 0.95rem 1rem;
}

.wangshi-panorama-viewer__utility-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: start;
}

.wangshi-panorama-viewer__utility-meters {
  display: grid;
  gap: 0.6rem;
}

.wangshi-panorama-viewer__utility-metric {
  display: grid;
  gap: 0.35rem;
}

.wangshi-panorama-viewer__controls {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
}

.wangshi-panorama-viewer__control {
  border: 1px solid rgba(32, 25, 21, 0.1);
  background: rgba(255, 255, 255, 0.54);
  color: #201915;
  cursor: pointer;
}

.wangshi-panorama-viewer__control--primary {
  background: linear-gradient(135deg, rgba(132, 59, 48, 0.98), rgba(172, 103, 86, 0.9));
  border-color: rgba(132, 59, 48, 0.18);
  color: #fffaf5;
}

.wangshi-panorama-viewer__meter {
  position: relative;
  height: 0.42rem;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(32, 25, 21, 0.12);
}

.wangshi-panorama-viewer__meter span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(125, 72, 63, 0.98), rgba(218, 184, 168, 0.94));
}

.wangshi-panorama-viewer__meter--subtle span {
  background: linear-gradient(90deg, rgba(92, 117, 95, 0.98), rgba(209, 230, 210, 0.94));
}

.wangshi-panorama-viewer__bottom {
  position: absolute;
  left: 50%;
  bottom: 1rem;
  width: min(1080px, calc(100vw - 2rem));
  transform: translateX(-50%);
}

.wangshi-panorama-viewer__scene-strip-wrap {
  display: grid;
  gap: 0.75rem;
  padding: 0.85rem 0.95rem;
}

.wangshi-panorama-viewer__scene-strip-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
}

.wangshi-panorama-viewer__scene-strip-meta {
  display: grid;
  gap: 0.2rem;
  max-width: 34rem;
}

.wangshi-panorama-viewer__scene-strip {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(154px, 1fr);
  gap: 0.55rem;
  overflow-x: auto;
  padding-bottom: 0.1rem;
}

.wangshi-panorama-viewer__scene-card {
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: 7.9rem;
  padding: 0;
  border-radius: 18px;
  border: 1px solid rgba(32, 25, 21, 0.1);
  background:
    linear-gradient(160deg, color-mix(in srgb, var(--scene-accent) 18%, rgba(255, 255, 255, 0.72)), rgba(255, 252, 247, 0.92)),
    rgba(255, 252, 247, 0.9);
  color: #201915;
  text-align: left;
  cursor: pointer;
}

.wangshi-panorama-viewer__scene-card-image {
  display: block;
  width: 100%;
  height: 4.6rem;
  object-fit: cover;
}

.wangshi-panorama-viewer__scene-card-copy {
  display: grid;
  gap: 0.28rem;
  padding: 0.62rem 0.72rem 0.72rem;
}

.wangshi-panorama-viewer__scene-card.is-active {
  box-shadow: 0 16px 34px rgba(12, 10, 8, 0.16);
  border-color: rgba(125, 72, 63, 0.22);
}

.wangshi-panorama-viewer__hint {
  font-size: 0.86rem;
}

.wangshi-fade-enter-active,
.wangshi-fade-leave-active {
  transition: opacity 0.24s ease, transform 0.24s ease;
}

.wangshi-fade-enter-from,
.wangshi-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

@media (max-width: 1180px) {
  .wangshi-panorama-viewer__bottom {
    width: calc(100vw - 1.4rem);
  }

  .wangshi-panorama-viewer__scene-strip-meta {
    max-width: 24rem;
  }
}

@media (max-width: 960px) {
  .wangshi-panorama-viewer__floating,
  .wangshi-panorama-viewer__utility {
    position: static;
    width: auto;
    margin: 0 1rem 0.8rem;
  }

  .wangshi-panorama-viewer__floating {
    padding-top: 4.6rem;
  }

  .wangshi-panorama-viewer__bottom {
    position: static;
    transform: none;
    width: auto;
    margin: 0 1rem 1rem;
    padding-bottom: 0.1rem;
    left: auto;
  }
}

@media (max-width: 820px) {
  .wangshi-panorama-viewer__topbar {
    flex-direction: column;
    gap: 0.65rem;
  }

  .wangshi-panorama-viewer__top-actions {
    width: 100%;
    justify-content: stretch;
  }
}

@media (max-width: 640px) {
  .wangshi-panorama-viewer__topbar {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }

  .wangshi-panorama-viewer__floating,
  .wangshi-panorama-viewer__utility,
  .wangshi-panorama-viewer__bottom {
    margin-left: 0.75rem;
    margin-right: 0.75rem;
  }

  .wangshi-panorama-viewer__floating {
    padding-top: 4.4rem;
  }

  .wangshi-panorama-viewer__scene-chip h1 {
    font-size: clamp(1.7rem, 10vw, 2.3rem);
  }

  .wangshi-panorama-viewer__controls {
    grid-template-columns: 1fr;
  }

  .wangshi-panorama-viewer__top-actions,
  .wangshi-panorama-viewer__scene-chip-actions,
  .wangshi-panorama-viewer__scene-strip-head {
    flex-direction: column;
    align-items: stretch;
  }

  .wangshi-panorama-viewer__pill,
  .wangshi-panorama-viewer__control,
  .wangshi-panorama-viewer__chip-button,
  .wangshi-panorama-viewer__rail-toggle {
    width: 100%;
  }

  .wangshi-panorama-viewer__scene-strip-meta {
    max-width: none;
  }
}
</style>
