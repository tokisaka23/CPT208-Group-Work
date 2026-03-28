<script setup>
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import ScenicMapDialog from './maps/ScenicMapDialog.vue';
import { resolveSuzhouPoi } from '../data/poiMapData';

const props = defineProps({
  garden: {
    type: Object,
    required: true,
  },
});

const legacyRouteMap = {
  '#home': '/',
  '#/gardens/zhuozhengyuan': '/zhuozheng',
  '#/gardens/liuyuan': '/liu',
  '#/gardens/wangshiyuan': '/wangshi',
};

const isExternalLink = (target) => typeof target === 'string' && /^(https?:)?\/\//.test(target);

const resolveRouteTarget = (target) => {
  if (!target) return '/';
  if (typeof target !== 'string') return target;

  if (legacyRouteMap[target]) {
    return legacyRouteMap[target];
  }

  if (target.startsWith('#/')) {
    return target.slice(1);
  }

  return target;
};

const resolveLinkComponent = (target) => (isExternalLink(target) ? 'a' : RouterLink);

const resolveLinkProps = (target) => {
  if (isExternalLink(target)) {
    return { href: target };
  }

  return { to: resolveRouteTarget(target) };
};

const design = computed(() => props.garden.design || {});
const variant = computed(() => design.value.variant || 'zhuozheng');
const galleryItems = computed(() => props.garden.gallery || []);
const floatingTags = computed(() => design.value.floatingTags || props.garden.badges || []);
const mapVisible = ref(false);
const resolvedPoi = computed(() => (
  resolveSuzhouPoi(props.garden.mapSlug || props.garden.slug || props.garden.name)
));

const themeStyle = computed(() => ({
  '--garden-accent': design.value.accent || '#5F7F72',
  '--garden-accent-rgb': design.value.accentRgb || '95, 127, 114',
  '--garden-secondary': design.value.secondary || design.value.accent || '#5F7F72',
  '--garden-secondary-rgb': design.value.secondaryRgb || design.value.accentRgb || '95, 127, 114',
  '--garden-paper': design.value.paper || 'rgba(255, 255, 255, 0.78)',
  '--garden-paper-strong': design.value.paperStrong || 'rgba(255, 255, 255, 0.9)',
  '--garden-muted': design.value.muted || 'rgba(68, 64, 60, 0.84)',
  '--garden-shadow': design.value.shadow || '0 32px 80px rgba(28, 25, 23, 0.14)',
}));

const resolveGalleryImage = (item) => item?.src || props.garden.heroImage;
const resolveGalleryAlt = (item) => item?.alt || item?.title || props.garden.heroAlt || props.garden.name;
const galleryCardClass = (item) => ['gallery-card', `gallery-card--${item?.ratio || 'landscape'}`];
</script>

