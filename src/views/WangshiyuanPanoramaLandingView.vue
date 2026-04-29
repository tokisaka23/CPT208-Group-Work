<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { gardenDetailsSource } from '../data/gardenDetails';
import {
  wangshiyuanPanoramaCover,
  wangshiyuanPanoramaCoverFallback,
  wangshiyuanPanoramaScenesSource,
  wangshiyuanPanoramaSpotlights,
} from '../data/wangshiyuanPanoramaTour';
import { resolveLocalized, useLanguage } from '../i18n';
import { applyImageFallback } from '../shared/imageFallback';

const { language } = useLanguage();

const pageTextSource = {
  eyebrow: { zh: '网师园全景漫游', en: 'Master of Nets Panorama Tour' },
  subhead: { zh: '十四景慢读 · 更静、更近、更深', en: 'Fourteen Stops · Quiet and Intimate' },
  title: { zh: '进入网师园的静景层次', en: 'Enter the quiet depth of Master of Nets' },
  intro: {
    zh: '基于 14 个实景节点组织全景漫游，支持拖拽旋转、热点讲解、场景跳转与自动巡游。',
    en: 'A fourteen-stop panorama tour with drag navigation, hotspot notes, scene jumping, and autoplay.',
  },
  startAction: { zh: '开始漫游', en: 'Start Tour' },
  detailAction: { zh: '返回园林详情', en: 'Back to Detail' },
  routeTitle: { zh: '建议阅读顺序', en: 'Suggested Reading Order' },
  routeIntro: {
    zh: '先读入口与厅堂比例，再贴近窗棂与栏杆，最后回到池边边界感受网师园的安静。',
    en: 'Begin with threshold and hall proportions, move close to details, and end by the pond edge.',
  },
  sceneCountLabel: { zh: '全景节点', en: 'Scenes' },
  modeLabel: { zh: '浏览方式', en: 'Mode' },
  modeValue: { zh: '360° 漫游', en: '360 Roaming' },
  supportLabel: { zh: '适配设备', en: 'Devices' },
  supportValue: { zh: '电脑 / 手机', en: 'Desktop / Mobile' },
  spotlightTitle: { zh: '推荐切入节点', en: 'Featured Stops' },
  sequenceTitle: { zh: '游线预览', en: 'Route Preview' },
};

const garden = computed(() => resolveLocalized(gardenDetailsSource.wangshiyuan, language.value));
const pageText = computed(() => resolveLocalized(pageTextSource, language.value));
const scenes = computed(() => wangshiyuanPanoramaScenesSource.map((scene) => resolveLocalized(scene, language.value)));
const spotlights = computed(() => wangshiyuanPanoramaSpotlights.map((item) => resolveLocalized(item, language.value)));
const routePreview = computed(() => scenes.value.slice(0, 6));
const backgroundImage = computed(() => wangshiyuanPanoramaCover || scenes.value[0]?.image || garden.value.heroImage);
const backgroundImageFallback = computed(() => wangshiyuanPanoramaCoverFallback || scenes.value[0]?.fallbackImage || garden.value.heroImage);
const handleImageError = (event, fallbackImage) => {
  applyImageFallback(event, fallbackImage);
};
</script>

