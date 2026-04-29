<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { gardenDetailsSource } from '../data/gardenDetails';
import {
  zhuozhengPanoramaCover,
  zhuozhengPanoramaCoverFallback,
  zhuozhengPanoramaScenesSource,
  zhuozhengPanoramaSpotlights,
} from '../data/zhuozhengPanoramaTour';
import { resolveLocalized, useLanguage } from '../i18n';
import { applyImageFallback } from '../shared/imageFallback';

const { language } = useLanguage();

const pageTextSource = {
  eyebrow: {
    zh: '拙政园全景漫游',
    en: 'Zhuozhengyuan Panorama Tour',
  },
  subhead: {
    zh: '十景串联 · 360° 实景浏览',
    en: 'Ten Stops · 360 Panorama Tour',
  },
  title: {
    zh: '沉浸式漫游入口',
    en: 'Immersive Panorama Entry',
  },
  intro: {
    zh: '进入 10 个实景节点的全景浏览界面，支持拖拽旋转、场景切换和自动巡游。',
    en: 'Enter a ten-stop 360 panorama tour with drag navigation, scene switching, and autoplay.',
  },
  startAction: {
    zh: '开始游览',
    en: 'Start Tour',
  },
  detailAction: {
    zh: '返回园林详情',
    en: 'Back to Detail',
  },
  sceneCountLabel: {
    zh: '实景节点',
    en: 'Scenes',
  },
  modeLabel: {
    zh: '浏览方式',
    en: 'Mode',
  },
  modeValue: {
    zh: '全屏 360°',
    en: '360 Fullscreen',
  },
  supportLabel: {
    zh: '适配设备',
    en: 'Devices',
  },
  supportValue: {
    zh: '电脑 / 手机',
    en: 'Desktop / Mobile',
  },
  routeTitle: {
    zh: '推荐游览顺序',
    en: 'Suggested Route',
  },
  spotlightTitle: {
    zh: '精选景点',
    en: 'Featured Spots',
  },
  railPanorama: {
    zh: '全景',
    en: 'Panorama',
  },
  railRoam: {
    zh: '漫游',
    en: 'Roam',
  },
  railNodes: {
    zh: '节点',
    en: 'Nodes',
  },
};

const garden = computed(() => resolveLocalized(gardenDetailsSource.zhuozhengyuan, language.value));
const pageText = computed(() => resolveLocalized(pageTextSource, language.value));
const scenes = computed(() => zhuozhengPanoramaScenesSource.map((scene) => resolveLocalized(scene, language.value)));
const spotlights = computed(() => zhuozhengPanoramaSpotlights.map((item) => resolveLocalized(item, language.value)));
const routePreview = computed(() => scenes.value.slice(0, 5));
const backgroundImage = computed(() => zhuozhengPanoramaCover || scenes.value[0]?.image || garden.value.heroImage);
const backgroundImageFallback = computed(() => zhuozhengPanoramaCoverFallback || scenes.value[0]?.fallbackImage || garden.value.heroImage);
const handleImageError = (event, fallbackImage) => {
  applyImageFallback(event, fallbackImage);
};
</script>

<template>
  <article class="panorama-entry">
    <img
      :src="backgroundImage"
      :alt="garden.heroAlt || garden.name"
      class="panorama-entry__image"
      @error="handleImageError($event, backgroundImageFallback)"
    />
    <div class="panorama-entry__veil" />
    <div class="panorama-entry__flare" />

    <header class="panorama-entry__topbar">
      <div class="panorama-entry__brand">
        <span>{{ pageText.eyebrow }}</span>
        <strong>{{ garden.name }}</strong>
      </div>

      <RouterLink to="/zhuozheng" class="panorama-entry__backlink">
        {{ pageText.detailAction }}
      </RouterLink>
    </header>

    <aside class="panorama-entry__rail" aria-hidden="true">
      <span>{{ pageText.railPanorama }}</span>
      <span>{{ pageText.railRoam }}</span>
      <span>{{ pageText.railNodes }}</span>
    </aside>

    <main class="panorama-entry__center">
      <div class="panorama-entry__copy">
        <p>{{ pageText.subhead }}</p>
        <h1>{{ pageText.title }}</h1>
        <span>{{ pageText.intro }}</span>

        <div class="panorama-entry__actions">
          <RouterLink
            :to="{ path: '/zhuozheng/panorama/viewer', query: { scene: 'entry' } }"
            class="panorama-entry__button panorama-entry__button--primary"
          >
            {{ pageText.startAction }}
          </RouterLink>
        </div>

        <section class="panorama-entry__spotlights">
          <header class="panorama-entry__spotlights-head">
            <span>{{ pageText.spotlightTitle }}</span>
          </header>
          <div class="panorama-entry__spotlight-grid">
            <RouterLink
              v-for="spot in spotlights"
              :key="spot.id"
              :to="{ path: '/zhuozheng/panorama/viewer', query: { scene: spot.id } }"
              class="panorama-entry__spotlight-card"
            >
              <img
                :src="spot.image"
                :alt="spot.title"
                loading="lazy"
                class="panorama-entry__spotlight-image"
                @error="handleImageError($event, spot.fallbackImage)"
              />
              <div class="panorama-entry__spotlight-copy">
                <strong>{{ spot.title }}</strong>
                <span>{{ spot.caption }}</span>
              </div>
            </RouterLink>
          </div>
        </section>
      </div>
    </main>

    <footer class="panorama-entry__footer">
      <div class="panorama-entry__facts">
        <article class="panorama-entry__fact">
          <span>{{ pageText.sceneCountLabel }}</span>
          <strong>{{ scenes.length }}</strong>
        </article>
        <article class="panorama-entry__fact">
          <span>{{ pageText.modeLabel }}</span>
          <strong>{{ pageText.modeValue }}</strong>
        </article>
        <article class="panorama-entry__fact">
          <span>{{ pageText.supportLabel }}</span>
          <strong>{{ pageText.supportValue }}</strong>
        </article>
      </div>

      <div class="panorama-entry__route">
        <span>{{ pageText.routeTitle }}</span>
        <div>
          <strong v-for="scene in routePreview" :key="scene.id">{{ scene.title }}</strong>
        </div>
      </div>
    </footer>
  </article>
