<script setup>
import { computed, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import PanoramaSphereViewer from '../components/PanoramaSphereViewer.vue';
import { gardenDetailsSource } from '../data/gardenDetails';
import { zhuozhengPanoramaScenesSource } from '../data/zhuozhengPanoramaTour';
import { resolveLocalized, useLanguage } from '../i18n';

const { language } = useLanguage();
const route = useRoute();

const pageTextSource = {
  viewerLabel: {
    zh: '拙政园全景漫游',
    en: 'Zhuozhengyuan Panorama',
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
    zh: '拖拽旋转全景，滚轮缩放，点击热点查看节点说明。',
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
  sourceLabel: {
    zh: '素材来源',
    en: 'Source',
  },
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const pageText = computed(() => resolveLocalized(pageTextSource, language.value));
const garden = computed(() => resolveLocalized(gardenDetailsSource.zhuozhengyuan, language.value));
const scenes = computed(() => {
  return zhuozhengPanoramaScenesSource.map((scene, index) => {
    const localizedScene = resolveLocalized(scene, language.value);

    return {
      ...localizedScene,
      id: localizedScene.id || `scene-${index + 1}`,
      order: localizedScene.order || String(index + 1).padStart(2, '0'),
      hotspots: localizedScene.hotspots || [],
      accent: localizedScene.accent || '#b15f45',
      initialPan: localizedScene.initialPan ?? 50,
      initialTilt: localizedScene.initialTilt ?? 0,
      initialFov: localizedScene.initialFov ?? 70,
    };
  });
});

const activeSceneIndex = ref(0);
const activeHotspotId = ref('');
const autoPlay = ref(false);
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

const normalizedYaw = computed(() => {
  return Math.round((((viewState.value.yaw % 360) + 360) % 360));
});

const progressLabel = computed(() => {
  const total = String(scenes.value.length).padStart(2, '0');
  const current = String(activeSceneIndex.value + 1).padStart(2, '0');
  return `${current} / ${total}`;
});

const activeSceneBackdropStyle = computed(() => ({
  backgroundImage: `url(${activeScene.value?.image || garden.value.heroImage})`,
}));

const angleMeterRatio = computed(() => `${clamp((normalizedYaw.value / 360) * 100, 0, 100)}%`);

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
  <article v-if="activeScene" class="panorama-viewer">
    <div class="panorama-viewer__backdrop" :style="activeSceneBackdropStyle" />
    <div class="panorama-viewer__veil" />

    <div class="panorama-viewer__viewport">
      <PanoramaSphereViewer
        :scene="activeScene"
        :active-hotspot-id="activeHotspotId"
        :auto-play="autoPlay"
        @hotspot-select="setActiveHotspot"
        @view-change="handleViewChange"
      />
    </div>

    <header class="panorama-viewer__topbar">
      <div class="panorama-viewer__brand glass">
        <span>{{ pageText.viewerLabel }}</span>
        <strong>{{ garden.name }}</strong>
      </div>

      <div class="panorama-viewer__top-actions">
        <RouterLink to="/zhuozheng/panorama" class="panorama-viewer__pill glass">
          {{ pageText.backAction }}
        </RouterLink>
        <RouterLink to="/zhuozheng" class="panorama-viewer__pill glass">
          {{ pageText.detailAction }}
        </RouterLink>
      </div>
    </header>

    <section class="panorama-viewer__hero">
      <div class="panorama-viewer__headline glass">
        <p>{{ activeScene.order }}</p>
        <h1>{{ activeScene.title }}</h1>
        <span>{{ activeScene.description }}</span>

        <div class="panorama-viewer__tags">
          <strong
            v-for="hotspot in activeScene.hotspots"
            :key="hotspot.id || hotspot.label"
            :class="{ 'is-active': hotspot.id === activeHotspot?.id }"
          >
            {{ hotspot.label }}
          </strong>
        </div>
      </div>

      <aside class="panorama-viewer__dock">
        <section class="panorama-viewer__panel glass">
          <p>{{ pageText.statusLabel }}</p>
          <strong>{{ autoPlay ? pageText.statusAuto : pageText.statusReady }}</strong>
          <span>{{ pageText.dragHint }}</span>
        </section>

        <section class="panorama-viewer__panel glass">
          <div class="panorama-viewer__controls">
            <button type="button" class="panorama-viewer__control" @click="showPreviousScene">
              {{ pageText.previousAction }}
            </button>
            <button type="button" class="panorama-viewer__control panorama-viewer__control--primary" @click="toggleAutoPlay">
              {{ autoPlay ? pageText.autoplayPause : pageText.autoplayPlay }}
            </button>
            <button type="button" class="panorama-viewer__control" @click="showNextScene">
              {{ pageText.nextAction }}
            </button>
          </div>
        </section>

        <section class="panorama-viewer__panel glass panorama-viewer__metrics">
          <div>
            <span>{{ pageText.progressLabel }}</span>
            <strong>{{ progressLabel }}</strong>
          </div>
          <div class="panorama-viewer__meter">
            <span :style="{ width: `${progressRatio}%` }" />
          </div>
          <div>
            <span>{{ pageText.angleLabel }}</span>
            <strong>{{ normalizedYaw }}°</strong>
          </div>
          <div class="panorama-viewer__meter panorama-viewer__meter--subtle">
            <span :style="{ width: angleMeterRatio }" />
          </div>
        </section>
      </aside>
    </section>

    <footer class="panorama-viewer__bottom">
      <section class="panorama-viewer__scene-strip-wrap glass">
        <div class="panorama-viewer__scene-strip-head">
          <div class="panorama-viewer__scene-strip-meta">
            <p>{{ pageText.noteLabel }}</p>
            <strong>{{ activeHotspot?.title || activeScene.title }}</strong>
            <small>{{ activeHotspot?.description || activeScene.description }}</small>
          </div>

          <div class="panorama-viewer__scene-strip-stats">
            <p>{{ pageText.sceneListLabel }}</p>
            <span>{{ progressLabel }}</span>
          </div>
        </div>

        <div class="panorama-viewer__scene-strip">
          <button
            v-for="(scene, index) in scenes"
            :key="scene.id"
            type="button"
            :class="['panorama-viewer__scene-card', { 'is-active': index === activeSceneIndex }]"
            :style="{ '--scene-accent': scene.accent }"
            @click="setActiveScene(index)"
          >
            <img :src="scene.thumbnail || scene.image" :alt="scene.title" class="panorama-viewer__scene-card-image" loading="lazy" />
            <div class="panorama-viewer__scene-card-copy">
              <span>{{ scene.order }}</span>
              <strong>{{ scene.title }}</strong>
              <small>{{ scene.description }}</small>
            </div>
          </button>
        </div>
      </section>
    </footer>
  </article>
</template>

<style scoped>
.panorama-viewer {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  color: #f7f4ed;
  background: #081014;
}

.panorama-viewer__backdrop,
.panorama-viewer__veil,
.panorama-viewer__viewport {
  position: absolute;
  inset: 0;
}

.panorama-viewer__backdrop {
  background-position: center;
  background-size: cover;
  filter: blur(28px) saturate(1.05);
  transform: scale(1.08);
}

.panorama-viewer__veil {
  background:
    linear-gradient(180deg, rgba(5, 9, 11, 0.38), rgba(5, 9, 11, 0.82)),
    linear-gradient(90deg, rgba(5, 9, 11, 0.46), transparent 22%, transparent 78%, rgba(5, 9, 11, 0.56));
}

.panorama-viewer__viewport {
  z-index: 0;
}

.panorama-viewer__topbar,
.panorama-viewer__hero,
.panorama-viewer__bottom {
  position: relative;
  z-index: 2;
  pointer-events: none;
}

.panorama-viewer__topbar > *,
.panorama-viewer__hero > *,
.panorama-viewer__bottom > * {
  pointer-events: auto;
}

.glass {
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(8, 12, 15, 0.18);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.panorama-viewer__topbar {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1rem 0;
}

.panorama-viewer__brand {
  display: grid;
  gap: 0.2rem;
  padding: 0.9rem 1rem;
  border-radius: 24px;
}

.panorama-viewer__brand span,
.panorama-viewer__headline p,
.panorama-viewer__panel p,
.panorama-viewer__metrics span,
.panorama-viewer__note p,
.panorama-viewer__source label,
.panorama-viewer__scene-strip-head p,
.panorama-viewer__scene-card span {
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(247, 244, 237, 0.72);
}

.panorama-viewer__top-actions {
  display: flex;
  gap: 0.75rem;
}

.panorama-viewer__pill,
.panorama-viewer__control {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3rem;
  padding: 0 1.1rem;
  border-radius: 999px;
  color: #fff;
  text-decoration: none;
}

.panorama-viewer__hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 280px;
  gap: 1rem;
  padding: 4.8rem 1rem 10.2rem;
}

.panorama-viewer__headline,
.panorama-viewer__panel,
.panorama-viewer__note,
.panorama-viewer__scene-strip-wrap {
  border-radius: 28px;
}

.panorama-viewer__headline {
  align-self: start;
  max-width: 30rem;
  display: grid;
  gap: 0.65rem;
  padding: 0.95rem 1.05rem;
}

.panorama-viewer__headline h1 {
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(2.2rem, 5vw, 3.8rem);
  line-height: 0.98;
}

.panorama-viewer__headline span,
.panorama-viewer__panel span,
.panorama-viewer__note span,
.panorama-viewer__scene-card small {
  line-height: 1.78;
  color: rgba(247, 244, 237, 0.86);
}

.panorama-viewer__dock {
  display: grid;
  gap: 0.75rem;
  align-content: start;
}

.panorama-viewer__panel {
  display: grid;
  gap: 0.55rem;
  padding: 0.85rem 0.95rem;
}

.panorama-viewer__controls {
  display: grid;
  gap: 0.55rem;
}

.panorama-viewer__control {
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  cursor: pointer;
}

.panorama-viewer__control--primary {
  background: linear-gradient(135deg, rgba(176, 61, 38, 0.96), rgba(216, 122, 92, 0.88));
  border-color: rgba(255, 223, 215, 0.25);
}

.panorama-viewer__metrics {
  gap: 0.9rem;
}

.panorama-viewer__meter {
  position: relative;
  height: 0.48rem;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
}

.panorama-viewer__meter span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(179, 68, 45, 0.96), rgba(245, 208, 197, 0.84));
}

.panorama-viewer__meter--subtle span {
  background: linear-gradient(90deg, rgba(97, 146, 136, 0.96), rgba(207, 234, 227, 0.82));
}

.panorama-viewer__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  padding-top: 0.1rem;
}

