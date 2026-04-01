<script setup>
import { computed, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { currentLanguage, resolveLocalized } from '../i18n';

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  tone: {
    type: String,
    default: 'ink',
  },
  compact: {
    type: Boolean,
    default: false,
  },
});

const hasAction = computed(() => Boolean(props.item.to || props.item.href));
const actionComponent = computed(() => (props.item.to ? RouterLink : 'a'));
const actionProps = computed(() => {
  if (props.item.to) {
    return { to: props.item.to };
  }

  if (props.item.href) {
    return {
      href: props.item.href,
      target: props.item.external ? '_blank' : undefined,
      rel: props.item.external ? 'noreferrer' : undefined,
    };
  }

  return {};
});

const visibleHighlights = computed(() => props.item.highlights?.slice(0, props.compact ? 2 : 3) || []);

const cardTextSource = {
  detailLink: {
    zh: '入园游览',
    en: 'Open Garden Detail',
    ja: '庭園の詳細へ',
    ko: '정원 상세 보기',
  },
  actionLabel: {
    zh: '展开此景',
    en: 'Open This Chapter',
    ja: 'この頁を開く',
    ko: '이 장면 열기',
  },
  placeholder: {
    zh: '图片载入中，已切换为备用画面',
    en: 'Image unavailable. Showing fallback artwork.',
    ja: '画像を読み込めないため、代替画像を表示しています。',
    ko: '이미지를 불러올 수 없어 대체 화면을 표시합니다.',
  },
};

const cardText = computed(() => resolveLocalized(cardTextSource, currentLanguage.value));

const createPlaceholder = (title) => {
  const accent = props.tone === 'cinnabar' ? '%239f3f34' : props.tone === 'celadon' ? '%235f7f72' : '%231c1917';
  const label = encodeURIComponent(title);
  const placeholderText = encodeURIComponent(cardText.value.placeholder);

  return `data:image/svg+xml;charset=UTF-8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='900' viewBox='0 0 1200 900'><rect width='1200' height='900' fill='%23f5f5f4'/><rect x='48' y='48' width='1104' height='804' rx='40' fill='white' stroke='${accent}' stroke-opacity='0.28'/><path d='M140 240c120-46 212 52 350 30 140-22 246-98 430-30' fill='none' stroke='${accent}' stroke-opacity='0.22' stroke-width='6' stroke-linecap='round'/><path d='M180 606c104-34 196-10 284 36 118 62 270 64 444-12' fill='none' stroke='${accent}' stroke-opacity='0.18' stroke-width='6' stroke-linecap='round'/><text x='600' y='452' fill='${accent}' font-size='56' font-family='Noto Serif SC, serif' text-anchor='middle'>${label}</text><text x='600' y='528' fill='${accent}' fill-opacity='0.66' font-size='28' font-family='Noto Sans SC, sans-serif' text-anchor='middle'>${placeholderText}</text></svg>`;
};

const placeholderImage = computed(() => props.item.placeholderImage || createPlaceholder(props.item.title));
const currentImage = ref(props.item.image || placeholderImage.value);
const hasSwitchedFallback = ref(false);

watch(
  () => props.item,
  (nextItem) => {
    currentImage.value = nextItem.image || placeholderImage.value;
    hasSwitchedFallback.value = false;
  },
  { deep: true },
);

const handleImageError = () => {
  if (!hasSwitchedFallback.value && props.item.fallbackImage && currentImage.value !== props.item.fallbackImage) {
    currentImage.value = props.item.fallbackImage;
    hasSwitchedFallback.value = true;
    return;
  }

  currentImage.value = placeholderImage.value;
};

const isPlaceholder = computed(() => currentImage.value === placeholderImage.value);
</script>

<template>
  <article :class="['ink-card', `ink-card--${tone}`, { 'ink-card--compact': compact }]">
    <span class="ink-card__corner ink-card__corner--tl" />
    <span class="ink-card__corner ink-card__corner--tr" />
    <span class="ink-card__corner ink-card__corner--bl" />
    <span class="ink-card__corner ink-card__corner--br" />

    <div
      :class="['ink-card__media', { 'ink-card__media--placeholder': isPlaceholder }]"
      :style="{ '--focus-position': item.objectPosition || 'center center' }"
    >
      <img :src="currentImage" :alt="item.title" loading="lazy" decoding="async" @error="handleImageError" />
      <span v-if="item.badge" class="ink-card__badge">{{ item.badge }}</span>
    </div>

    <div :class="['ink-card__body', { 'ink-card__body--with-detail': item.path }]">
      <div class="ink-card__meta">
        <span v-if="item.eyebrow" class="meta-chip">{{ item.eyebrow }}</span>
        <span v-for="meta in item.meta || []" :key="meta" class="meta-chip">{{ meta }}</span>
      </div>

      <h3 class="ink-card__title">{{ item.title }}</h3>
      <p v-if="item.subtitle" class="ink-card__subtitle">{{ item.subtitle }}</p>
      <p class="ink-card__description">{{ item.description }}</p>
      <RouterLink v-if="item.path" :to="item.path" class="garden-detail-link">{{ cardText.detailLink }} <span>➔</span></RouterLink>

      <ul v-if="visibleHighlights.length" class="ink-card__highlights">
        <li v-for="highlight in visibleHighlights" :key="highlight">{{ highlight }}</li>
      </ul>

      <component :is="actionComponent" v-if="hasAction" v-bind="actionProps" class="ink-card__action">
        {{ item.actionLabel || cardText.actionLabel }}
      </component>
    </div>
  </article>
</template>