</template>

<style scoped>
.panorama-entry {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  color: #f8f5ef;
  background: #0a0f12;
}

.panorama-entry__image,
.panorama-entry__veil,
.panorama-entry__flare {
  position: absolute;
  inset: 0;
}

.panorama-entry__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.06);
  filter: saturate(1.05);
}

.panorama-entry__veil {
  background:
    linear-gradient(180deg, rgba(5, 8, 10, 0.28), rgba(5, 8, 10, 0.8)),
    linear-gradient(90deg, rgba(5, 8, 10, 0.82), rgba(5, 8, 10, 0.18) 46%, rgba(5, 8, 10, 0.76));
}

.panorama-entry__flare {
  background:
    radial-gradient(circle at 22% 18%, rgba(255, 234, 190, 0.18), transparent 18%),
    radial-gradient(circle at 78% 24%, rgba(111, 160, 147, 0.18), transparent 22%),
    radial-gradient(circle at 82% 76%, rgba(209, 102, 72, 0.16), transparent 20%);
  mix-blend-mode: screen;
}

.panorama-entry__topbar,
.panorama-entry__center,
.panorama-entry__footer,
.panorama-entry__rail {
  position: relative;
  z-index: 1;
}

.panorama-entry__topbar {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem 1.75rem 0;
}

.panorama-entry__brand,
.panorama-entry__backlink,
.panorama-entry__rail span,
.panorama-entry__fact,
.panorama-entry__route {
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(8, 12, 15, 0.3);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.panorama-entry__brand {
  display: grid;
  gap: 0.2rem;
  padding: 0.95rem 1rem;
  border-radius: 24px;
}

.panorama-entry__brand span,
.panorama-entry__copy p,
.panorama-entry__fact span,
.panorama-entry__route span {
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(248, 245, 239, 0.72);
}

.panorama-entry__brand strong,
.panorama-entry__copy h1,
.panorama-entry__fact strong,
.panorama-entry__route strong {
  color: #fff;
}

.panorama-entry__backlink {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3rem;
  padding: 0 1.1rem;
  border-radius: 999px;
  color: #fff;
  text-decoration: none;
}

.panorama-entry__rail {
  position: absolute;
  top: 50%;
  right: 1.75rem;
  display: grid;
  gap: 0.85rem;
  transform: translateY(-50%);
}

.panorama-entry__rail span {
  display: inline-flex;
  justify-content: center;
  min-width: 3rem;
  padding: 0.95rem 0.8rem;
  border-radius: 999px;
  writing-mode: vertical-rl;
}

.panorama-entry__center {
  display: grid;
  place-items: center;
  min-height: calc(100vh - 15rem);
  padding: 3rem 1.75rem 13rem;
}

.panorama-entry__copy {
  width: min(680px, 100%);
  display: grid;
  justify-items: center;
  gap: 1rem;
  text-align: center;
}

.panorama-entry__copy h1 {
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(3rem, 8vw, 5.6rem);
  line-height: 0.96;
}

.panorama-entry__copy span {
  max-width: 42rem;
  line-height: 1.84;
  color: rgba(248, 245, 239, 0.86);
}

.panorama-entry__actions {
  padding-top: 0.8rem;
}

.panorama-entry__spotlights {
  width: min(980px, 100%);
  display: grid;
  gap: 0.85rem;
  padding-top: 1rem;
}

.panorama-entry__spotlights-head span {
  font-size: 0.72rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(248, 245, 239, 0.72);
}

.panorama-entry__spotlight-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.9rem;
}

