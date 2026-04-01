<script setup>
import { computed, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import PanoramaSphereViewer from '../components/PanoramaSphereViewer.vue';
import { gardenDetailsSource } from '../data/gardenDetails';
import { liuyuanPanoramaScenesSource } from '../data/liuyuanPanoramaTour';
import { resolveLocalized, useLanguage } from '../i18n';

const { language } = useLanguage();
const route = useRoute();

const pageTextSource = {
  viewerLabel: {
    zh: '留园全景漫游',
    en: 'Lingering Garden Panorama',
  },
  backAction: {
    zh: '返回入口',
    en: 'Back to Entry',
  },
  detailAction: {
    zh: '园林详情',
    en: 'Garden Detail',
  },
  statusLabel: {
    zh: '漫游状态',
    en: 'Tour Status',
  },
  statusReady: {
    zh: '自由浏览',
    en: 'Free Browse',
  },
  statusAuto: {
    zh: '自动巡游中',
    en: 'Autoplay Running',
  },
  dragHint: {
    zh: '拖拽旋转全景，滚轮缩放，点击热点查看留园节点说明。',
    en: 'Drag to rotate, wheel to zoom, and tap hotspots to inspect the scene.',
  },
  previousAction: {
    zh: '上一景',
    en: 'Previous',
  },
  nextAction: {
    zh: '下一景',
    en: 'Next',
  },
  autoplayPlay: {
    zh: '自动巡游',
    en: 'Autoplay',
  },
  autoplayPause: {
    zh: '暂停巡游',
    en: 'Pause',
  },
  progressLabel: {
    zh: '当前进度',
    en: 'Progress',
  },
  angleLabel: {
    zh: '视角方向',
    en: 'Viewing Angle',
  },
  noteLabel: {
    zh: '当前说明',
    en: 'Current Note',
  },
  sceneListLabel: {
    zh: '场景切换',
    en: 'Scene Switcher',
  },
  readingLabel: {
    zh: '阅读方式',
    en: 'Reading Tip',
  },
  readingText: {
    zh: '先顺着游线走一遍，再回头看门洞、花窗和山石怎样反复重组同一处景。',
    en: 'Walk the route once, then look back to see how frames and rockery recompose the scene.',
  },
  infoOpenAction: {
    zh: '展开说明',
    en: 'Show Info',
  },
  infoCloseAction: {
    zh: '收起说明',
    en: 'Hide Info',
  },
  railOpenAction: {
    zh: '展开场景',
    en: 'Show Scenes',
  },
  railCloseAction: {
    zh: '收起场景',
    en: 'Hide Scenes',
  },
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const pageText = computed(() => resolveLocalized(pageTextSource, language.value));
const garden = computed(() => resolveLocalized(gardenDetailsSource.liuyuan, language.value));
const scenes = computed(() => {
  return liuyuanPanoramaScenesSource.map((scene, index) => {
    const localizedScene = resolveLocalized(scene, language.value);

    return {
      ...localizedScene,
      id: localizedScene.id || `scene-${index + 1}`,
      order: localizedScene.order || String(index + 1).padStart(2, '0'),
      hotspots: localizedScene.hotspots || [],
      accent: localizedScene.accent || '#8c5b33',
      initialPan: localizedScene.initialPan ?? 50,
      initialTilt: localizedScene.initialTilt ?? 0,
      initialFov: localizedScene.initialFov ?? 70,
    };
  });
});

const activeSceneIndex = ref(0);
const activeHotspotId = ref('');
const autoPlay = ref(false);
const infoOpen = ref(false);
const railOpen = ref(false);
const viewState = ref({
  yaw: 0,
  pitch: 0,
  fov: 70,
});

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
  if (index < 0 || index >= scenes.value.length) {
    return;
  }

  activeSceneIndex.value = index;
};

const syncSceneFromRoute = (sceneId) => {
  if (!sceneId || !scenes.value.length) {
    return;
  }

  const nextIndex = scenes.value.findIndex((scene) => scene.id === sceneId);
  if (nextIndex >= 0) {
    activeSceneIndex.value = nextIndex;
  }
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
    if (!nextScenes.length) {
      return;
    }

    syncSceneFromRoute(typeof nextSceneId === 'string' ? nextSceneId : '');
  },
  { immediate: true },
);
</script>

