<script setup>
import InkCard from '../components/InkCard.vue';
import { heritageCards, heritageSteps } from '../data/siteContent';
</script>

<template>
  <div class="page-shell heritage-page">
    <section class="section-block section-block--first heritage-header">
      <div class="section-header heritage-header__grid">
        <div>
          <p class="eyebrow">Living Heritage</p>
          <h1 class="section-title">非遗市井页，把版式收紧一些，让平江路的烟火气更贴身、更热闹。</h1>
          <p class="section-lead">
            这里不再强调大留白，而是适度提高信息密度：让吃、听、买、逛的节奏更像真实街巷，保留繁华却不失秩序。
          </p>
        </div>
        <div class="heritage-steps">
          <article v-for="step in heritageSteps" :key="step" class="heritage-step">
            <span>巷口路线</span>
            <p>{{ step }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section-block heritage-grid-section">
      <div class="cards-grid cards-grid--3 cards-grid--tight">
        <InkCard v-for="item in heritageCards" :key="item.title" :item="item" compact />
      </div>
    </section>

    <section class="section-block section-block--dense bustle-band">
      <div class="section-header section-header--compact">
        <div>
          <p class="eyebrow">Street Texture</p>
          <h2 class="section-title">真正的平江路，不只看景，还要闻到、听到、吃到、带走。</h2>
        </div>
      </div>

      <div class="bustle-grid">
        <article class="bustle-chip">
          <strong>吃</strong>
          <span>清汤细面、糕团、时令点心</span>
        </article>
        <article class="bustle-chip">
          <strong>听</strong>
          <span>评弹、昆曲、船橹与人声</span>
        </article>
        <article class="bustle-chip">
          <strong>逛</strong>
          <span>河埠、支巷、小桥、旧铺面</span>
        </article>
        <article class="bustle-chip">
          <strong>带走</strong>
          <span>宋锦、香器、纸本与小手作</span>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.heritage-page {
  --tight-gap: 0.95rem;
}

.heritage-header__grid {
  align-items: start;
}

.heritage-steps {
  display: grid;
  gap: 0.8rem;
}

.heritage-step {
  padding: 0.95rem 1rem;
  border-radius: 22px;
  border: 1px solid rgba(61, 55, 51, 0.12);
  background: rgba(255, 255, 255, 0.74);
}

.heritage-step span {
  display: inline-flex;
  color: var(--ink-500);
  font-size: 0.76rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.heritage-step p {
  margin: 0.45rem 0 0;
  color: var(--ink-800);
}

.cards-grid--tight {
  gap: var(--tight-gap);
}

.bustle-band {
  padding-top: 0.4rem;
}

.bustle-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.bustle-chip {
  padding: 0.9rem 1rem;
  border-radius: 20px;
  border: 1px solid rgba(61, 55, 51, 0.12);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.82), rgba(250, 250, 249, 0.74));
}

.bustle-chip strong {
  display: block;
  font-family: var(--font-serif);
  font-size: 1.05rem;
}

.bustle-chip span {
  display: block;
  margin-top: 0.35rem;
  color: var(--ink-700);
  font-size: 0.94rem;
}

@media (max-width: 980px) {
  .bustle-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .bustle-grid {
    grid-template-columns: 1fr;
  }
}
</style>
