<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { gardenDetailsSource } from '../data/gardenDetails';
import {
  liuyuanPanoramaCover,
  liuyuanPanoramaScenesSource,
  liuyuanPanoramaSpotlights,
} from '../data/liuyuanPanoramaTour';
import { resolveLocalized, useLanguage } from '../i18n';

const { language } = useLanguage();

const pageTextSource = {
  eyebrow: {
    zh: '留园全景漫游',
    en: 'Lingering Garden Panorama Tour',
  },
  subhead: {
    zh: '十三景串联 · 曲廊与庭院的连续叙事',
    en: 'Thirteen Stops · Corridors and courts in sequence',
  },
  title: {
    zh: '进入留园的层层框景',
    en: 'Enter Lingering Garden in layered frames',
  },
  intro: {
    zh: '以 13 个实景全景节点重建留园的游园节奏，支持拖拽旋转、热点解读与自动巡游。',
    en: 'Move through 13 real panorama nodes with drag navigation, hotspot notes, and autoplay.',
  },
  startAction: {
    zh: '开始漫游',
    en: 'Start Tour',
  },
  detailAction: {
    zh: '返回园林详情',
    en: 'Back to Detail',
  },
  routeTitle: {
    zh: '推荐阅读方式',
    en: 'Suggested Reading',
  },
  routeIntro: {
    zh: '先顺着曲廊建立叙事，再回头看门洞、花窗和山石怎样重组同一处景。',
    en: 'Follow the corridor first, then look back at how gateways, windows, and rockery reframe the same scene.',
  },
  sceneCountLabel: {
    zh: '全景节点',
    en: 'Scenes',
  },
  modeLabel: {
    zh: '浏览方式',
    en: 'Mode',
  },
  modeValue: {
    zh: '360° 漫游',
    en: '360 Roaming',
  },
  supportLabel: {
    zh: '适配设备',
    en: 'Devices',
  },
  supportValue: {
    zh: '电脑 / 手机',
    en: 'Desktop / Mobile',
  },
  spotlightTitle: {
    zh: '重点节点',
    en: 'Featured Stops',
  },
  sequenceTitle: {
    zh: '游线预览',
    en: 'Route Preview',
  },
};

const garden = computed(() => resolveLocalized(gardenDetailsSource.liuyuan, language.value));
const pageText = computed(() => resolveLocalized(pageTextSource, language.value));
const scenes = computed(() => liuyuanPanoramaScenesSource.map((scene) => resolveLocalized(scene, language.value)));
const spotlights = computed(() => liuyuanPanoramaSpotlights.map((item) => resolveLocalized(item, language.value)));
const routePreview = computed(() => scenes.value.slice(0, 6));
const backgroundImage = computed(() => liuyuanPanoramaCover || scenes.value[0]?.image || garden.value.heroImage);
</script>