<template>
  <article v-if="activeScene" class="liuyuan-panorama-viewer">
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
      <div class="liuyuan-panorama-viewer__brand shell">
        <span>{{ pageText.viewerLabel }}</span>
        <strong>{{ garden.name }}</strong>
      </div>

      <div class="liuyuan-panorama-viewer__top-actions">
        <RouterLink to="/liu/panorama" class="liuyuan-panorama-viewer__pill shell">
          {{ pageText.backAction }}
        </RouterLink>
        <RouterLink to="/liu" class="liuyuan-panorama-viewer__pill shell">
          {{ pageText.detailAction }}
        </RouterLink>
      </div>
    </header>

    <section class="liuyuan-panorama-viewer__floating">
      <div class="liuyuan-panorama-viewer__scene-chip shell">
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
        <section v-if="infoOpen" class="liuyuan-panorama-viewer__info-card shell">
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

    <aside class="liuyuan-panorama-viewer__utility shell">
      <div class="liuyuan-panorama-viewer__utility-head">
        <div>
          <p>{{ pageText.statusLabel }}</p>
          <strong>{{ autoPlay ? pageText.statusAuto : pageText.statusReady }}</strong>
        </div>
        <span>{{ progressLabel }}</span>
      </div>

      <div class="liuyuan-panorama-viewer__utility-meters">
        <div class="liuyuan-panorama-viewer__utility-metric">
          <small>{{ pageText.progressLabel }}</small>
          <div class="liuyuan-panorama-viewer__meter">
            <span :style="{ width: `${progressRatio}%` }" />
          </div>
        </div>

        <div class="liuyuan-panorama-viewer__utility-metric">
          <small>{{ pageText.angleLabel }} {{ normalizedYaw }}°</small>
          <div class="liuyuan-panorama-viewer__meter liuyuan-panorama-viewer__meter--subtle">
            <span :style="{ width: angleMeterRatio }" />
          </div>
        </div>
      </div>

      <div class="liuyuan-panorama-viewer__controls">
        <button type="button" class="liuyuan-panorama-viewer__control" @click="showPreviousScene">
          {{ pageText.previousAction }}
        </button>
        <button type="button" class="liuyuan-panorama-viewer__control liuyuan-panorama-viewer__control--primary" @click="toggleAutoPlay">
          {{ autoPlay ? pageText.autoplayPause : pageText.autoplayPlay }}
        </button>
        <button type="button" class="liuyuan-panorama-viewer__control" @click="showNextScene">
          {{ pageText.nextAction }}
        </button>
      </div>

      <span class="liuyuan-panorama-viewer__hint">{{ pageText.dragHint }}</span>
    </aside>

    <footer class="liuyuan-panorama-viewer__bottom">
      <section class="liuyuan-panorama-viewer__scene-strip-wrap shell">
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
              <img :src="scene.thumbnail || scene.image" :alt="scene.title" class="liuyuan-panorama-viewer__scene-card-image" loading="lazy" />
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
  overflow: hidden;
  color: #fff4ea;
  background: #0f0b08;
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
  filter: blur(18px) saturate(1.03);
  transform: scale(1.05);
}

.liuyuan-panorama-viewer__veil {
  background:
    linear-gradient(180deg, rgba(15, 11, 8, 0.16), rgba(15, 11, 8, 0.46) 72%, rgba(15, 11, 8, 0.72)),
    linear-gradient(90deg, rgba(15, 11, 8, 0.18), transparent 16%, transparent 84%, rgba(15, 11, 8, 0.26));
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

.liuyuan-panorama-viewer__topbar > *,
.liuyuan-panorama-viewer__floating > *,
.liuyuan-panorama-viewer__utility > *,
.liuyuan-panorama-viewer__bottom > * {
  pointer-events: auto;
}

.shell {
  border: 1px solid rgba(255, 238, 225, 0.12);
  background:
    linear-gradient(180deg, rgba(34, 22, 15, 0.38), rgba(14, 10, 8, 0.24)),
    rgba(14, 10, 8, 0.26);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.16);
}

.liuyuan-panorama-viewer__topbar {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.8rem 0.8rem 0;
  pointer-events: none;
}

.liuyuan-panorama-viewer__brand {
  display: grid;
  gap: 0.2rem;
  padding: 0.72rem 0.9rem;
  border-radius: 20px;
}

.liuyuan-panorama-viewer__brand span,
.liuyuan-panorama-viewer__scene-strip-head p,
.liuyuan-panorama-viewer__scene-card span,
.liuyuan-panorama-viewer__scene-chip p,
.liuyuan-panorama-viewer__info-copy p,
.liuyuan-panorama-viewer__utility-head p,
.liuyuan-panorama-viewer__utility-metric small {
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255, 239, 226, 0.7);
}

