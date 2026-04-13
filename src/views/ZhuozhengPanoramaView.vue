<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { gardenDetailsSource } from '../data/gardenDetails';
import { resolveLocalized, useLanguage } from '../i18n';

const { language } = useLanguage();

const pageTextSource = {
  eyebrow: {
    zh: '实景漫游入口',
    en: 'Panoramic Entrance',
    ja: 'Panoramic Entrance',
    ko: 'Panoramic Entrance',
  },
  title: {
    zh: '拙政园全景漫游',
    en: 'Humble Administrator\'s Garden Panorama',
    ja: 'Humble Administrator\'s Garden Panorama',
    ko: 'Humble Administrator\'s Garden Panorama',
  },
  intro: {
    zh: '先把入口做成真正的全屏实景页，再由开始游览进入独立 viewer。这一层只负责气质、品牌和进入仪式感。',
    en: 'Start with a true full-screen entry page, then enter a dedicated viewer from here.',
    ja: 'Start with a true full-screen entry page, then enter a dedicated viewer from here.',
    ko: 'Start with a true full-screen entry page, then enter a dedicated viewer from here.',
  },
  startAction: {
    zh: '开始游览',
    en: 'Start Tour',
    ja: 'Start Tour',
    ko: 'Start Tour',
  },
  backAction: {
    zh: '返回园林详情',
    en: 'Back to Garden Detail',
    ja: 'Back to Garden Detail',
    ko: 'Back to Garden Detail',
  },
  railScenes: {
    zh: '节点',
    en: 'Scenes',
    ja: 'Scenes',
    ko: 'Scenes',
  },
  railGuide: {
    zh: '导览',
    en: 'Guide',
    ja: 'Guide',
    ko: 'Guide',
  },
  railInfo: {
    zh: '信息',
    en: 'Info',
    ja: 'Info',
    ko: 'Info',
  },
  centerLabel: {
    zh: '数字导览入口',
    en: 'Digital Tour Entry',
    ja: 'Digital Tour Entry',
    ko: 'Digital Tour Entry',
  },
  bottomLabel: {
    zh: '入口信息',
    en: 'Entry Facts',
    ja: 'Entry Facts',
    ko: 'Entry Facts',
  },
  lowerGuideTitle: {
    zh: '建议游览顺序',
    en: 'Suggested Route',
    ja: 'Suggested Route',
    ko: 'Suggested Route',
  },
};

const garden = computed(() => resolveLocalized(gardenDetailsSource.zhuozhengyuan, language.value));
const pageText = computed(() => resolveLocalized(pageTextSource, language.value));
const routePreview = computed(() => (garden.value.itinerary || []).slice(0, 3));
const heroFacts = computed(() => (garden.value.facts || []).slice(0, 3));
</script>

<template>
  <article class="panorama-entry">
    <img :src="garden.heroImage" :alt="garden.heroAlt || garden.name" class="panorama-entry__image" />
    <div class="panorama-entry__veil" />
    <div class="panorama-entry__grain" />

    <header class="panorama-entry__topbar">
      <RouterLink to="/zhuozheng" class="panorama-entry__brand">
        <span>拙政园</span>
        <strong>{{ pageText.eyebrow }}</strong>
      </RouterLink>

      <div class="panorama-entry__meta">
        <span>{{ garden.englishName }}</span>
        <span>{{ pageText.bottomLabel }}</span>
      </div>
    </header>

    <nav class="panorama-entry__rail" aria-label="Panorama tools">
      <span>{{ pageText.railScenes }}</span>
      <span>{{ pageText.railGuide }}</span>
      <span>{{ pageText.railInfo }}</span>
    </nav>

    <main class="panorama-entry__center">
      <div class="panorama-entry__copy">
        <p>{{ pageText.centerLabel }}</p>
        <h1>{{ pageText.title }}</h1>
        <strong>{{ garden.name }}</strong>
        <span>{{ pageText.intro }}</span>

        <div class="panorama-entry__actions">
          <RouterLink to="/zhuozheng/panorama/viewer" class="panorama-entry__button panorama-entry__button--primary">
            {{ pageText.startAction }}
          </RouterLink>
          <RouterLink to="/zhuozheng" class="panorama-entry__button panorama-entry__button--ghost">
            {{ pageText.backAction }}
          </RouterLink>
        </div>
      </div>
    </main>

    <footer class="panorama-entry__footer">
      <div class="panorama-entry__facts">
        <article v-for="fact in heroFacts" :key="fact.label" class="panorama-entry__fact">
          <span>{{ fact.label }}</span>
          <strong>{{ fact.value }}</strong>
        </article>
      </div>

      <div class="panorama-entry__route">
        <span>{{ pageText.lowerGuideTitle }}</span>
        <div>
          <strong v-for="item in routePreview" :key="item.title">{{ item.title }}</strong>
        </div>
      </div>
    </footer>
  </article>
