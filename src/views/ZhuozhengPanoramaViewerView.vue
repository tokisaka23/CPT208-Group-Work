<script setup>
import { computed, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import PanoramaSphereViewer from '../components/PanoramaSphereViewer.vue';
import { gardenDetailsSource } from '../data/gardenDetails';
import { zhuozhengPanoramaScenesSource } from '../data/zhuozhengPanoramaScenes';
import { resolveLocalized, useLanguage } from '../i18n';
import { panoramaPanToYaw } from '../shared/panoramaView';

const { language } = useLanguage();

const pageTextSource = {
  backAction: {
    zh: '返回入口',
    en: 'Back to Entry',
    ja: 'Back to Entry',
    ko: 'Back to Entry',
  },
  detailAction: {
    zh: '园林详情',
    en: 'Garden Detail',
    ja: 'Garden Detail',
    ko: 'Garden Detail',
  },
  viewerLabel: {
    zh: '全景 viewer',
    en: 'Panorama Viewer',
    ja: 'Panorama Viewer',
    ko: 'Panorama Viewer',
  },
  autoplayPlay: {
    zh: '自动巡游',
    en: 'Autoplay',
    ja: 'Autoplay',
    ko: 'Autoplay',
  },
  autoplayPause: {
    zh: '暂停巡游',
    en: 'Pause',
    ja: 'Pause',
    ko: 'Pause',
  },
  previousAction: {
    zh: '上一景',
    en: 'Previous',
    ja: 'Previous',
    ko: 'Previous',
  },
  nextAction: {
    zh: '下一景',
    en: 'Next',
    ja: 'Next',
    ko: 'Next',
  },
  sceneLabel: {
    zh: '节点列表',
    en: 'Scene List',
    ja: 'Scene List',
    ko: 'Scene List',
  },
  focusLabel: {
    zh: '观察重点',
    en: 'Focus',
    ja: 'Focus',
    ko: 'Focus',
  },
  noteLabel: {
    zh: '镜头说明',
    en: 'Scene Note',
    ja: 'Scene Note',
    ko: 'Scene Note',
  },
  timelineLabel: {
    zh: '游览进度',
    en: 'Tour Progress',
    ja: 'Tour Progress',
    ko: 'Tour Progress',
  },
  dragHint: {
    zh: '拖拽旋转全景，滚轮缩放，点击热点查看节点说明。',
    en: 'Drag to orbit, use the wheel to zoom, and tap hotspots to inspect the scene.',
    ja: 'Drag to orbit, use the wheel to zoom, and tap hotspots to inspect the scene.',
    ko: 'Drag to orbit, use the wheel to zoom, and tap hotspots to inspect the scene.',
  },
  panLabel: {
    zh: '视角位置',
    en: 'Pan Position',
    ja: 'Pan Position',
    ko: 'Pan Position',
  },
  sourceLabel: {
    zh: '素材来源',
    en: 'Image Source',
    ja: 'Image Source',
    ko: 'Image Source',
  },
  sourceAction: {
    zh: '查看来源',
    en: 'Open Source',
    ja: 'Open Source',
    ko: 'Open Source',
  },
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const garden = computed(() => resolveLocalized(gardenDetailsSource.zhuozhengyuan, language.value));
const pageText = computed(() => resolveLocalized(pageTextSource, language.value));

const scenes = computed(() => {
  return zhuozhengPanoramaScenesSource.map((scene, index) => {
    const localizedScene = resolveLocalized(scene, language.value);

    return {
      ...localizedScene,
      id: localizedScene.id || `scene-${index + 1}`,
      order: localizedScene.order || String(index + 1).padStart(2, '0'),
      hotspots: localizedScene.hotspots || [],
      initialPan: localizedScene.initialPan ?? 50,
      panRange: localizedScene.panRange ?? 28,
    };
  });
});

const activeSceneIndex = ref(0);
const activeHotspotId = ref('');
const autoPlay = ref(true);
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

const panIndicatorRatio = computed(() => {
  const normalizedYaw = ((viewState.value.yaw % 360) + 360) % 360;
  return `${clamp((normalizedYaw / 360) * 100, 0, 100)}%`;
});

const setActiveScene = (index) => {
  if (index < 0 || index >= scenes.value.length) {
    return;
  }

  activeSceneIndex.value = index;
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
      yaw: panoramaPanToYaw(scene.initialPan),
      pitch: scene.initialTilt ?? 0,
      fov: scene.initialFov ?? 70,
    };
  },
  { immediate: true },
);
</script>