<template>
  <article
    :class="['garden-detail-page', 'page-shell', `garden-detail-page--${variant}`]"
    :style="themeStyle"
  >
    <span v-if="design.watermark" class="detail-watermark" aria-hidden="true">{{ design.watermark }}</span>

    <section class="detail-hero">
      <div class="detail-hero-media">
        <div class="detail-hero-image-shell">
          <img
            :src="garden.heroImage"
            :alt="garden.heroAlt || garden.name"
            class="detail-hero-image"
            :style="{ objectPosition: design.heroImagePosition || 'center center' }"
          />
        </div>

        <div v-if="floatingTags.length" class="detail-floating-tags" aria-hidden="true">
          <span v-for="tag in floatingTags.slice(0, 3)" :key="tag">{{ tag }}</span>
        </div>
      </div>

      <div class="detail-hero-card">
        <div class="detail-copy">
          <p class="eyebrow">{{ garden.kicker }}</p>
          <div
            v-if="design.heroPreludeTitle || design.heroPreludeText || design.heroPreludeChips?.length"
            class="detail-prelude"
          >
            <div class="detail-prelude__copy">
              <span class="detail-prelude__label">{{ design.heroPreludeLabel || '观园引子' }}</span>
              <strong v-if="design.heroPreludeTitle">{{ design.heroPreludeTitle }}</strong>
              <p v-if="design.heroPreludeText">{{ design.heroPreludeText }}</p>
            </div>

            <div v-if="design.heroPreludeChips?.length" class="detail-prelude__chips">
              <span v-for="chip in design.heroPreludeChips" :key="chip">{{ chip }}</span>
            </div>
          </div>

          <div class="detail-badges" v-if="garden.badges?.length">
            <span v-for="badge in garden.badges" :key="badge">{{ badge }}</span>
          </div>
          <h1 class="detail-title">
            {{ garden.name }}
            <span>{{ garden.englishName }}</span>
          </h1>
          <p class="detail-intro">{{ garden.intro }}</p>
        </div>

        <div class="detail-metrics">
          <article v-for="fact in garden.facts" :key="fact.label" class="detail-metric">
            <span>{{ fact.label }}</span>
            <strong>{{ fact.value }}</strong>
          </article>
        </div>

        <div class="detail-actions">
          <component
            :is="resolveLinkComponent(garden.backHref || '/')"
            class="detail-action-link detail-action-link--primary"
            v-bind="resolveLinkProps(garden.backHref || '/')"
          >
            {{ garden.backLabel || '返回首页' }}
          </component>
          <component
            v-if="garden.nextGarden"
            :is="resolveLinkComponent(garden.nextGarden.href)"
            class="detail-action-link detail-action-link--ghost"
            v-bind="resolveLinkProps(garden.nextGarden.href)"
          >
            继续看 {{ garden.nextGarden.label }}
          </component>
          <button
            v-if="resolvedPoi"
            type="button"
            class="detail-action-link detail-action-link--ghost"
            @click="mapVisible = true"
          >
            地图导航
          </button>
        </div>
      </div>

      <div v-if="design.heroQuote || design.heroCaption" class="detail-hero-note">
        <strong v-if="design.heroQuote">{{ design.heroQuote }}</strong>
        <span v-if="design.heroCaption">{{ design.heroCaption }}</span>
      </div>
    </section>

    <section class="detail-panel detail-panel--highlights">
      <div class="detail-panel__header">
        <p class="eyebrow">核心看点</p>
        <h2>这座园林值得慢慢看的地方</h2>
        <p>{{ design.highlightIntro || '把速度放慢一点，园林真正的层次会在转折、停顿与回望中浮出来。' }}</p>
      </div>

      <div class="detail-highlight-list">
        <article v-for="item in garden.highlights" :key="item.title" class="detail-highlight-item">
          <h3>{{ item.title }}</h3>
          <p>{{ item.description }}</p>
        </article>
      </div>
    </section>

    <section v-if="galleryItems.length" class="detail-panel horizontal-gallery">
      <div class="detail-panel__header horizontal-gallery__header">
        <p class="eyebrow">横向画卷</p>
        <h2>{{ design.galleryTitle || '沿着一卷景色慢慢展开' }}</h2>
        <p>{{ design.galleryIntro || '横向轻扫，让视线像展开手卷一样，一景接一景地慢慢打开。' }}</p>
      </div>

      <div class="horizontal-gallery__track">
        <article
          v-for="item in galleryItems"
          :key="`${item.title}-${item.caption}`"
          :class="galleryCardClass(item)"
        >
          <img
            :src="resolveGalleryImage(item)"
            :alt="resolveGalleryAlt(item)"
            class="gallery-card__image"
            :style="{ objectPosition: item.focusPosition || design.heroImagePosition || 'center center' }"
          />
          <div class="gallery-card__overlay">
            <strong>{{ item.title }}</strong>
            <span>{{ item.caption }}</span>
          </div>
        </article>
      </div>
    </section>

    <section class="detail-grid">
      <aside class="detail-panel detail-panel--stepper">
        <div class="detail-panel__header">
          <p class="eyebrow">可视化游线</p>
          <h2>一条更顺的游览顺序</h2>
          <p>{{ design.stepperIntro || '先建立整体感，再回到细节和边缘位置，游园节奏会更顺。' }}</p>
        </div>

        <ol class="tour-stepper">
          <li v-for="(item, index) in garden.itinerary" :key="item.title" class="tour-stepper__item">
            <span class="tour-stepper__dot" aria-hidden="true" />
            <span class="tour-stepper__count">{{ String(index + 1).padStart(2, '0') }}</span>
            <div class="tour-stepper__content">
              <strong>{{ item.title }}</strong>
              <span>{{ item.description }}</span>
            </div>
          </li>
        </ol>
      </aside>

      <section class="detail-panel detail-panel--tips">
        <div class="detail-panel__header">
          <p class="eyebrow">慢游贴士</p>
          <h2>{{ design.tipsTitle || '第一次来可以这样安排' }}</h2>
          <p>{{ design.tipsIntro || '不赶时间时，景会慢慢长出来；留白和停顿，也是这页设计里很重要的一部分。' }}</p>
        </div>

        <ul class="detail-tips-list">
          <li v-for="tip in garden.tips" :key="tip">{{ tip }}</li>
        </ul>
      </section>
    </section>

    <section class="detail-related">
      <article v-for="item in garden.relatedGardens" :key="item.href" class="related-card">
        <p class="eyebrow">{{ item.kicker }}</p>
        <h3>{{ item.label }}</h3>
        <span>{{ item.description }}</span>
        <component
          :is="resolveLinkComponent(item.href)"
          class="detail-action-link detail-action-link--inline"
          v-bind="resolveLinkProps(item.href)"
        >
          跳转详情
        </component>
      </article>
    </section>

    <ScenicMapDialog
      :show="mapVisible"
      :poi="resolvedPoi"
      :title="`${garden.name} 导航地图`"
      @update:show="mapVisible = $event"
    />
  </article>