<style scoped>
.ink-card {
  --card-accent: rgba(61, 55, 51, 0.7);
  --card-soft: rgba(61, 55, 51, 0.08);
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--line-soft);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.78);
  box-shadow: 0 24px 56px rgba(28, 25, 23, 0.1);
  transition:
    border-color 0.6s cubic-bezier(0.33, 1, 0.68, 1),
    box-shadow 0.6s cubic-bezier(0.33, 1, 0.68, 1),
    background-color 0.6s cubic-bezier(0.33, 1, 0.68, 1);
}

.ink-card--celadon {
  --card-accent: rgba(95, 127, 114, 0.92);
  --card-soft: rgba(95, 127, 114, 0.1);
}

.ink-card--cinnabar {
  --card-accent: rgba(159, 63, 52, 0.9);
  --card-soft: rgba(159, 63, 52, 0.1);
}

.ink-card:hover {
  border-color: color-mix(in srgb, var(--card-accent) 36%, white);
  box-shadow: 0 30px 72px rgba(28, 25, 23, 0.14);
  background: rgba(255, 255, 255, 0.84);
}

.ink-card__corner {
  position: absolute;
  width: 22px;
  height: 22px;
  opacity: 0.9;
  pointer-events: none;
}

.ink-card__corner--tl {
  top: 14px;
  left: 14px;
  border-top: 1px solid var(--card-accent);
  border-left: 1px solid var(--card-accent);
}

.ink-card__corner--tr {
  top: 14px;
  right: 14px;
  border-top: 1px solid var(--card-accent);
  border-right: 1px solid var(--card-accent);
}

.ink-card__corner--bl {
  bottom: 14px;
  left: 14px;
  border-bottom: 1px solid var(--card-accent);
  border-left: 1px solid var(--card-accent);
}

.ink-card__corner--br {
  right: 14px;
  bottom: 14px;
  border-right: 1px solid var(--card-accent);
  border-bottom: 1px solid var(--card-accent);
}

.ink-card__media {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(250, 250, 249, 0) 0%, rgba(28, 25, 23, 0.08) 100%),
    var(--card-soft);
}

.ink-card__media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: var(--focus-position);
  filter: grayscale(0.24) saturate(0.78) contrast(1.04) brightness(0.97);
  transform: scale(1);
  transition:
    transform 0.6s cubic-bezier(0.33, 1, 0.68, 1),
    filter 0.6s cubic-bezier(0.33, 1, 0.68, 1);
}

.ink-card__media--placeholder img {
  filter: none;
}

.ink-card:hover .ink-card__media img {
  filter: grayscale(0) saturate(1) contrast(1.02) brightness(1);
  transform: scale(1.04);
}

.ink-card:hover .ink-card__media--placeholder img {
  transform: scale(1.02);
}

.ink-card__badge {
  position: absolute;
  left: 18px;
  bottom: 18px;
  padding: 0.38rem 0.78rem;
  border-radius: 999px;
  background: rgba(250, 250, 249, 0.8);
  backdrop-filter: blur(12px);
  color: var(--ink-900);
  font-size: 0.76rem;
  letter-spacing: 0.12em;
}

.ink-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 1.3rem 1.3rem 1.45rem;
}

.ink-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  min-height: 1.95rem;
  padding: 0.2rem 0.68rem;
  border-radius: 999px;
  background: var(--card-soft);
  color: color-mix(in srgb, var(--card-accent) 70%, var(--ink-900));
  font-size: 0.74rem;
  letter-spacing: 0.08em;
}

.ink-card__title {
  margin: 1rem 0 0;
  font-size: 1.55rem;
  line-height: 1.2;
}

.ink-card__subtitle {
  margin: 0.6rem 0 0;
  color: var(--ink-700);
  font-size: 0.98rem;
}

.ink-card__description {
  margin: 0.8rem 0 0;
  flex-grow: 1;
  color: var(--ink-700);
}

.garden-detail-link {
  display: inline-flex;
  align-items: center;
  gap: 0.38rem;
  align-self: flex-end;
  margin-top: 16px;
  color: var(--celadon-700);
  font-size: 14px;
  letter-spacing: 0.1em;
  text-decoration: none;
  transition: all 0.3s ease;
}

.garden-detail-link span {
  display: inline-block;
  transition: transform 0.3s ease;
}

.garden-detail-link:hover {
  color: var(--cinnabar-600);
}

.garden-detail-link:hover span {
  transform: translateX(4px);
}

.ink-card__highlights {
  margin: 1rem 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.45rem;
  color: var(--ink-600);
}

.ink-card__highlights li {
  position: relative;
  padding-left: 1rem;
}

.ink-card__highlights li::before {
  content: '';
  position: absolute;
  top: 0.7rem;
  left: 0;
  width: 0.42rem;
  height: 1px;
  background: var(--card-accent);
}

.ink-card__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 1.2rem;
  padding: 0.72rem 1.2rem;
  border-radius: 999px;
  border: 1px solid color-mix(in srgb, var(--card-accent) 30%, white);
  background: rgba(250, 250, 249, 0.65);
  color: var(--ink-900);
  font-size: 0.88rem;
  letter-spacing: 0.08em;
  transition:
    background-color 0.35s ease,
    color 0.35s ease,
    border-color 0.35s ease;
}

.ink-card__action:hover {
  background: var(--card-accent);
  color: var(--paper-50);
  border-color: transparent;
}

.ink-card--compact .ink-card__body {
  padding: 1.1rem 1.1rem 1.2rem;
}

.ink-card--compact .ink-card__title {
  font-size: 1.34rem;
}

.ink-card--compact .ink-card__description {
  margin-top: 0.7rem;
  font-size: 0.96rem;
}

@media (max-width: 720px) {
  .ink-card {
    border-radius: 24px;
  }

  .ink-card__body {
    padding: 1.15rem 1.1rem 1.25rem;
  }

  .ink-card__title {
    font-size: 1.38rem;
  }
}
</style>