.panorama-viewer__tags strong {
  padding: 0.5rem 0.68rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 0.76rem;
  color: #fff;
}

.panorama-viewer__tags strong.is-active {
  background: rgba(181, 71, 46, 0.82);
}

.panorama-viewer__bottom {
  position: absolute;
  left: 50%;
  bottom: 1rem;
  width: min(1240px, calc(100vw - 2rem));
  transform: translateX(-50%);
}

.panorama-viewer__scene-strip-wrap {
  display: grid;
  gap: 0.65rem;
  padding: 0.85rem 0.95rem;
}

.panorama-viewer__scene-strip-head {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: end;
}

.panorama-viewer__scene-strip-meta {
  display: grid;
  gap: 0.18rem;
  max-width: 34rem;
}

.panorama-viewer__scene-strip-meta strong {
  font-size: 1rem;
  color: #fff;
}

.panorama-viewer__scene-strip-meta small {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  color: rgba(247, 244, 237, 0.82);
  line-height: 1.6;
}

.panorama-viewer__scene-strip-stats {
  display: grid;
  gap: 0.2rem;
  justify-items: end;
}

.panorama-viewer__scene-strip {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(170px, 1fr);
  gap: 0.65rem;
  overflow-x: auto;
  padding-bottom: 0.2rem;
}