</template>

<style scoped>
.garden-detail-page {
  position: relative;
  display: grid;
  gap: 30px;
  padding-top: 28px;
  padding-bottom: 104px;
  isolation: isolate;
}

.garden-detail-page > * {
  opacity: 0;
  transform: translateY(24px);
  filter: blur(10px);
  animation: page-reveal 0.92s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.garden-detail-page > :nth-child(2) {
  animation-delay: 0.12s;
}

.garden-detail-page > :nth-child(3) {
  animation-delay: 0.24s;
}

.garden-detail-page > :nth-child(4) {
  animation-delay: 0.36s;
}

.garden-detail-page > :nth-child(5) {
  animation-delay: 0.48s;
}

.garden-detail-page > :nth-child(6) {
  animation-delay: 0.6s;
}

.detail-watermark {
  position: absolute;
  top: 10%;
  right: -5%;
  z-index: -1;
  color: rgba(var(--garden-accent-rgb), 0.04);
  font-family: var(--font-serif);
  font-size: min(40vw, 32rem);
  line-height: 0.82;
  user-select: none;
  pointer-events: none;
}

.detail-hero,
.detail-panel,
.related-card {
  border: 1px solid rgba(var(--garden-accent-rgb), 0.14);
  box-shadow: 0 24px 60px rgba(28, 25, 23, 0.08);
}

.detail-hero {
  position: relative;
  min-height: 680px;
  overflow: clip;
  border-radius: 40px;
  background:
    linear-gradient(135deg, rgba(var(--garden-accent-rgb), 0.08), rgba(255, 255, 255, 0.5)),
    rgba(255, 255, 255, 0.68);
}

.detail-hero-media {
  position: absolute;
  inset: 0;
}

.detail-hero-image-shell {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.detail-hero-image-shell::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(105deg, rgba(17, 24, 39, 0.42) 0%, rgba(17, 24, 39, 0.12) 38%, rgba(255, 255, 255, 0) 65%),
    linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(17, 24, 39, 0.12) 100%);
}

.detail-hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.01);
}

.detail-floating-tags {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.detail-floating-tags span {
  position: absolute;
  padding: 0.62rem 0.95rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.26);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.26);
  color: rgba(255, 255, 255, 0.94);
  font-size: 0.78rem;
  letter-spacing: 0.12em;
}

.detail-floating-tags span:nth-child(1) {
  top: 2rem;
  right: 2.2rem;
}

.detail-floating-tags span:nth-child(2) {
  top: 6rem;
  right: 8rem;
}