<template>
  <article class="panorama-viewer" v-if="activeScene">
    <div class="panorama-viewer__background" />

    <header class="panorama-viewer__topbar">
      <div class="panorama-viewer__brand">
        <span>{{ pageText.viewerLabel }}</span>
        <strong>{{ garden.name }}</strong>
      </div>

      <div class="panorama-viewer__actions">
        <RouterLink to="/zhuozheng/panorama" class="panorama-viewer__pill">
          {{ pageText.backAction }}
        </RouterLink>
        <RouterLink to="/zhuozheng" class="panorama-viewer__pill panorama-viewer__pill--ghost">
          {{ pageText.detailAction }}
        </RouterLink>
      </div>
    </header>

    <section class="panorama-viewer__headline">
      <p>{{ activeScene.order }}</p>
      <h1>{{ activeScene.title }}</h1>
      <span>{{ activeScene.description }}</span>
    </section>

    <section class="panorama-viewer__stage">
      <div class="panorama-viewer__viewport">
        <PanoramaSphereViewer
          :scene="activeScene"
          :active-hotspot-id="activeHotspotId"
          :auto-play="autoPlay"
          @hotspot-select="setActiveHotspot"
          @view-change="handleViewChange"
        />

        <div class="panorama-viewer__viewport-copy">
          <span>{{ pageText.dragHint }}</span>
        </div>
      </div>

      <aside class="panorama-viewer__scene-rail">
        <p>{{ pageText.sceneLabel }}</p>
        <button
          v-for="(scene, index) in scenes"
          :key="scene.id"
          type="button"
          :class="['panorama-viewer__scene-chip', { 'is-active': index === activeSceneIndex }]"
          @click="setActiveScene(index)"
        >
          <span>{{ scene.order }}</span>
          <strong>{{ scene.title }}</strong>
        </button>
      </aside>
    </section>

    <section class="panorama-viewer__lower">
      <aside class="panorama-viewer__panel">
        <section class="panorama-viewer__card">
          <p>{{ pageText.focusLabel }}</p>
          <div class="panorama-viewer__tags">
            <strong
              v-for="hotspot in activeScene.hotspots"
              :key="hotspot.id || hotspot.label"
              :class="{ 'is-active': hotspot.id === activeHotspot?.id }"
            >
              {{ hotspot.label }}
            </strong>
            <strong v-if="!activeScene.hotspots?.length">{{ garden.name }}</strong>
          </div>
        </section>

        <section class="panorama-viewer__card">
          <p>{{ pageText.noteLabel }}</p>
          <strong>{{ activeHotspot?.title || activeScene.title }}</strong>
          <span>{{ activeHotspot?.description || activeScene.description }}</span>
        </section>

        <section class="panorama-viewer__card">
          <p>{{ pageText.sourceLabel }}</p>
          <strong>{{ activeScene.sourceLabel || activeScene.title }}</strong>
          <span>{{ activeScene.sourceAuthor }} · {{ activeScene.sourceName }} · {{ activeScene.sourceLicense }}</span>
          <a
            v-if="activeScene.sourcePage"
            :href="activeScene.sourcePage"
            class="panorama-viewer__source-link"
            target="_blank"
            rel="noreferrer"
          >
            {{ pageText.sourceAction }}
          </a>
        </section>
      </aside>

      <footer class="panorama-viewer__footer">
        <div class="panorama-viewer__controls">
          <button type="button" class="panorama-viewer__control" @click="showPreviousScene">
            {{ pageText.previousAction }}
          </button>
          <button
            type="button"
            class="panorama-viewer__control panorama-viewer__control--primary"
            @click="toggleAutoPlay"
          >
            {{ autoPlay ? pageText.autoplayPause : pageText.autoplayPlay }}
          </button>
          <button type="button" class="panorama-viewer__control" @click="showNextScene">
            {{ pageText.nextAction }}
          </button>
        </div>

        <div class="panorama-viewer__timeline">
          <span>{{ pageText.timelineLabel }}</span>
          <div class="panorama-viewer__meter">
            <span :style="{ width: `${progressRatio}%` }" />
          </div>
        </div>

        <div class="panorama-viewer__timeline">
          <span>{{ pageText.panLabel }}</span>
          <div class="panorama-viewer__meter panorama-viewer__meter--subtle">
            <span :style="{ width: panIndicatorRatio }" />
          </div>
        </div>
      </footer>
    </section>
  </article>