<template>
  <article class="liuyuan-panorama-entry">
    <img :src="backgroundImage" :alt="garden.heroAlt || garden.name" class="liuyuan-panorama-entry__image" />
    <div class="liuyuan-panorama-entry__veil" />
    <div class="liuyuan-panorama-entry__texture" />

    <header class="liuyuan-panorama-entry__topbar">
      <div class="liuyuan-panorama-entry__brand">
        <span>{{ pageText.eyebrow }}</span>
        <strong>{{ garden.name }}</strong>
      </div>

      <RouterLink to="/liu" class="liuyuan-panorama-entry__backlink">
        {{ pageText.detailAction }}
      </RouterLink>
    </header>

    <main class="liuyuan-panorama-entry__content">
      <section class="liuyuan-panorama-entry__hero-panel">
        <p>{{ pageText.subhead }}</p>
        <h1>{{ pageText.title }}</h1>
        <span>{{ pageText.intro }}</span>

        <div class="liuyuan-panorama-entry__actions">
          <RouterLink
            :to="{ path: '/liu/panorama/viewer', query: { scene: 'entry' } }"
            class="liuyuan-panorama-entry__button liuyuan-panorama-entry__button--primary"
          >
            {{ pageText.startAction }}
          </RouterLink>
        </div>

        <section class="liuyuan-panorama-entry__route-card">
          <small>{{ pageText.routeTitle }}</small>
          <strong>{{ pageText.routeIntro }}</strong>
          <div class="liuyuan-panorama-entry__route-list">
            <span v-for="scene in routePreview" :key="scene.id">{{ scene.title }}</span>
          </div>
        </section>
      </section>

      <aside class="liuyuan-panorama-entry__side">
        <section class="liuyuan-panorama-entry__stats">
          <article class="liuyuan-panorama-entry__stat">
            <span>{{ pageText.sceneCountLabel }}</span>
            <strong>{{ scenes.length }}</strong>
          </article>
          <article class="liuyuan-panorama-entry__stat">
            <span>{{ pageText.modeLabel }}</span>
            <strong>{{ pageText.modeValue }}</strong>
          </article>
          <article class="liuyuan-panorama-entry__stat">
            <span>{{ pageText.supportLabel }}</span>
            <strong>{{ pageText.supportValue }}</strong>
          </article>
        </section>

        <section class="liuyuan-panorama-entry__spotlights">
          <header class="liuyuan-panorama-entry__section-head">
            <span>{{ pageText.spotlightTitle }}</span>
          </header>

          <div class="liuyuan-panorama-entry__spotlight-list">
            <RouterLink
              v-for="spot in spotlights"
              :key="spot.id"
              :to="{ path: '/liu/panorama/viewer', query: { scene: spot.id } }"
              class="liuyuan-panorama-entry__spotlight"
            >
              <img :src="spot.image" :alt="spot.title" loading="lazy" class="liuyuan-panorama-entry__spotlight-image" />
              <div class="liuyuan-panorama-entry__spotlight-copy">
                <strong>{{ spot.title }}</strong>
                <span>{{ spot.caption }}</span>
              </div>
            </RouterLink>
          </div>
        </section>
      </aside>
    </main>

    <footer class="liuyuan-panorama-entry__footer">
      <div class="liuyuan-panorama-entry__sequence">
        <small>{{ pageText.sequenceTitle }}</small>
        <div>
          <strong v-for="scene in scenes.slice(0, 8)" :key="scene.id">{{ scene.order }} {{ scene.title }}</strong>
        </div>
      </div>
    </footer>
  </article>
</template>

<style scoped>
.liuyuan-panorama-entry {
  position: relative;
  min-height: 100vh;
  min-height: 100svh;
  overflow: hidden;
  color: #fff6ee;
  background: #120d09;
}

.liuyuan-panorama-entry__image,
.liuyuan-panorama-entry__veil,
.liuyuan-panorama-entry__texture {
  position: absolute;
  inset: 0;
}

.liuyuan-panorama-entry__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.04);
  filter: saturate(1.02) contrast(1.02);
}

.liuyuan-panorama-entry__veil {
  background:
    linear-gradient(90deg, rgba(19, 13, 8, 0.92), rgba(19, 13, 8, 0.44) 42%, rgba(19, 13, 8, 0.82)),
    linear-gradient(180deg, rgba(19, 13, 8, 0.2), rgba(19, 13, 8, 0.86));
}

.liuyuan-panorama-entry__texture {
  background:
    radial-gradient(circle at 18% 20%, rgba(232, 184, 128, 0.16), transparent 18%),
    radial-gradient(circle at 80% 22%, rgba(255, 235, 214, 0.1), transparent 20%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.03), transparent 38%);
  mix-blend-mode: screen;
}

.liuyuan-panorama-entry__topbar,
.liuyuan-panorama-entry__content,
.liuyuan-panorama-entry__footer {
  position: relative;
  z-index: 1;
}

.liuyuan-panorama-entry__topbar {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem;
}