.detail-floating-tags span:nth-child(3) {
  bottom: 2.2rem;
  right: 22%;
}

.detail-hero-card,
.detail-hero-note {
  position: relative;
  z-index: 3;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.detail-hero-card {
  display: grid;
  gap: 22px;
  width: min(560px, calc(100% - 2.5rem));
  margin: auto auto 2rem 2rem;
  padding: 28px;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.24);
  box-shadow: var(--garden-shadow);
}

.detail-copy {
  display: grid;
  gap: 14px;
}

.detail-prelude {
  display: grid;
  gap: 12px;
  padding: 18px 20px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.detail-prelude__copy {
  display: grid;
  gap: 8px;
}

.detail-prelude__label {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.74rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.detail-prelude__copy strong {
  color: white;
  font-family: var(--font-serif);
  font-size: 1.04rem;
  line-height: 1.5;
}

.detail-prelude__copy p {
  color: rgba(255, 255, 255, 0.84);
  line-height: 1.76;
}

.detail-prelude__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-prelude__chips span {
  padding: 0.42rem 0.76rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.92);
  font-size: 0.76rem;
}

.detail-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.detail-badges span {
  padding: 0.48rem 0.82rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.94);
  font-size: 0.82rem;
}

.detail-title {
  margin: 0;
  display: grid;
  gap: 8px;
  color: white;
  font-size: clamp(2.5rem, 5vw, 4.2rem);
  line-height: 1.06;
}

.detail-title span {
  color: rgba(255, 255, 255, 0.76);
  font-size: clamp(1.05rem, 2vw, 1.4rem);
  font-weight: 500;
  letter-spacing: 0.04em;
}

.detail-intro {
  max-width: 34rem;
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.92;
}

.detail-metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.detail-metric {
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.detail-metric span {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.82rem;
  letter-spacing: 0.08em;
}

.detail-metric strong {
  color: white;
  line-height: 1.45;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.detail-action-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.9rem 1.25rem;
  border-radius: 999px;
  text-decoration: none;
  transition:
    transform 0.32s ease,
    box-shadow 0.32s ease,
    background-color 0.32s ease,
    border-color 0.32s ease;
}

.detail-action-link:hover {
  transform: translateY(-2px);
}

.detail-action-link--primary {
  background: var(--garden-accent);
  color: white;
  box-shadow: 0 16px 36px rgba(var(--garden-accent-rgb), 0.26);
}

.detail-action-link--ghost,
.detail-action-link--inline {
  border: 1px solid rgba(var(--garden-accent-rgb), 0.22);
  background: rgba(255, 255, 255, 0.7);
  color: var(--garden-accent);
}

.detail-hero-note {
  position: absolute;
  right: 2rem;
  bottom: 2rem;
  display: grid;
  gap: 10px;
  width: min(300px, calc(100% - 4rem));
  padding: 18px 20px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: rgba(255, 255, 255, 0.92);
}

.detail-hero-note strong {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  line-height: 1.5;
}

.detail-hero-note span {
  color: rgba(255, 255, 255, 0.82);
  line-height: 1.8;
}

.detail-panel {
  position: relative;
  display: grid;
  gap: 22px;
  padding: 30px;
  border-radius: 32px;
  background: var(--garden-paper);
}

.detail-panel__header {
  display: grid;
  gap: 12px;
  max-width: 54rem;
}

.detail-panel__header h2,
.detail-highlight-item h3,
.related-card h3 {
  margin: 0;
  line-height: 1.28;
}

.detail-panel__header p:last-child,
.related-card span,
.detail-highlight-item p,
.tour-stepper__content span,
.detail-tips-list li {
  color: var(--garden-muted);
  line-height: 1.88;
}

.detail-highlight-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.detail-highlight-item {
  display: grid;
  gap: 12px;
  padding: 22px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(var(--garden-accent-rgb), 0.12);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.65),
    0 18px 40px rgba(28, 25, 23, 0.06);
}

.horizontal-gallery {
  overflow: hidden;
}