.panorama-entry__spotlight-card {
  display: block;
  overflow: hidden;
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(8, 12, 15, 0.32);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  text-align: left;
  text-decoration: none;
  box-shadow: 0 18px 34px rgba(0, 0, 0, 0.18);
  transition:
    transform 0.24s ease,
    border-color 0.24s ease,
    box-shadow 0.24s ease;
}

.panorama-entry__spotlight-card:hover {
  transform: translateY(-4px);
  border-color: rgba(255, 255, 255, 0.24);
  box-shadow: 0 24px 40px rgba(0, 0, 0, 0.24);
}

.panorama-entry__spotlight-image {
  display: block;
  width: 100%;
  aspect-ratio: 1.65 / 1;
  object-fit: cover;
}

.panorama-entry__spotlight-copy {
  display: grid;
  gap: 0.35rem;
  padding: 0.9rem;
}

.panorama-entry__spotlight-copy strong {
  color: #fff;
  font-size: 1rem;
}

.panorama-entry__spotlight-copy span {
  font-size: 0.86rem;
  line-height: 1.7;
  color: rgba(248, 245, 239, 0.8);
}

.panorama-entry__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3.3rem;
  padding: 0 1.55rem;
  border-radius: 999px;
  text-decoration: none;
  color: #fff;
}

.panorama-entry__button--primary {
  background: linear-gradient(135deg, rgba(176, 61, 38, 0.96), rgba(216, 122, 92, 0.88));
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.24);
}

.panorama-entry__footer {
  position: absolute;
  left: 1.75rem;
  right: 1.75rem;
  bottom: 1.5rem;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(340px, 0.95fr);
  gap: 1rem;
}

.panorama-entry__facts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.panorama-entry__fact,
.panorama-entry__route {
  display: grid;
  gap: 0.5rem;
  padding: 1rem 1.05rem;
  border-radius: 24px;
}

.panorama-entry__route div {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.panorama-entry__route strong {
  padding: 0.65rem 0.8rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 0.88rem;
}

@media (max-width: 960px) {
  .panorama-entry__spotlight-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .panorama-entry__rail {
    position: static;
    transform: none;
    grid-auto-flow: column;
    justify-content: center;
    padding: 1rem 1.75rem 0;
  }

  .panorama-entry__rail span {
    writing-mode: horizontal-tb;
    min-width: auto;
  }

  .panorama-entry__footer {
    position: static;
    grid-template-columns: 1fr;
    padding: 0 1.75rem 1.5rem;
  }

  .panorama-entry__facts {
    grid-template-columns: 1fr;
  }

  .panorama-entry__center {
    min-height: auto;
    padding-bottom: 2rem;
  }
}

@media (max-width: 640px) {
  .panorama-entry {
    min-height: 100dvh;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .panorama-entry__spotlight-grid {
    display: flex;
    grid-template-columns: none;
    gap: 0.85rem;
    margin-right: -1rem;
    margin-left: -1rem;
    padding: 0 1rem 0.25rem;
    overflow-x: auto;
    scroll-padding-left: 1rem;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .panorama-entry__spotlight-grid::-webkit-scrollbar {
    display: none;
  }

  .panorama-entry__spotlight-card {
    flex: 0 0 min(82vw, 22rem);
    scroll-snap-align: start;
  }

  .panorama-entry__topbar {
    flex-direction: column;
    gap: 0.75rem;
    padding-top: calc(0.9rem + env(safe-area-inset-top, 0px));
  }

  .panorama-entry__brand {
    border-radius: 20px;
    padding: 0.78rem 0.9rem;
  }

  .panorama-entry__backlink {
    width: fit-content;
    min-height: 2.7rem;
    padding: 0 1rem;
  }

  .panorama-entry__copy h1 {
    font-size: clamp(2.4rem, 14vw, 4rem);
  }

  .panorama-entry__topbar,
  .panorama-entry__center,
  .panorama-entry__footer,
  .panorama-entry__rail {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .panorama-entry__center {
    place-items: start center;
    padding-top: 1.25rem;
    padding-bottom: 2rem;
  }

  .panorama-entry__copy {
    justify-items: stretch;
    text-align: left;
  }

  .panorama-entry__copy > p,
  .panorama-entry__copy > h1,
  .panorama-entry__copy > span {
    text-align: left;
  }

  .panorama-entry__actions {
    position: sticky;
    bottom: calc(0.85rem + env(safe-area-inset-bottom, 0px));
    z-index: 3;
    display: grid;
    padding: 0.3rem;
    border-radius: 999px;
    background: rgba(9, 13, 16, 0.46);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  .panorama-entry__button {
    width: 100%;
    min-height: 3.15rem;
  }

  .panorama-entry__spotlights {
    width: 100%;
  }

  .panorama-entry__footer {
    padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
  }
}
</style>
