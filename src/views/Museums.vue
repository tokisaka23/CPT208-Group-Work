<script setup>
import InkCard from '../components/InkCard.vue';
import { museumCards, museumDetails } from '../data/siteContent';
</script>

<template>
  <div class="page-shell museums-page">
    <section class="section-block section-block--first museums-hero">
      <div class="section-header museums-hero__header">
        <div>
          <p class="eyebrow">Museums & Memory</p>
          <h1 class="section-title">文博殿堂页，用一点克制的朱砂红，把苏州的厚重与典雅托起来。</h1>
          <p class="section-lead">
            这里不追求浓烈，而是用印章式的色彩点睛：让建筑、器物与戏曲的分量感，从留白与边界中自己生长出来。
          </p>
        </div>
        <div class="seal-panel">
          <span class="seal-panel__stamp">文</span>
          <div>
            <strong>东方美学的厚重感</strong>
            <p>来自材质、比例、秩序与节制，而不是色彩的堆叠。</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section-block">
      <div class="cards-grid cards-grid--2">
        <InkCard v-for="item in museumCards" :key="item.title" :item="item" tone="cinnabar" />
      </div>
    </section>

    <section class="section-block section-block--dense museums-footnotes">
      <div class="section-header section-header--compact">
        <div>
          <p class="eyebrow">Design Cues</p>
          <h2 class="section-title">朱砂红只做点睛，不做喧宾夺主。</h2>
        </div>
      </div>

      <div class="detail-ribbon-list">
        <article v-for="detail in museumDetails" :key="detail" class="detail-ribbon">
          <span class="detail-ribbon__mark" />
          <p>{{ detail }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.museums-page {
  position: relative;
}

.museums-page::before {
  content: '';
  position: absolute;
  inset: 2rem 0 auto;
  height: 18rem;
  border-radius: 32px;
  background:
    radial-gradient(circle at 82% 22%, rgba(159, 63, 52, 0.16), transparent 34%),
    linear-gradient(180deg, rgba(159, 63, 52, 0.08), rgba(159, 63, 52, 0));
  pointer-events: none;
  z-index: -1;
}

.museums-hero {
  position: relative;
}

.museums-hero::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -0.6rem;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(159, 63, 52, 0.34), transparent);
}

.seal-panel {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  align-items: start;
  padding: 1.1rem 1.2rem;
  border: 1px solid rgba(159, 63, 52, 0.18);
  border-radius: 24px;
  background: rgba(159, 63, 52, 0.05);
}

.seal-panel__stamp {
  display: grid;
  place-items: center;
  width: 3.2rem;
  aspect-ratio: 1;
  border: 1px solid rgba(159, 63, 52, 0.35);
  border-radius: 16px;
  background: rgba(159, 63, 52, 0.08);
  color: var(--cinnabar-600);
  font-family: var(--font-serif);
  font-size: 1.5rem;
}

.seal-panel strong {
  display: block;
  color: var(--cinnabar-700);
}

.seal-panel p {
  margin: 0.45rem 0 0;
  color: var(--ink-700);
}

.detail-ribbon-list {
  display: grid;
  gap: 0.9rem;
}

.detail-ribbon {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.9rem;
  align-items: start;
  padding: 1rem 1.1rem;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(159, 63, 52, 0.12);
}

.detail-ribbon__mark {
  margin-top: 0.25rem;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 999px;
  background: rgba(159, 63, 52, 0.82);
  box-shadow: 0 0 0 6px rgba(159, 63, 52, 0.08);
}

.detail-ribbon p {
  margin: 0;
  color: var(--ink-700);
}
</style>