</template>

<style scoped>
.panorama-entry {
  position: relative;
  min-height: 100vh;
  overflow: clip;
  color: #faf7f1;
  background: #0d1216;
}

.panorama-entry__image,
.panorama-entry__veil,
.panorama-entry__grain {
  position: absolute;
  inset: 0;
}

.panorama-entry__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.04);
}

.panorama-entry__veil {
  background:
    linear-gradient(180deg, rgba(7, 10, 12, 0.16) 0%, rgba(7, 10, 12, 0.52) 100%),
    linear-gradient(90deg, rgba(7, 10, 12, 0.76) 0%, rgba(7, 10, 12, 0.16) 48%, rgba(7, 10, 12, 0.62) 100%);
}

.panorama-entry__grain {
  opacity: 0.22;
  background:
    radial-gradient(circle at 20% 18%, rgba(255, 255, 255, 0.08), transparent 22%),
    radial-gradient(circle at 82% 22%, rgba(169, 57, 42, 0.18), transparent 24%),
    radial-gradient(circle at 76% 82%, rgba(95, 127, 114, 0.18), transparent 24%);
  mix-blend-mode: screen;
  pointer-events: none;
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
.panorama-entry__meta,
.panorama-entry__rail span,
.panorama-entry__button,
.panorama-entry__fact,
.panorama-entry__route {
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(8, 12, 15, 0.28);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.panorama-entry__brand {
  display: grid;
  gap: 0.18rem;
  padding: 0.9rem 1rem;
  border-radius: 24px;
  color: white;
  text-decoration: none;
}

.panorama-entry__brand span,
.panorama-entry__meta span,
.panorama-entry__copy p,
.panorama-entry__fact span,
.panorama-entry__route span {
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(250, 247, 241, 0.7);
}

.panorama-entry__brand strong,
.panorama-entry__meta {
  font-size: 0.9rem;
}

.panorama-entry__meta {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.9rem 1rem;
  border-radius: 999px;
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
  padding: 1rem 0.85rem;
  border-radius: 999px;
  writing-mode: vertical-rl;
}

.panorama-entry__center {
  display: grid;
  place-items: center;
  min-height: calc(100vh - 13rem);
  padding: 3rem 1.75rem 12rem;
}

.panorama-entry__copy {
  width: min(720px, 100%);
  display: grid;
  justify-items: center;
  gap: 0.95rem;
  text-align: center;
}

.panorama-entry__copy h1,
.panorama-entry__copy strong {
  margin: 0;
  font-family: var(--font-serif);
}

.panorama-entry__copy h1 {
  font-size: clamp(3rem, 8vw, 5.8rem);
  line-height: 0.96;
}

.panorama-entry__copy strong {
  font-size: clamp(1.1rem, 2vw, 1.5rem);
  letter-spacing: 0.08em;
}

.panorama-entry__copy span {
  max-width: 42rem;
  color: rgba(250, 247, 241, 0.82);
  line-height: 1.8;
}

.panorama-entry__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.9rem;
  padding-top: 0.9rem;
}

.panorama-entry__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3.2rem;
  padding: 0 1.4rem;
  border-radius: 999px;
  color: white;
  text-decoration: none;
  transition: transform 0.24s ease, background-color 0.24s ease, border-color 0.24s ease;
}

.panorama-entry__button:hover {
  transform: translateY(-2px);
}

.panorama-entry__button--primary {
  background: rgba(158, 41, 28, 0.84);
  border-color: rgba(255, 220, 214, 0.28);
}

.panorama-entry__button--ghost {
  background: rgba(8, 12, 15, 0.36);
}

.panorama-entry__footer {
  position: absolute;
  left: 1.75rem;
  right: 1.75rem;
  bottom: 1.5rem;
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(320px, 0.7fr);
  gap: 1rem;
}

.panorama-entry__facts {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.panorama-entry__fact,
.panorama-entry__route {
  padding: 1rem 1.1rem;
  border-radius: 24px;
}

.panorama-entry__fact {
  display: grid;
  gap: 0.38rem;
}

.panorama-entry__fact strong,
.panorama-entry__route strong {
  color: white;
}

.panorama-entry__route {
  display: grid;
  gap: 0.7rem;
}

.panorama-entry__route div {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.panorama-entry__route strong {
  padding: 0.7rem 0.8rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 0.88rem;
}

@media (max-width: 960px) {
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
  .panorama-entry__topbar {
    flex-direction: column;
  }

  .panorama-entry__copy h1 {
    font-size: clamp(2.4rem, 14vw, 4rem);
  }
}
</style>