.panorama-viewer__scene-card {
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 0;
  min-height: 9.8rem;
  padding: 0;
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background:
    linear-gradient(160deg, color-mix(in srgb, var(--scene-accent) 28%, rgba(255, 255, 255, 0.08)), rgba(8, 12, 15, 0.76)),
    rgba(8, 12, 15, 0.4);
  color: #fff;
  text-align: left;
  cursor: pointer;
}

.panorama-viewer__scene-card-image {
  display: block;
  width: 100%;
  height: 4.6rem;
  object-fit: cover;
}

.panorama-viewer__scene-card-copy {
  display: grid;
  gap: 0.28rem;
  padding: 0.72rem 0.82rem 0.8rem;
}

.panorama-viewer__scene-card strong {
  font-size: 0.98rem;
}

.panorama-viewer__scene-card small {
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.55;
}

.panorama-viewer__scene-card.is-active {
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.24);
  border-color: rgba(255, 255, 255, 0.26);
}

@media (max-width: 1180px) {
  .panorama-viewer__hero {
    grid-template-columns: 1fr;
  }

  .panorama-viewer__hero {
    padding-bottom: 11.5rem;
  }

  .panorama-viewer__scene-strip-head {
    grid-template-columns: 1fr;
    display: grid;
    align-items: start;
  }

  .panorama-viewer__scene-strip-stats {
    justify-items: start;
  }
}

@media (max-width: 820px) {
  .panorama-viewer__topbar {
    flex-direction: column;
  }

  .panorama-viewer__top-actions {
    flex-direction: column;
  }

  .panorama-viewer__pill,
  .panorama-viewer__control {
    width: 100%;
  }

  .panorama-viewer__hero {
    padding: 7.2rem 1rem 11.8rem;
  }

  .panorama-viewer__bottom {
    bottom: 1rem;
    width: calc(100vw - 1rem);
  }

  .panorama-viewer__scene-strip {
    grid-auto-columns: minmax(160px, 1fr);
  }
}

@media (max-width: 640px) {
  .panorama-viewer__topbar {
    padding: 1rem 1rem 0;
  }

  .panorama-viewer__headline h1 {
    font-size: clamp(2.2rem, 11vw, 3.4rem);
  }

  .panorama-viewer__scene-card {
    min-height: 9.2rem;
  }

  .panorama-viewer__scene-strip-meta small {
    -webkit-line-clamp: 1;
  }
}
</style>
