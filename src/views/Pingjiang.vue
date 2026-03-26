<script setup>
import { RouterLink } from 'vue-router';
import InkCard from '../components/InkCard.vue';
import { chapterCards, pingjiangRhythms } from '../data/siteContent';
</script>

<template>
  <div class="page-shell pingjiang-page">
    <section class="page-hero pingjiang-hero">
      <div class="pingjiang-hero__backdrop" />
      <div class="pingjiang-hero__veil" />

      <div class="pingjiang-hero__content">
        <div class="pingjiang-hero__copy">
          <p class="eyebrow">Pingjiang Road</p>
          <h1 class="hero-title">平江古街，在一条临水旧街里打开苏州的园林、文博与市井。</h1>
          <p class="hero-lead">
            以平江路为引线，顺着河埠、桥影和白墙黛瓦慢慢走：先入园看水石与花窗，再入馆读城，最后回到巷口的人间烟火。
          </p>

          <div class="hero-actions">
            <RouterLink to="/gardens" class="button-primary">先入园林</RouterLink>
            <RouterLink to="/heritage" class="button-ghost">再看市井</RouterLink>
          </div>

          <div class="hero-stat-row">
            <div>
              <strong>1.6 km</strong>
              <span>平江慢行主线</span>
            </div>
            <div>
              <strong>4 条</strong>
              <span>独立主题路径</span>
            </div>
            <div>
              <strong>一日</strong>
              <span>看完整体气质</span>
            </div>
          </div>
        </div>

        <aside class="pingjiang-hero__aside">
          <div class="poem-panel">
            <p class="poem-panel__label">姑苏意境</p>
            <p class="poem-vertical">君到姑苏见，人家尽枕河</p>
          </div>
          <div class="floating-brief">
            <span>慢游提示</span>
            <h2>先顺着主街建立方向，再向两侧支巷轻轻散开。</h2>
            <p>这样最容易把园林的静、博物馆的雅与市井的活，收束成一条完整的江南叙事。</p>
          </div>
        </aside>
      </div>
    </section>

    <section class="section-block">
      <div class="section-header">
        <div>
          <p class="eyebrow">Four Independent Pages</p>
          <h2 class="section-title">从平江古街出发，把苏州拆成四页，各自成章。</h2>
          <p class="section-lead">
            首页负责打开整体气质，其余三页分别承接园林、文博与非遗市井，让浏览路线更清晰，视觉语言也更专注。
          </p>
        </div>
        <div class="section-note serif-copy">
          这不是急促的信息堆叠，而是一种像翻册页一样的观看方式：一页一景，一页一气息。
        </div>
      </div>

      <div class="cards-grid cards-grid--3">
        <InkCard
          v-for="(chapter, index) in chapterCards"
          :key="chapter.title"
          :item="chapter"
          :tone="index === 0 ? 'celadon' : index === 1 ? 'cinnabar' : 'ink'"
        />
      </div>
    </section>

    <section class="section-block section-block--dense">
      <div class="section-header section-header--compact">
        <div>
          <p class="eyebrow">Rhythm Of The Street</p>
          <h2 class="section-title">一日之间，平江路的气息会沿着河岸轻轻换调。</h2>
        </div>
      </div>

      <div class="rhythm-grid">
        <article v-for="item in pingjiangRhythms" :key="item.title" class="rhythm-note">
          <span class="rhythm-index">{{ item.title }}</span>
          <p>{{ item.text }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.pingjiang-hero {
  min-height: 76vh;
}

.pingjiang-hero__backdrop,
.pingjiang-hero__veil {
  position: absolute;
  inset: 0;
}

.pingjiang-hero__backdrop {
  background:
    linear-gradient(120deg, rgba(21, 20, 18, 0.62), rgba(21, 20, 18, 0.16)),
    url('https://commons.wikimedia.org/wiki/Special:FilePath/Suzhou%20Pingjiang%20Road.jpg') center / cover;
  transform: scale(1.02);
  animation: hero-breath 18s cubic-bezier(0.33, 1, 0.68, 1) infinite alternate;
}

.pingjiang-hero__veil {
  background:
    radial-gradient(circle at 24% 24%, rgba(255, 255, 255, 0.12), transparent 30%),
    linear-gradient(180deg, rgba(250, 250, 249, 0.05) 0%, rgba(250, 250, 249, 0.12) 100%);
}

.pingjiang-hero__content {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(260px, 0.9fr);
  gap: 2rem;
  align-items: end;
  min-height: 76vh;
  padding: clamp(2rem, 4vw, 3rem);
  color: rgba(250, 250, 249, 0.96);
}

.hero-title,
.hero-lead,
.poem-vertical,
.floating-brief h2 {
  color: rgba(250, 250, 249, 0.98);
}

.hero-title {
  max-width: 12ch;
  margin: 0;
  font-size: clamp(2.6rem, 6vw, 4.9rem);
  line-height: 1.08;
}

.hero-lead {
  max-width: 40rem;
  margin: 1.1rem 0 0;
  color: rgba(250, 250, 249, 0.78);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
  margin-top: 1.8rem;
}

.button-primary,
.button-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.9rem;
  padding: 0.78rem 1.2rem;
  border-radius: 999px;
  border: 1px solid rgba(250, 250, 249, 0.28);
  letter-spacing: 0.08em;
  transition:
    transform 0.35s ease,
    background-color 0.35s ease,
    border-color 0.35s ease;
}