.liuyuan-panorama-viewer__top-actions {
  display: flex;
  gap: 0.75rem;
}

.liuyuan-panorama-viewer__pill,
.liuyuan-panorama-viewer__control,
.liuyuan-panorama-viewer__chip-button,
.liuyuan-panorama-viewer__rail-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.8rem;
  padding: 0 1rem;
  border-radius: 999px;
  color: #fff;
  text-decoration: none;
}

.liuyuan-panorama-viewer__floating {
  position: absolute;
  top: 5rem;
  left: 1rem;
  display: grid;
  gap: 0.75rem;
  width: min(360px, calc(100vw - 2rem));
}

.liuyuan-panorama-viewer__scene-chip,
.liuyuan-panorama-viewer__info-card,
.liuyuan-panorama-viewer__scene-strip-wrap {
  border-radius: 24px;
}

.liuyuan-panorama-viewer__scene-chip {
  display: grid;
  gap: 0.9rem;
  padding: 0.95rem 1rem;
}

.liuyuan-panorama-viewer__scene-chip-main {
  display: grid;
  gap: 0.25rem;
}

.liuyuan-panorama-viewer__scene-chip h1 {
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(2rem, 4vw, 2.8rem);
  line-height: 1;
}

.liuyuan-panorama-viewer__scene-chip-main strong {
  display: inline-flex;
  width: fit-content;
  padding: 0.4rem 0.7rem;
  border-radius: 999px;
  background: rgba(255, 248, 242, 0.08);
  font-size: 0.82rem;
  color: rgba(255, 244, 234, 0.92);
}

.liuyuan-panorama-viewer__scene-chip-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.liuyuan-panorama-viewer__chip-button,
.liuyuan-panorama-viewer__rail-toggle {
  border: 1px solid rgba(255, 240, 228, 0.12);
  background: rgba(255, 250, 246, 0.05);
  cursor: pointer;
}

.liuyuan-panorama-viewer__chip-button--strong {
  background: linear-gradient(135deg, rgba(143, 89, 46, 0.94), rgba(201, 145, 92, 0.82));
  border-color: rgba(255, 229, 204, 0.22);
}

.liuyuan-panorama-viewer__info-card {
  display: grid;
  gap: 0.9rem;
  padding: 0.95rem 1rem;
}

.liuyuan-panorama-viewer__info-copy {
  display: grid;
  gap: 0.35rem;
}

.liuyuan-panorama-viewer__info-copy strong {
  color: #fff;
  font-size: 1rem;
}

.liuyuan-panorama-viewer__info-copy span,
.liuyuan-panorama-viewer__hint,
.liuyuan-panorama-viewer__scene-strip-meta small {
  line-height: 1.72;
  color: rgba(255, 243, 232, 0.84);
}

.liuyuan-panorama-viewer__info-copy--subtle {
  padding-top: 0.1rem;
  border-top: 1px solid rgba(255, 240, 228, 0.08);
}

.liuyuan-panorama-viewer__utility {
  position: absolute;
  top: 5rem;
  right: 1rem;
  display: grid;
  gap: 0.9rem;
  width: min(270px, calc(100vw - 2rem));
  padding: 0.95rem 1rem;
}

.liuyuan-panorama-viewer__utility-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: start;
}

.liuyuan-panorama-viewer__utility-head strong,
.liuyuan-panorama-viewer__utility-head span {
  color: #fff;
}

.liuyuan-panorama-viewer__utility-meters {
  display: grid;
  gap: 0.6rem;
}

.liuyuan-panorama-viewer__utility-metric {
  display: grid;
  gap: 0.35rem;
}

.liuyuan-panorama-viewer__controls {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
}

.liuyuan-panorama-viewer__control {
  border: 1px solid rgba(255, 240, 228, 0.12);
  background: rgba(255, 250, 246, 0.06);
  color: #fff;
  cursor: pointer;
}

.liuyuan-panorama-viewer__control--primary {
  background: linear-gradient(135deg, rgba(143, 89, 46, 0.96), rgba(201, 145, 92, 0.88));
  border-color: rgba(255, 229, 204, 0.22);
}

.liuyuan-panorama-viewer__meter {
  position: relative;
  height: 0.42rem;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
}

.liuyuan-panorama-viewer__meter span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(170, 110, 62, 0.96), rgba(247, 217, 188, 0.84));
}

.liuyuan-panorama-viewer__meter--subtle span {
  background: linear-gradient(90deg, rgba(88, 127, 112, 0.96), rgba(210, 236, 228, 0.82));
}