.liuyuan-panorama-entry__brand,
.liuyuan-panorama-entry__backlink,
.liuyuan-panorama-entry__hero-panel,
.liuyuan-panorama-entry__stat,
.liuyuan-panorama-entry__route-card,
.liuyuan-panorama-entry__spotlights,
.liuyuan-panorama-entry__sequence {
  border: 1px solid rgba(255, 237, 223, 0.12);
  background:
    linear-gradient(180deg, rgba(28, 18, 12, 0.76), rgba(18, 12, 8, 0.68)),
    rgba(18, 12, 8, 0.72);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.liuyuan-panorama-entry__brand {
  display: grid;
  gap: 0.2rem;
  padding: 0.9rem 1rem;
  border-radius: 24px;
}

.liuyuan-panorama-entry__brand span,
.liuyuan-panorama-entry__hero-panel p,
.liuyuan-panorama-entry__stat span,
.liuyuan-panorama-entry__section-head span,
.liuyuan-panorama-entry__route-card small,
.liuyuan-panorama-entry__sequence small {
  font-size: 0.74rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255, 239, 225, 0.72);
}

.liuyuan-panorama-entry__backlink,
.liuyuan-panorama-entry__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3rem;
  padding: 0 1.15rem;
  border-radius: 999px;
  color: #fff;
  text-decoration: none;
}

.liuyuan-panorama-entry__backlink {
  background: rgba(255, 248, 240, 0.06);
}

.liuyuan-panorama-entry__content {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(340px, 0.95fr);
  gap: 1rem;
  min-height: calc(100vh - 10rem);
  padding: 1rem 1.5rem 10rem;
}

.liuyuan-panorama-entry__hero-panel {
  align-self: start;
  display: grid;
  gap: 0.95rem;
  padding: 1.3rem;
  border-radius: 36px;
}

.liuyuan-panorama-entry__hero-panel h1 {
  margin: 0;
  font-family: var(--font-serif);
  font-size: clamp(3rem, 6vw, 5.5rem);
  line-height: 0.96;
}

.liuyuan-panorama-entry__hero-panel > span {
  max-width: 44rem;
  line-height: 1.82;
  color: rgba(255, 243, 232, 0.86);
}

.liuyuan-panorama-entry__actions {
  padding-top: 0.5rem;
}

.liuyuan-panorama-entry__button--primary {
  background: linear-gradient(135deg, rgba(138, 82, 41, 0.96), rgba(196, 138, 89, 0.88));
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.24);
}

.liuyuan-panorama-entry__route-card {
  display: grid;
  gap: 0.7rem;
  padding: 1rem 1.05rem;
  border-radius: 28px;
}

.liuyuan-panorama-entry__route-card strong {
  font-size: 1.04rem;
  line-height: 1.78;
}

.liuyuan-panorama-entry__route-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.liuyuan-panorama-entry__route-list span,
.liuyuan-panorama-entry__sequence strong {
  padding: 0.55rem 0.78rem;
  border-radius: 999px;
  background: rgba(255, 244, 235, 0.08);
}

.liuyuan-panorama-entry__side {
  display: grid;
  gap: 1rem;
  align-content: start;
}

.liuyuan-panorama-entry__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;
}

.liuyuan-panorama-entry__stat {
  display: grid;
  gap: 0.45rem;
  padding: 1rem;
  border-radius: 24px;
}

.liuyuan-panorama-entry__stat strong {
  line-height: 1.5;
}

.liuyuan-panorama-entry__spotlights {
  display: grid;
  gap: 0.9rem;
  padding: 1rem;
  border-radius: 30px;
}

.liuyuan-panorama-entry__spotlight-list {
  display: grid;
  gap: 0.85rem;
}

.liuyuan-panorama-entry__spotlight {
  display: grid;
  grid-template-columns: 132px minmax(0, 1fr);
  gap: 0.9rem;
  align-items: center;
  padding: 0.6rem;
  border-radius: 22px;
  background: rgba(255, 248, 242, 0.05);
  border: 1px solid rgba(255, 235, 223, 0.08);
  color: inherit;
  text-decoration: none;
  transition:
    transform 0.24s ease,
    border-color 0.24s ease,
    background-color 0.24s ease;
}

.liuyuan-panorama-entry__spotlight:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 235, 223, 0.16);
  background: rgba(255, 248, 242, 0.08);
}

.liuyuan-panorama-entry__spotlight-image {
  width: 100%;
  aspect-ratio: 1.15 / 1;
  object-fit: cover;
  border-radius: 18px;
}