.horizontal-gallery__track {
  display: flex;
  gap: 18px;
  overflow-x: auto;
  padding-bottom: 6px;
  scrollbar-width: none;
  -ms-overflow-style: none;
  overscroll-behavior-x: contain;
  touch-action: pan-x;
}

.horizontal-gallery__track::-webkit-scrollbar {
  display: none;
}

.gallery-card {
  position: relative;
  flex: 0 0 auto;
  overflow: hidden;
  border-radius: 30px;
  border: 1px solid rgba(var(--garden-accent-rgb), 0.15);
  background: rgba(var(--garden-accent-rgb), 0.08);
  box-shadow: 0 18px 42px rgba(28, 25, 23, 0.08);
  scroll-snap-align: start;
}

.gallery-card--panorama {
  width: min(68vw, 620px);
  aspect-ratio: 21 / 9;
}

.gallery-card--landscape {
  width: min(56vw, 440px);
  aspect-ratio: 4 / 3;
}

.gallery-card--portrait {
  width: min(34vw, 288px);
  aspect-ratio: 3 / 4;
}

.gallery-card--square {
  width: min(38vw, 320px);
  aspect-ratio: 1;
}

.gallery-card--tall {
  width: min(34vw, 280px);
  aspect-ratio: 5 / 7;
}

.gallery-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.gallery-card:hover .gallery-card__image {
  transform: scale(1.05);
}

.gallery-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(17, 24, 39, 0) 32%, rgba(17, 24, 39, 0.58) 100%);
}

.gallery-card__overlay {
  position: absolute;
  right: 14px;
  bottom: 14px;
  left: 14px;
  z-index: 1;
  display: grid;
  gap: 6px;
  padding: 14px 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.16);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: white;
}

.gallery-card__overlay strong {
  font-family: var(--font-serif);
  font-size: 1rem;
}

.gallery-card__overlay span {
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.9rem;
  line-height: 1.72;
}

.detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
  gap: 24px;
}

.tour-stepper {
  position: relative;
  display: grid;
  gap: 22px;
  margin: 0;
  padding: 6px 0 0;
  list-style: none;
}

.tour-stepper::before {
  content: '';
  position: absolute;
  left: 19px;
  top: 8px;
  bottom: 8px;
  width: 10px;
  border-radius: 999px;
  background: repeating-linear-gradient(
    to bottom,
    rgba(var(--garden-accent-rgb), 0.62) 0 8px,
    transparent 8px 18px
  );
  opacity: 0.8;
}

.tour-stepper__item {
  position: relative;
  display: grid;
  grid-template-columns: auto auto 1fr;
  gap: 14px;
  align-items: start;
}

.tour-stepper__dot {
  position: relative;
  z-index: 1;
  width: 14px;
  height: 14px;
  margin-top: 8px;
  border-radius: 50%;
  border: 2px solid var(--garden-accent);
  background: white;
  box-shadow: 0 0 0 6px rgba(var(--garden-accent-rgb), 0.12);
}

.tour-stepper__count {
  min-width: 2.2rem;
  color: rgba(var(--garden-accent-rgb), 0.72);
  font-family: var(--font-serif);
  font-size: 1rem;
  line-height: 1.9;
}

.tour-stepper__content {
  display: grid;
  gap: 8px;
}

.tour-stepper__content strong {
  line-height: 1.5;
}

.detail-tips-list {
  display: grid;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.detail-tips-list li {
  position: relative;
  padding: 16px 18px 16px 44px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.64);
  border: 1px solid rgba(var(--garden-accent-rgb), 0.1);
}

.detail-tips-list li::before {
  content: '';
  position: absolute;
  top: 22px;
  left: 18px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(var(--garden-secondary-rgb), 0.82);
  box-shadow: 0 0 0 6px rgba(var(--garden-secondary-rgb), 0.12);
}

.detail-related {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.related-card {
  display: grid;
  gap: 14px;
  min-width: 0;
  padding: 24px;
  border-radius: 28px;
  background: var(--garden-paper-strong);
}

.related-card::before {
  content: '';
  width: 64px;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--garden-accent), rgba(var(--garden-secondary-rgb), 0.38));
}

.garden-detail-page--zhuozheng .detail-hero {
  min-height: min(78vh, 760px);
}

