<script setup>
defineProps({
  garden: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <article class="garden-detail-page section-shell">
    <section class="detail-hero card-surface">
      <div class="detail-copy">
        <p class="eyebrow">{{ garden.kicker }}</p>
        <div class="detail-badges" v-if="garden.badges?.length">
          <span v-for="badge in garden.badges" :key="badge">{{ badge }}</span>
        </div>
        <h1 class="detail-title">
          {{ garden.name }}
          <span>{{ garden.englishName }}</span>
        </h1>
        <p class="detail-intro">{{ garden.intro }}</p>

        <div class="detail-actions">
          <a class="primary-button detail-action-link" :href="garden.backHref || '#home'">
            {{ garden.backLabel || '返回首页' }}
          </a>
          <a
            v-if="garden.nextGarden"
            class="ghost-button detail-action-link"
            :href="garden.nextGarden.href"
          >
            继续看 {{ garden.nextGarden.label }}
          </a>
        </div>
      </div>

      <div class="detail-image-wrap">
        <img :src="garden.heroImage" :alt="garden.heroAlt || garden.name" class="detail-image" />
      </div>
    </section>

    <section class="detail-facts">
      <article v-for="fact in garden.facts" :key="fact.label" class="card-surface detail-fact-card">
        <p>{{ fact.label }}</p>
        <strong>{{ fact.value }}</strong>
      </article>
    </section>

    <section class="detail-grid">
      <div class="card-surface detail-panel">
        <p class="eyebrow">核心亮点</p>
        <h2>这座园林值得慢慢看的地方</h2>
        <div class="detail-highlight-list">
          <article v-for="item in garden.highlights" :key="item.title" class="detail-highlight-item">
            <h3>{{ item.title }}</h3>
            <p>{{ item.description }}</p>
          </article>
        </div>
      </div>

      <aside class="card-surface detail-panel">
        <p class="eyebrow">推荐节奏</p>
        <h2>一条更顺的游览顺序</h2>
        <ol class="detail-itinerary">
          <li v-for="item in garden.itinerary" :key="item.title">
            <strong>{{ item.title }}</strong>
            <span>{{ item.description }}</span>
          </li>
        </ol>
      </aside>
    </section>

    <section class="card-surface detail-panel detail-tips-panel">
      <p class="eyebrow">慢游贴士</p>
      <h2>第一次来可以这样安排</h2>
      <ul class="detail-tips-list">
        <li v-for="tip in garden.tips" :key="tip">{{ tip }}</li>
      </ul>
    </section>

    <section class="detail-related">
      <article v-for="item in garden.relatedGardens" :key="item.href" class="card-surface related-card">
        <p class="eyebrow">{{ item.kicker }}</p>
        <h3>{{ item.label }}</h3>
        <span>{{ item.description }}</span>
        <a class="link-button detail-action-link" :href="item.href">跳转详情</a>
      </article>
    </section>
  </article>
</template>

<style scoped>
.garden-detail-page {
  display: grid;
  gap: 28px;
  padding-top: 40px;
  padding-bottom: 96px;
}

.detail-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(340px, 0.95fr);
  gap: 28px;
  align-items: stretch;
  padding: 32px;
  overflow: hidden;
}

.detail-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 18px;
  min-width: 0;
}

.detail-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.detail-badges span {
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(93, 127, 96, 0.1);
  color: var(--primary-deep);
  font-size: 13px;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.detail-title {
  margin: 0;
  display: grid;
  gap: 10px;
  font-size: clamp(34px, 5vw, 52px);
  line-height: 1.12;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.detail-title span {
  font-size: clamp(18px, 2vw, 24px);
  color: var(--muted);
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: 0.02em;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.detail-intro {
  margin: 0;
  max-width: 62ch;
  color: var(--muted);
  font-size: 16px;
  line-height: 1.9;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.detail-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px;
}

.detail-action-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  max-width: 100%;
  text-decoration: none;
  white-space: normal;
}

.detail-image-wrap {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 420px;
  aspect-ratio: 5 / 4;
  overflow: hidden;
  border-radius: 28px;
  background: #e8eee6;
}

.detail-image {
  display: block;
  flex: 1 1 auto;
  width: 100%;
  height: 100%;
  min-height: 100%;
  object-fit: cover;
  object-position: center;
}

.detail-facts {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
}

.detail-fact-card {
  display: grid;
  gap: 10px;
  min-width: 0;
  height: 100%;
  padding: 24px;
  align-content: start;
}

.detail-fact-card p,
.related-card span {
  margin: 0;
  color: var(--muted);
  line-height: 1.8;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.detail-fact-card strong {
  font-size: clamp(18px, 2.2vw, 22px);
  line-height: 1.4;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.8fr);
  gap: 24px;
}

.detail-panel {
  display: grid;
  gap: 18px;
  min-width: 0;
  padding: 28px;
}

.detail-panel h2,
.related-card h3,
.detail-highlight-item h3 {
  margin: 0;
  line-height: 1.3;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.detail-highlight-list,
.detail-related {
  display: grid;
  gap: 16px;
}

.detail-highlight-item {
  min-width: 0;
  padding: 18px 20px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(93, 127, 96, 0.1);
}

.detail-highlight-item p,
.detail-itinerary span,
.detail-tips-list li {
  margin: 0;
  color: var(--muted);
  line-height: 1.85;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.detail-itinerary {
  display: grid;
  gap: 16px;
  padding-left: 20px;
  margin: 0;
}

.detail-itinerary li {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.detail-itinerary strong {
  line-height: 1.4;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.detail-tips-list {
  display: grid;
  gap: 14px;
  margin: 0;
  padding-left: 20px;
}

.detail-related {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.related-card {
  display: grid;
  gap: 14px;
  min-width: 0;
  height: 100%;
  padding: 24px;
  align-content: start;
}

@media (max-width: 1080px) {
  .detail-hero,
  .detail-grid,
  .detail-related,
  .detail-facts {
    grid-template-columns: 1fr;
  }

  .detail-image-wrap {
    min-height: 320px;
    aspect-ratio: 5 / 4;
  }
}

@media (max-width: 720px) {
  .garden-detail-page {
    gap: 20px;
    padding-top: 24px;
    padding-bottom: 72px;
  }

  .detail-hero,
  .detail-panel,
  .detail-fact-card,
  .related-card {
    padding: 22px;
  }

  .detail-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .detail-action-link {
    width: 100%;
    text-align: center;
  }
}
</style>