.liuyuan-panorama-entry__spotlight-copy {
  display: grid;
  gap: 0.38rem;
}

.liuyuan-panorama-entry__spotlight-copy strong {
  font-size: 1.02rem;
}

.liuyuan-panorama-entry__spotlight-copy span {
  color: rgba(255, 242, 231, 0.8);
  line-height: 1.68;
}

.liuyuan-panorama-entry__footer {
  position: absolute;
  left: 1.5rem;
  right: 1.5rem;
  bottom: 1.5rem;
}

.liuyuan-panorama-entry__sequence {
  display: grid;
  gap: 0.9rem;
  padding: 1rem 1.05rem;
  border-radius: 30px;
}

.liuyuan-panorama-entry__sequence div {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

@media (max-width: 980px) {
  .liuyuan-panorama-entry__content {
    grid-template-columns: 1fr;
    min-height: auto;
    padding-bottom: 2rem;
  }

  .liuyuan-panorama-entry__stats {
    grid-template-columns: 1fr;
  }

  .liuyuan-panorama-entry__footer {
    position: static;
    padding: 0 1.5rem 1.5rem;
  }
}

@media (max-width: 720px) {
  .liuyuan-panorama-entry__topbar {
    flex-direction: column;
    padding: 1rem;
  }

  .liuyuan-panorama-entry__content {
    padding: 0.5rem 1rem 2rem;
  }

  .liuyuan-panorama-entry__hero-panel h1 {
    font-size: clamp(2.5rem, 13vw, 4rem);
  }

  .liuyuan-panorama-entry__spotlight {
    grid-template-columns: 1fr;
  }

  .liuyuan-panorama-entry__footer {
    padding: 0 1rem 1rem;
  }
}

@media (max-width: 430px) {
  .liuyuan-panorama-entry__topbar {
    gap: 0.75rem;
    padding: calc(0.9rem + env(safe-area-inset-top, 0px)) 0.85rem 0.75rem;
  }

  .liuyuan-panorama-entry__content {
    gap: 0.85rem;
    padding: 0.2rem 0.85rem 1.4rem;
  }

  .liuyuan-panorama-entry__hero-panel,
  .liuyuan-panorama-entry__spotlights {
    gap: 0.8rem;
    padding: 1rem;
    border-radius: 24px;
  }

  .liuyuan-panorama-entry__hero-panel h1 {
    font-size: clamp(2.2rem, 12vw, 3.2rem);
    line-height: 1.02;
  }

  .liuyuan-panorama-entry__hero-panel > span,
  .liuyuan-panorama-entry__route-card strong,
  .liuyuan-panorama-entry__spotlight-copy span {
    line-height: 1.62;
  }

  .liuyuan-panorama-entry__route-card {
    padding: 0.9rem;
    border-radius: 22px;
  }

  .liuyuan-panorama-entry__route-card strong {
    font-size: 0.96rem;
  }

  .liuyuan-panorama-entry__stats {
    gap: 0.65rem;
  }

  .liuyuan-panorama-entry__stat {
    padding: 0.85rem 0.9rem;
    border-radius: 18px;
  }

  .liuyuan-panorama-entry__spotlight {
    gap: 0.7rem;
    padding: 0.55rem;
    border-radius: 18px;
  }

  .liuyuan-panorama-entry__spotlight-image {
    aspect-ratio: 1.5 / 1;
    border-radius: 14px;
  }

  .liuyuan-panorama-entry__spotlight-copy strong {
    font-size: 0.96rem;
  }

  .liuyuan-panorama-entry__route-list span,
  .liuyuan-panorama-entry__sequence strong {
    padding: 0.48rem 0.68rem;
    font-size: 0.82rem;
  }

  .liuyuan-panorama-entry__footer {
    padding: 0 0.85rem calc(0.85rem + env(safe-area-inset-bottom, 0px));
  }

  .liuyuan-panorama-entry__sequence {
    gap: 0.7rem;
    padding: 0.9rem;
    border-radius: 22px;
  }
}
</style>