</template>

<style scoped>
.panorama-viewer {
  position: relative;
  min-height: 100vh;
  overflow: clip;
  color: #faf7f1;
  background: #0b1013;
}

.panorama-viewer__background {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 16% 18%, rgba(255, 255, 255, 0.08), transparent 18%),
    radial-gradient(circle at 78% 20%, rgba(159, 63, 52, 0.2), transparent 20%),
    radial-gradient(circle at 74% 82%, rgba(95, 127, 114, 0.22), transparent 24%),
    linear-gradient(180deg, rgba(8, 10, 12, 0.94) 0%, rgba(8, 10, 12, 0.84) 100%);
}

.panorama-viewer__topbar,
.panorama-viewer__headline,
.panorama-viewer__stage,
.panorama-viewer__lower {
  position: relative;
  z-index: 1;
}

.panorama-viewer__topbar {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem 1.75rem 0;
}

.panorama-viewer__brand,
.panorama-viewer__pill,
.panorama-viewer__scene-chip,
.panorama-viewer__card,
.panorama-viewer__control,
.panorama-viewer__timeline,
.panorama-viewer__viewport-copy {
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(8, 12, 15, 0.28);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.panorama-viewer__brand {
  display: grid;
  gap: 0.18rem;
  padding: 0.9rem 1rem;
  border-radius: 24px;
}

.panorama-viewer__brand span,
.panorama-viewer__headline p,
.panorama-viewer__scene-rail p,
.panorama-viewer__scene-chip span,
.panorama-viewer__card p,
.panorama-viewer__timeline span,
.panorama-viewer__viewport-copy span {
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(250, 247, 241, 0.72);
}

.panorama-viewer__brand strong,
.panorama-viewer__headline h1,
.panorama-viewer__scene-chip strong,
.panorama-viewer__card strong {
  color: white;
}

.panorama-viewer__actions {
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
  color: white;
  text-decoration: none;
  transition:
    transform 0.24s ease,
    background-color 0.24s ease,
    border-color 0.24s ease,
    box-shadow 0.24s ease;
}

.panorama-viewer__pill:hover,
.panorama-viewer__control:hover,
.panorama-viewer__scene-chip:hover {
  transform: translateY(-2px);
}

.panorama-viewer__pill--ghost,
.panorama-viewer__control {
  background: rgba(8, 12, 15, 0.34);
}

.panorama-viewer__headline {
  max-width: 44rem;
  display: grid;
  gap: 0.7rem;
  padding: 2rem 1.75rem 0;
}

.panorama-viewer__headline h1 {
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(2.6rem, 6vw, 4.6rem);
  line-height: 0.98;
}

.panorama-viewer__headline span,
.panorama-viewer__card span {
  color: rgba(250, 247, 241, 0.84);
  line-height: 1.8;
}

.panorama-viewer__source-link {
  color: #f5ddd7;
  text-decoration: none;
}

.panorama-viewer__source-link:hover {
  text-decoration: underline;
}

.panorama-viewer__stage {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(280px, 0.34fr);
  gap: 1rem;
  padding: 1.4rem 1.75rem 0;
}

.panorama-viewer__viewport {
  position: relative;
  overflow: hidden;
  min-height: 56vh;
  border-radius: 36px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(4, 8, 10, 0.58);
  touch-action: none;
}

.panorama-viewer__viewport::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0.26)),
    linear-gradient(90deg, rgba(0, 0, 0, 0.18), transparent 18%, transparent 82%, rgba(0, 0, 0, 0.18));
  pointer-events: none;
}