<template>
  <article class="wangshi-panorama-entry">
    <img
      :src="backgroundImage"
      :alt="garden.heroAlt || garden.name"
      class="wangshi-panorama-entry__image"
      @error="handleImageError($event, backgroundImageFallback)"
    />
    <div class="wangshi-panorama-entry__veil" />
    <div class="wangshi-panorama-entry__wash" />

    <header class="wangshi-panorama-entry__topbar">
      <div class="wangshi-panorama-entry__brand">
        <span>{{ pageText.eyebrow }}</span>
        <strong>{{ garden.name }}</strong>
      </div>

      <RouterLink to="/wangshi" class="wangshi-panorama-entry__backlink">
        {{ pageText.detailAction }}
      </RouterLink>
    </header>

    <main class="wangshi-panorama-entry__content">
      <section class="wangshi-panorama-entry__hero-panel">
        <p>{{ pageText.subhead }}</p>
        <h1>{{ pageText.title }}</h1>
        <span>{{ pageText.intro }}</span>

        <div class="wangshi-panorama-entry__actions">
          <RouterLink
            :to="{ path: '/wangshi/panorama/viewer', query: { scene: 'gate' } }"
            class="wangshi-panorama-entry__button wangshi-panorama-entry__button--primary"
          >
            {{ pageText.startAction }}
          </RouterLink>
        </div>

        <section class="wangshi-panorama-entry__route-card">
          <small>{{ pageText.routeTitle }}</small>
          <strong>{{ pageText.routeIntro }}</strong>
          <div class="wangshi-panorama-entry__route-list">
            <span v-for="scene in routePreview" :key="scene.id">{{ scene.title }}</span>
          </div>
        </section>
      </section>

      <aside class="wangshi-panorama-entry__side">
        <section class="wangshi-panorama-entry__stats">
          <article class="wangshi-panorama-entry__stat">
            <span>{{ pageText.sceneCountLabel }}</span>
            <strong>{{ scenes.length }}</strong>
          </article>
          <article class="wangshi-panorama-entry__stat">
            <span>{{ pageText.modeLabel }}</span>
            <strong>{{ pageText.modeValue }}</strong>
          </article>
          <article class="wangshi-panorama-entry__stat">
            <span>{{ pageText.supportLabel }}</span>
            <strong>{{ pageText.supportValue }}</strong>
          </article>
        </section>

        <section class="wangshi-panorama-entry__spotlights">
          <header class="wangshi-panorama-entry__section-head">
            <span>{{ pageText.spotlightTitle }}</span>
          </header>

          <div class="wangshi-panorama-entry__spotlight-list">
            <RouterLink
              v-for="spot in spotlights"
              :key="spot.id"
              :to="{ path: '/wangshi/panorama/viewer', query: { scene: spot.id } }"
              class="wangshi-panorama-entry__spotlight"
            >
              <img
                :src="spot.image"
                :alt="spot.title"
                loading="lazy"
                class="wangshi-panorama-entry__spotlight-image"
                @error="handleImageError($event, spot.fallbackImage)"
              />
              <div class="wangshi-panorama-entry__spotlight-copy">
                <strong>{{ spot.title }}</strong>
                <span>{{ spot.caption }}</span>
              </div>
            </RouterLink>
          </div>
        </section>
      </aside>
    </main>

    <footer class="wangshi-panorama-entry__footer">
      <div class="wangshi-panorama-entry__sequence">
        <small>{{ pageText.sequenceTitle }}</small>
        <div>
          <strong v-for="scene in scenes.slice(0, 8)" :key="scene.id">{{ scene.order }} {{ scene.title }}</strong>
        </div>
      </div>
    </footer>
  </article>
</template>

<style scoped>
.wangshi-panorama-entry {
  position: relative;
  min-height: 100vh;
  min-height: 100svh;
  overflow: hidden;
  color: #fffaf3;
  background: #151310;
}

.wangshi-panorama-entry__image,
.wangshi-panorama-entry__veil,
.wangshi-panorama-entry__wash {
  position: absolute;
  inset: 0;
}

.wangshi-panorama-entry__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.05);
  filter: saturate(0.95) contrast(1.02);
}

.wangshi-panorama-entry__veil {
  background:
    linear-gradient(90deg, rgba(21, 19, 16, 0.92), rgba(21, 19, 16, 0.48) 44%, rgba(21, 19, 16, 0.84)),
    linear-gradient(180deg, rgba(21, 19, 16, 0.24), rgba(21, 19, 16, 0.88));
}

.wangshi-panorama-entry__wash {
  background:
    radial-gradient(circle at 22% 18%, rgba(146, 163, 126, 0.2), transparent 18%),
    radial-gradient(circle at 82% 20%, rgba(159, 63, 52, 0.18), transparent 20%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.04), transparent 40%);
  mix-blend-mode: screen;
}

.wangshi-panorama-entry__topbar,
.wangshi-panorama-entry__content,
.wangshi-panorama-entry__footer {
  position: relative;
  z-index: 1;
}

.wangshi-panorama-entry__topbar {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem;
}

.wangshi-panorama-entry__brand,
.wangshi-panorama-entry__backlink,
.wangshi-panorama-entry__hero-panel,
.wangshi-panorama-entry__stat,
.wangshi-panorama-entry__route-card,
.wangshi-panorama-entry__spotlights,
.wangshi-panorama-entry__sequence {
  border: 1px solid rgba(255, 245, 232, 0.12);
  background:
    linear-gradient(180deg, rgba(40, 33, 28, 0.68), rgba(24, 20, 17, 0.52)),
    rgba(24, 20, 17, 0.56);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 18px 44px rgba(0, 0, 0, 0.18);
}

.wangshi-panorama-entry__brand {
  display: grid;
  gap: 0.24rem;
  padding: 0.9rem 1rem;
  border-radius: 24px;
}