.button-primary {
  background: rgba(250, 250, 249, 0.92);
  color: var(--ink-900);
}

.button-ghost {
  background: rgba(250, 250, 249, 0.08);
  backdrop-filter: blur(12px);
}

.button-primary:hover,
.button-ghost:hover {
  transform: translateY(-1px);
}

.button-ghost:hover {
  background: rgba(250, 250, 249, 0.16);
}

.hero-stat-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
  margin-top: 2.2rem;
}

.hero-stat-row div {
  padding: 1rem 1.1rem;
  border: 1px solid rgba(250, 250, 249, 0.16);
  border-radius: 20px;
  background: rgba(250, 250, 249, 0.06);
  backdrop-filter: blur(16px);
}

.hero-stat-row strong {
  display: block;
  font-family: var(--font-serif);
  font-size: 1.45rem;
}

.hero-stat-row span {
  color: rgba(250, 250, 249, 0.76);
  font-size: 0.92rem;
}

.pingjiang-hero__aside {
  display: grid;
  justify-items: end;
  gap: 1rem;
}

.poem-panel,
.floating-brief {
  width: min(100%, 320px);
  border: 1px solid rgba(250, 250, 249, 0.16);
  border-radius: 26px;
  background: rgba(250, 250, 249, 0.08);
  backdrop-filter: blur(18px);
}

.poem-panel {
  display: grid;
  justify-items: end;
  padding: 1.3rem 1.3rem 1.5rem;
}

.poem-panel__label {
  margin: 0 0 1rem;
  font-size: 0.78rem;
  letter-spacing: 0.24em;
  color: rgba(250, 250, 249, 0.65);
}

.poem-vertical {
  margin: 0;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  letter-spacing: 0.42em;
  font-size: clamp(1.2rem, 2.8vw, 1.8rem);
  line-height: 1.9;
}

.floating-brief {
  padding: 1.25rem 1.3rem;
}

.floating-brief span {
  display: inline-flex;
  margin-bottom: 0.55rem;
  color: rgba(250, 250, 249, 0.64);
  font-size: 0.78rem;
  letter-spacing: 0.22em;
}

.floating-brief h2 {
  margin: 0;
  font-size: 1.3rem;
  line-height: 1.4;
}

.floating-brief p {
  margin: 0.75rem 0 0;
  color: rgba(250, 250, 249, 0.74);
}

.section-note {
  max-width: 28rem;
}

.rhythm-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.rhythm-note {
  padding: 1.15rem 1.2rem;
  border: 1px solid rgba(61, 55, 51, 0.08);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.7);
}

.rhythm-index {
  display: inline-flex;
  margin-bottom: 0.7rem;
  font-family: var(--font-serif);
  font-size: 1.08rem;
}

.rhythm-note p {
  margin: 0;
  color: var(--ink-700);
}

@keyframes hero-breath {
  0% {
    transform: scale(1.01) translate3d(0, 0, 0);
  }

  50% {
    transform: scale(1.05) translate3d(-0.6%, -0.4%, 0);
  }

  100% {
    transform: scale(1.03) translate3d(0.4%, 0.5%, 0);
  }
}

@media (max-width: 980px) {
  .pingjiang-hero__content,
  .rhythm-grid {
    grid-template-columns: 1fr;
  }

  .pingjiang-hero__aside {
    justify-items: start;
  }

  .poem-panel {
    justify-items: start;
  }

  .hero-title {
    max-width: none;
  }
}

@media (max-width: 640px) {
  .hero-stat-row {
    grid-template-columns: 1fr;
  }

  .poem-vertical {
    writing-mode: horizontal-tb;
    letter-spacing: 0.12em;
  }
}
</style>