.garden-detail-page--zhuozheng .detail-hero-card {
  background: rgba(242, 248, 245, 0.18);
}

.garden-detail-page--zhuozheng .detail-hero-note {
  background: rgba(240, 248, 244, 0.24);
}

.garden-detail-page--zhuozheng .tour-stepper::before {
  width: 18px;
  left: 14px;
  background:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='120' viewBox='0 0 18 120'%3E%3Cpath d='M9 0 C3 10 3 20 9 30 S15 50 9 60 S3 80 9 90 S15 110 9 120' fill='none' stroke='%237FB9AE' stroke-width='2.5' stroke-linecap='round' stroke-dasharray='4 8'/%3E%3C/svg%3E") center top / 18px 120px repeat-y;
  opacity: 0.84;
}

.garden-detail-page--liuyuan .detail-watermark {
  color: rgba(109, 67, 36, 0.045);
}

.garden-detail-page--liuyuan .detail-hero {
  display: grid;
  grid-template-columns: minmax(0, 0.88fr) minmax(360px, 1.12fr);
  align-items: center;
  min-height: 720px;
  padding: 2.2rem;
}

.garden-detail-page--liuyuan .detail-hero-image-shell {
  inset: 7% 3% 7% auto;
  width: min(620px, 100%);
  aspect-ratio: 1;
  border-radius: 36px;
  clip-path: circle(40% at 56% 50%);
}

.garden-detail-page--liuyuan .detail-hero-media::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 8%;
  width: min(520px, 74%);
  aspect-ratio: 1;
  border-radius: 50%;
  border: 1px solid rgba(var(--garden-accent-rgb), 0.2);
  transform: translateY(-50%);
}

.garden-detail-page--liuyuan .detail-hero-card {
  align-self: center;
  margin: 0;
  width: min(520px, 100%);
  background: rgba(255, 247, 239, 0.42);
}

.garden-detail-page--liuyuan .detail-title,
.garden-detail-page--liuyuan .detail-intro,
.garden-detail-page--liuyuan .detail-metric strong,
.garden-detail-page--liuyuan .detail-metric span,
.garden-detail-page--liuyuan .detail-badges span {
  color: #2c1b10;
}

.garden-detail-page--liuyuan .detail-badges span,
.garden-detail-page--liuyuan .detail-metric,
.garden-detail-page--liuyuan .detail-hero-note {
  background: rgba(255, 250, 245, 0.62);
  border-color: rgba(109, 67, 36, 0.14);
}

.garden-detail-page--liuyuan .detail-hero-note {
  top: 5rem;
  right: 4rem;
  bottom: auto;
  color: #4f341f;
}

.garden-detail-page--liuyuan .detail-hero-note span {
  color: rgba(79, 52, 31, 0.84);
}

.garden-detail-page--liuyuan .detail-floating-tags span {
  background: rgba(255, 250, 245, 0.8);
  border-color: rgba(109, 67, 36, 0.12);
  color: #6d4324;
}

.garden-detail-page--liuyuan .detail-floating-tags span:nth-child(1) {
  top: 18%;
  right: 17%;
}

.garden-detail-page--liuyuan .detail-floating-tags span:nth-child(2) {
  top: 30%;
  right: 6%;
}

.garden-detail-page--liuyuan .detail-floating-tags span:nth-child(3) {
  bottom: 18%;
  right: 14%;
}

.garden-detail-page--liuyuan .horizontal-gallery__track {
  align-items: flex-end;
  padding-top: 8px;
}

.garden-detail-page--liuyuan .gallery-card:nth-child(2n) {
  transform: translateY(24px);
}

.garden-detail-page--liuyuan .gallery-card:nth-child(3n) {
  transform: translateY(-10px);
}

.garden-detail-page--wangshiyuan .detail-watermark {
  color: rgba(28, 25, 23, 0.04);
  top: 12%;
  right: -2%;
}

.garden-detail-page--wangshiyuan .detail-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.18fr) minmax(320px, 0.82fr);
  grid-template-areas:
    'card media'
    'note media';
  gap: 24px 30px;
  align-items: start;
  min-height: 760px;
  padding: 3rem;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 246, 243, 0.98)),
    rgba(255, 255, 255, 0.92);
}