.wangshi-panorama-entry__brand span,
.wangshi-panorama-entry__hero-panel p,
.wangshi-panorama-entry__stat span,
.wangshi-panorama-entry__section-head span,
.wangshi-panorama-entry__route-card small,
.wangshi-panorama-entry__sequence small {
  font-size: 0.74rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255, 242, 227, 0.72);
}

.wangshi-panorama-entry__backlink,
.wangshi-panorama-entry__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3rem;
  padding: 0 1.15rem;
  border-radius: 999px;
  color: #fff;
  text-decoration: none;
}

.wangshi-panorama-entry__backlink {
  background: rgba(255, 248, 240, 0.07);
}

.wangshi-panorama-entry__content {
  display: grid;
  grid-template-columns: minmax(0, 1.04fr) minmax(340px, 0.96fr);
  gap: 1rem;
  min-height: calc(100vh - 10rem);
  padding: 1rem 1.5rem 10rem;
}

.wangshi-panorama-entry__hero-panel {
  align-self: start;
  display: grid;
  gap: 0.95rem;
  padding: 1.35rem;
  border-radius: 34px;
}

.wangshi-panorama-entry__hero-panel h1 {
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(3rem, 6vw, 5.4rem);
  line-height: 0.96;
}

.wangshi-panorama-entry__hero-panel > span {
  max-width: 44rem;
  line-height: 1.84;
  color: rgba(255, 245, 236, 0.84);
}

.wangshi-panorama-entry__actions {
  padding-top: 0.45rem;
}

.wangshi-panorama-entry__button--primary {
  background: linear-gradient(135deg, rgba(125, 56, 44, 0.96), rgba(170, 96, 79, 0.88));
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.24);
}

.wangshi-panorama-entry__route-card {
  display: grid;
  gap: 0.72rem;
  padding: 1rem 1.05rem;
  border-radius: 28px;
}

.wangshi-panorama-entry__route-card strong {
  font-size: 1.04rem;
  line-height: 1.78;
}

.wangshi-panorama-entry__route-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.wangshi-panorama-entry__route-list span,
.wangshi-panorama-entry__sequence strong {
  padding: 0.55rem 0.78rem;
  border-radius: 999px;
  background: rgba(255, 247, 238, 0.08);
}

.wangshi-panorama-entry__side {
  display: grid;
  gap: 1rem;
  align-content: start;
}

.wangshi-panorama-entry__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;
}

.wangshi-panorama-entry__stat {
  display: grid;
  gap: 0.45rem;
  padding: 1rem;
  border-radius: 24px;
}

.wangshi-panorama-entry__spotlights {
  display: grid;
  gap: 0.9rem;
  padding: 1rem;
  border-radius: 30px;
}

.wangshi-panorama-entry__spotlight-list {
  display: grid;
  gap: 0.85rem;
}

.wangshi-panorama-entry__spotlight {
  display: grid;
  grid-template-columns: 132px minmax(0, 1fr);
  gap: 0.9rem;
  align-items: center;
  padding: 0.6rem;
  border-radius: 22px;
  background: rgba(255, 249, 243, 0.05);
  border: 1px solid rgba(255, 238, 224, 0.08);
  color: inherit;
  text-decoration: none;
  transition:
    transform 0.24s ease,
    border-color 0.24s ease,
    background-color 0.24s ease;
}

.wangshi-panorama-entry__spotlight:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 238, 224, 0.16);
  background: rgba(255, 249, 243, 0.08);
}

.wangshi-panorama-entry__spotlight-image {
  width: 100%;
  aspect-ratio: 1.15 / 1;
  object-fit: cover;
  border-radius: 18px;
}

.wangshi-panorama-entry__spotlight-copy {
  display: grid;
  gap: 0.38rem;
}

.wangshi-panorama-entry__spotlight-copy strong {
  font-size: 1.02rem;
}

.wangshi-panorama-entry__spotlight-copy span {
  color: rgba(255, 244, 235, 0.8);
  line-height: 1.68;
}

.wangshi-panorama-entry__footer {
  position: absolute;
  left: 1.5rem;
  right: 1.5rem;
  bottom: 1.5rem;
}

.wangshi-panorama-entry__sequence {
  display: grid;
  gap: 0.9rem;
  padding: 1rem 1.05rem;
  border-radius: 30px;
}