.panorama-viewer__viewport-copy {
  position: absolute;
  left: 1rem;
  right: 1rem;
  bottom: 1rem;
  padding: 0.82rem 0.95rem;
  border-radius: 18px;
  z-index: 3;
}

.panorama-viewer__scene-rail {
  display: grid;
  gap: 0.85rem;
  align-content: start;
}

.panorama-viewer__scene-chip {
  display: grid;
  gap: 0.3rem;
  padding: 0.95rem 1rem;
  border-radius: 22px;
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.24s ease,
    border-color 0.24s ease,
    box-shadow 0.24s ease;
}

.panorama-viewer__scene-chip.is-active {
  border-color: rgba(255, 219, 212, 0.38);
  box-shadow: 0 18px 32px rgba(0, 0, 0, 0.16);
}

.panorama-viewer__lower {
  display: grid;
  grid-template-columns: minmax(0, 0.42fr) minmax(0, 0.58fr);
  gap: 1rem;
  padding: 1rem 1.75rem 1.5rem;
}

.panorama-viewer__panel {
  display: grid;
  gap: 0.9rem;
}

.panorama-viewer__card {
  display: grid;
  gap: 0.65rem;
  padding: 1rem 1.05rem;
  border-radius: 24px;
}

.panorama-viewer__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.panorama-viewer__tags strong {
  padding: 0.65rem 0.75rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.panorama-viewer__tags strong.is-active {
  background: rgba(158, 41, 28, 0.74);
}

.panorama-viewer__footer {
  display: grid;
  align-content: start;
  gap: 1rem;
}

.panorama-viewer__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.panorama-viewer__control--primary {
  background: rgba(158, 41, 28, 0.84);
  border-color: rgba(255, 220, 214, 0.28);
}

.panorama-viewer__timeline {
  display: grid;
  gap: 0.65rem;
  padding: 0.95rem 1rem;
  border-radius: 24px;
}

.panorama-viewer__meter {
  position: relative;
  height: 0.5rem;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
}

.panorama-viewer__meter span {
  display: block;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, rgba(158, 41, 28, 0.92), rgba(255, 222, 216, 0.78));
}

.panorama-viewer__meter--subtle span {
  background: linear-gradient(90deg, rgba(95, 127, 114, 0.96), rgba(208, 235, 224, 0.8));
}

@media (max-width: 1180px) {
  .panorama-viewer__stage,
  .panorama-viewer__lower {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 880px) {
  .panorama-viewer__topbar {
    flex-direction: column;
  }

  .panorama-viewer__actions,
  .panorama-viewer__controls {
    flex-direction: column;
  }

  .panorama-viewer__pill,
  .panorama-viewer__control {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .panorama-viewer__topbar,
  .panorama-viewer__headline,
  .panorama-viewer__stage,
  .panorama-viewer__lower {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .panorama-viewer__viewport {
    min-height: 48vh;
  }

  .panorama-viewer__headline h1 {
    font-size: clamp(2.2rem, 12vw, 3.4rem);
  }
}
</style>