.garden-detail-page--wangshiyuan .detail-hero-media {
  position: relative;
  inset: auto;
  grid-area: media;
  display: grid;
  align-content: start;
  min-height: 100%;
}

.garden-detail-page--wangshiyuan .detail-hero-image-shell {
  position: relative;
  top: auto;
  right: auto;
  bottom: auto;
  left: auto;
  width: min(100%, 380px);
  height: clamp(520px, 66vh, 620px);
  margin-left: auto;
  border-radius: 32px;
  box-shadow: 0 26px 60px rgba(28, 25, 23, 0.18);
}

.garden-detail-page--wangshiyuan .detail-hero-image-shell::after {
  background:
    linear-gradient(180deg, rgba(28, 25, 23, 0.08) 0%, rgba(28, 25, 23, 0.34) 100%),
    linear-gradient(120deg, rgba(255, 255, 255, 0.02), rgba(255, 255, 255, 0));
}

.garden-detail-page--wangshiyuan .detail-hero-card {
  grid-area: card;
  width: 100%;
  margin: 0;
  align-self: start;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(28, 25, 23, 0.1);
}

.garden-detail-page--wangshiyuan .detail-prelude {
  background: linear-gradient(135deg, rgba(28, 25, 23, 0.03), rgba(159, 63, 52, 0.08));
  border-color: rgba(159, 63, 52, 0.14);
}

.garden-detail-page--wangshiyuan .detail-prelude__label,
.garden-detail-page--wangshiyuan .detail-title span,
.garden-detail-page--wangshiyuan .detail-metric span,
.garden-detail-page--wangshiyuan .detail-intro,
.garden-detail-page--wangshiyuan .detail-badges span {
  color: rgba(28, 25, 23, 0.72);
}

.garden-detail-page--wangshiyuan .detail-prelude__copy strong,
.garden-detail-page--wangshiyuan .detail-prelude__chips span {
  color: var(--ink-900);
}

.garden-detail-page--wangshiyuan .detail-prelude__copy p {
  color: rgba(68, 64, 60, 0.86);
}

.garden-detail-page--wangshiyuan .detail-prelude__chips span {
  background: rgba(255, 255, 255, 0.7);
  border-color: rgba(159, 63, 52, 0.14);
}

.garden-detail-page--wangshiyuan .detail-title,
.garden-detail-page--wangshiyuan .detail-intro {
  color: var(--ink-900);
}

.garden-detail-page--wangshiyuan .detail-metric {
  background: rgba(28, 25, 23, 0.04);
  border-color: rgba(28, 25, 23, 0.08);
}

.garden-detail-page--wangshiyuan .detail-metric strong {
  color: var(--ink-900);
}

.garden-detail-page--wangshiyuan .detail-badges span,
.garden-detail-page--wangshiyuan .detail-floating-tags span {
  background: rgba(28, 25, 23, 0.08);
  border-color: rgba(28, 25, 23, 0.08);
  color: var(--ink-900);
}

.garden-detail-page--wangshiyuan .detail-floating-tags span:nth-child(1) {
  top: 1.2rem;
  left: 0;
}

.garden-detail-page--wangshiyuan .detail-floating-tags span:nth-child(2) {
  top: 5.8rem;
  right: 0.2rem;
}

.garden-detail-page--wangshiyuan .detail-floating-tags span:nth-child(3) {
  bottom: 1.6rem;
  left: 1rem;
}

.garden-detail-page--wangshiyuan .detail-hero-note {
  position: relative;
  inset: auto;
  grid-area: note;
  width: min(420px, 100%);
  margin-top: 4px;
  background: rgba(28, 25, 23, 0.04);
  border-color: rgba(159, 63, 52, 0.18);
  color: var(--ink-900);
}

.garden-detail-page--wangshiyuan .detail-hero-note strong {
  color: var(--ink-900);
}

.garden-detail-page--wangshiyuan .detail-hero-note span {
  color: rgba(28, 25, 23, 0.72);
}