.wangshi-panorama-entry__sequence div {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

@media (max-width: 980px) {
  .wangshi-panorama-entry__content {
    grid-template-columns: 1fr;
    min-height: auto;
    padding-bottom: 2rem;
  }

  .wangshi-panorama-entry__stats {
    grid-template-columns: 1fr;
  }

  .wangshi-panorama-entry__footer {
    position: static;
    padding: 0 1.5rem 1.5rem;
  }
}

@media (max-width: 720px) {
  .wangshi-panorama-entry__topbar {
    flex-direction: column;
    padding: 1rem;
  }

  .wangshi-panorama-entry__content {
    padding: 0.5rem 1rem 2rem;
  }

  .wangshi-panorama-entry__hero-panel h1 {
    font-size: clamp(2.4rem, 13vw, 4rem);
  }

  .wangshi-panorama-entry__spotlight {
    grid-template-columns: 1fr;
  }

  .wangshi-panorama-entry__footer {
    padding: 0 1rem 1rem;
  }
}

@media (max-width: 640px) {
  .wangshi-panorama-entry {
    min-height: 100dvh;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
  }

  .wangshi-panorama-entry__topbar {
    gap: 0.75rem;
    padding-top: calc(0.9rem + env(safe-area-inset-top, 0px));
  }

  .wangshi-panorama-entry__brand {
    border-radius: 20px;
    padding: 0.78rem 0.9rem;
  }

  .wangshi-panorama-entry__backlink {
    width: fit-content;
    min-height: 2.7rem;
    padding: 0 1rem;
  }

  .wangshi-panorama-entry__content {
    padding-bottom: 2rem;
  }

  .wangshi-panorama-entry__hero-panel {
    border-radius: 26px;
  }

  .wangshi-panorama-entry__actions {
    position: sticky;
    bottom: calc(0.85rem + env(safe-area-inset-bottom, 0px));
    z-index: 3;
    display: grid;
    padding: 0.3rem;
    border-radius: 999px;
    background: rgba(20, 16, 12, 0.52);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  .wangshi-panorama-entry__button {
    width: 100%;
    min-height: 3.15rem;
  }

  .wangshi-panorama-entry__spotlight-list {
    display: flex;
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

  .wangshi-panorama-entry__spotlight-list::-webkit-scrollbar {
    display: none;
  }

  .wangshi-panorama-entry__spotlight {
    flex: 0 0 min(82vw, 22rem);
    grid-template-columns: 1fr;
    scroll-snap-align: start;
  }

  .wangshi-panorama-entry__spotlight-image {
    aspect-ratio: 1.45 / 1;
  }
}

@media (max-width: 430px) {
  .wangshi-panorama-entry__topbar {
    gap: 0.75rem;
    padding: calc(0.9rem + env(safe-area-inset-top, 0px)) 0.85rem 0.75rem;
  }

  .wangshi-panorama-entry__content {
    gap: 0.85rem;
    padding: 0.2rem 0.85rem 1.4rem;
  }

  .wangshi-panorama-entry__hero-panel,
  .wangshi-panorama-entry__spotlights {
    gap: 0.8rem;
    padding: 1rem;
    border-radius: 24px;
  }

  .wangshi-panorama-entry__hero-panel h1 {
    font-size: clamp(2.1rem, 11.5vw, 3rem);
    line-height: 1.03;
  }

  .wangshi-panorama-entry__hero-panel > span,
  .wangshi-panorama-entry__route-card strong,
  .wangshi-panorama-entry__spotlight-copy span {
    line-height: 1.62;
  }

  .wangshi-panorama-entry__route-card {
    padding: 0.9rem;
    border-radius: 22px;
  }

  .wangshi-panorama-entry__route-card strong {
    font-size: 0.96rem;
  }

  .wangshi-panorama-entry__stats {
    gap: 0.65rem;
  }

  .wangshi-panorama-entry__stat {
    padding: 0.85rem 0.9rem;
    border-radius: 18px;
  }

  .wangshi-panorama-entry__spotlight {
    gap: 0.7rem;
    padding: 0.55rem;
    border-radius: 18px;
  }

  .wangshi-panorama-entry__spotlight-image {
    aspect-ratio: 1.5 / 1;
    border-radius: 14px;
  }

  .wangshi-panorama-entry__spotlight-copy strong {
    font-size: 0.96rem;
  }

  .wangshi-panorama-entry__route-list span,
  .wangshi-panorama-entry__sequence strong {
    padding: 0.48rem 0.68rem;
    font-size: 0.82rem;
  }

  .wangshi-panorama-entry__footer {
    padding: 0 0.85rem calc(0.85rem + env(safe-area-inset-bottom, 0px));
  }

  .wangshi-panorama-entry__sequence {
    gap: 0.7rem;
    padding: 0.9rem;
    border-radius: 22px;
  }
}
</style>