.liuyuan-panorama-viewer__bottom {
  position: absolute;
  left: 50%;
  bottom: 1rem;
  width: min(1080px, calc(100vw - 2rem));
  transform: translateX(-50%);
}

.liuyuan-panorama-viewer__scene-strip-wrap {
  display: grid;
  gap: 0.75rem;
  padding: 0.85rem 0.95rem;
}

.liuyuan-panorama-viewer__scene-strip-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
}

.liuyuan-panorama-viewer__scene-strip-meta {
  display: grid;
  gap: 0.2rem;
  max-width: 32rem;
}

.liuyuan-panorama-viewer__scene-strip-meta strong {
  font-size: 1rem;
  color: #fff;
}

.liuyuan-panorama-viewer__scene-strip {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(150px, 1fr);
  gap: 0.55rem;
  overflow-x: auto;
  padding-bottom: 0.1rem;
}

.liuyuan-panorama-viewer__scene-card {
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: 7.8rem;
  padding: 0;
  border-radius: 18px;
  border: 1px solid rgba(255, 240, 228, 0.12);
  background:
    linear-gradient(160deg, color-mix(in srgb, var(--scene-accent) 28%, rgba(255, 255, 255, 0.08)), rgba(16, 10, 8, 0.76)),
    rgba(16, 10, 8, 0.42);
  color: #fff;
  text-align: left;
  cursor: pointer;
}

.liuyuan-panorama-viewer__scene-card-image {
  display: block;
  width: 100%;
  height: 4.6rem;
  object-fit: cover;
}

.liuyuan-panorama-viewer__scene-card-copy {
  display: grid;
  gap: 0.28rem;
  padding: 0.62rem 0.72rem 0.72rem;
}

.liuyuan-panorama-viewer__scene-card strong {
  font-size: 0.92rem;
}

.liuyuan-panorama-viewer__scene-card.is-active {
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.24);
  border-color: rgba(255, 240, 228, 0.22);
}

.liuyuan-panorama-viewer__hint {
  font-size: 0.86rem;
}

.liuyuan-fade-enter-active,
.liuyuan-fade-leave-active {
  transition:
    opacity 0.24s ease,
    transform 0.24s ease;
}

.liuyuan-fade-enter-from,
.liuyuan-fade-leave-to {
  opacity: 0;
  transform: translateY(6px);
}

@media (max-width: 1180px) {
  .liuyuan-panorama-viewer__bottom {
    width: calc(100vw - 1.4rem);
  }

  .liuyuan-panorama-viewer__scene-strip-meta {
    max-width: 24rem;
  }
}

@media (max-width: 960px) {
  .liuyuan-panorama-viewer__floating,
  .liuyuan-panorama-viewer__utility {
    position: static;
    width: auto;
    margin: 0 1rem 0.8rem;
  }

  .liuyuan-panorama-viewer__floating {
    padding-top: 4.6rem;
  }

  .liuyuan-panorama-viewer__bottom {
    position: static;
    transform: none;
    width: auto;
    margin: 0 1rem 1rem;
    padding-bottom: 0.1rem;
    left: auto;
  }
}

@media (max-width: 820px) {
  .liuyuan-panorama-viewer__topbar {
    flex-direction: column;
    gap: 0.65rem;
  }

  .liuyuan-panorama-viewer__top-actions {
    width: 100%;
    justify-content: stretch;
  }
}

@media (max-width: 640px) {
  .liuyuan-panorama-viewer__topbar {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }

  .liuyuan-panorama-viewer__floating,
  .liuyuan-panorama-viewer__utility,
  .liuyuan-panorama-viewer__bottom {
    margin-left: 0.75rem;
    margin-right: 0.75rem;
  }

  .liuyuan-panorama-viewer__floating {
    padding-top: 4.4rem;
  }

  .liuyuan-panorama-viewer__scene-chip h1 {
    font-size: clamp(1.7rem, 10vw, 2.3rem);
  }

  .liuyuan-panorama-viewer__controls {
    grid-template-columns: 1fr;
  }

  .liuyuan-panorama-viewer__top-actions,
  .liuyuan-panorama-viewer__scene-chip-actions,
  .liuyuan-panorama-viewer__scene-strip-head {
    flex-direction: column;
    align-items: stretch;
  }

  .liuyuan-panorama-viewer__pill,
  .liuyuan-panorama-viewer__control,
  .liuyuan-panorama-viewer__chip-button,
  .liuyuan-panorama-viewer__rail-toggle {
    width: 100%;
  }

  .liuyuan-panorama-viewer__scene-strip-meta {
    max-width: none;
  }
}
</style>