.garden-detail-page--wangshiyuan .detail-action-link--ghost,
.garden-detail-page--wangshiyuan .detail-action-link--inline {
  color: #9f3f34;
  border-color: rgba(159, 63, 52, 0.2);
}

.garden-detail-page--wangshiyuan .detail-tips-list li::before {
  background: rgba(159, 63, 52, 0.84);
  box-shadow: 0 0 0 6px rgba(159, 63, 52, 0.1);
}

@media (max-width: 1180px) {
  .detail-highlight-list,
  .detail-related,
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .garden-detail-page--wangshiyuan .detail-hero {
    grid-template-columns: minmax(0, 1fr) minmax(280px, 0.78fr);
    gap: 22px 24px;
    padding: 2.4rem;
  }

  .garden-detail-page--wangshiyuan .detail-hero-card {
    width: 100%;
  }

  .garden-detail-page--wangshiyuan .detail-hero-note {
    width: 100%;
  }
}

@media (max-width: 960px) {
  .garden-detail-page {
    gap: 22px;
    padding-top: 20px;
    padding-bottom: 80px;
  }

  .detail-watermark {
    top: 7rem;
    right: -7%;
    font-size: 46vw;
  }

  .detail-hero,
  .garden-detail-page--liuyuan .detail-hero,
  .garden-detail-page--wangshiyuan .detail-hero {
    display: grid;
    gap: 18px;
    grid-template-columns: 1fr;
    grid-template-areas: none;
    min-height: auto;
    padding: 20px;
  }

  .detail-hero-media,
  .garden-detail-page--wangshiyuan .detail-hero-media {
    position: relative;
    inset: auto;
    min-height: 320px;
    order: 1;
  }

  .detail-hero-image-shell,
  .garden-detail-page--liuyuan .detail-hero-image-shell,
  .garden-detail-page--wangshiyuan .detail-hero-image-shell {
    position: relative;
    inset: auto;
    width: 100%;
    aspect-ratio: 16 / 10;
    border-radius: 28px;
    clip-path: none;
  }

  .garden-detail-page--liuyuan .detail-hero-media::after {
    display: none;
  }

  .detail-floating-tags {
    position: relative;
    inset: auto;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 12px;
  }

  .detail-floating-tags span,
  .garden-detail-page--liuyuan .detail-floating-tags span,
  .garden-detail-page--wangshiyuan .detail-floating-tags span {
    position: relative;
    top: auto;
    right: auto;
    bottom: auto;
    left: auto;
  }

  .detail-hero-card,
  .garden-detail-page--liuyuan .detail-hero-card,
  .garden-detail-page--wangshiyuan .detail-hero-card {
    grid-area: auto;
    width: 100%;
    margin: 0;
    order: 2;
  }

  .detail-hero-note,
  .garden-detail-page--liuyuan .detail-hero-note,
  .garden-detail-page--wangshiyuan .detail-hero-note {
    position: relative;
    inset: auto;
    grid-area: auto;
    width: 100%;
    order: 3;
  }

  .gallery-card--panorama,
  .gallery-card--landscape,
  .gallery-card--portrait,
  .gallery-card--square,
  .gallery-card--tall {
    width: min(78vw, 420px);
  }

  .gallery-card--portrait,
  .gallery-card--tall {
    width: min(62vw, 320px);
  }

  .garden-detail-page--liuyuan .gallery-card:nth-child(2n),
  .garden-detail-page--liuyuan .gallery-card:nth-child(3n) {
    transform: none;
  }
}

@media (max-width: 640px) {
  .detail-panel,
  .related-card,
  .detail-hero-card {
    padding: 22px;
  }

  .detail-title {
    font-size: 2.2rem;
  }

  .detail-metrics {
    grid-template-columns: 1fr;
  }

  .detail-actions {
    flex-direction: column;
  }

  .detail-action-link {
    width: 100%;
  }

  .detail-watermark {
    font-size: 52vw;
  }

  .gallery-card--panorama,
  .gallery-card--landscape,
  .gallery-card--portrait,
  .gallery-card--square,
  .gallery-card--tall {
    width: min(84vw, 360px);
  }
}
</style>
