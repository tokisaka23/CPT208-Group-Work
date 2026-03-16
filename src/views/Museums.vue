<script setup>
import { nextTick, onMounted, onUnmounted } from 'vue';
import InkCard from '../components/InkCard.vue';
import { museumCards } from '../data/siteContent';

const timelineData = [
  {
    dynasty: '春秋 · 吴',
    title: '水陆并行，格局初定',
    desc: '伍子胥建阖闾大城，平江河穿城而过，奠定了“水陆并行、河街相邻”的双棋盘格局。',
  },
  {
    dynasty: '南宋',
    title: '平江图碑，岁月留痕',
    desc: '《平江图》刻绘成碑。历经八百年沧桑，平江路今天的走向与图中严丝合缝，奇迹般地保留了宋代风貌。',
  },
  {
    dynasty: '明清',
    title: '商贾云集，昆曲传唱',
    desc: '迎来鼎盛繁华。达官贵人与文人雅士纷纷在此建造园林宅第，昆曲的水磨腔在水巷间彻夜回荡。',
  },
  {
    dynasty: '当代',
    title: '一眼千年，活着的古城',
    desc: '洗尽铅华，成为一座没有围墙的江南历史博物馆。踩在石板路上，每一步都是厚重的姑苏余韵。',
  },
];

let timelineObserver;

const observeTimelineItems = () => {
  const items = document.querySelectorAll('.timeline-item');
  if (!items.length) return;

  timelineObserver?.disconnect();
  timelineObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        timelineObserver?.unobserve(entry.target);
      });
    },
    { threshold: 0.2 },
  );

  items.forEach((item) => timelineObserver.observe(item));
};

onMounted(async () => {
  await nextTick();
  observeTimelineItems();
});

onUnmounted(() => {
  timelineObserver?.disconnect();
  timelineObserver = undefined;
});
</script>

<template>
  <div class="page-shell museums-page">
    <section class="section-block section-block--first museums-hero">
      <div class="section-header museums-hero__header">
        <div>
          <p class="eyebrow">Museums & Memory</p>
          <div class="museums-title-frame">
            <h1 class="section-title">时光停驻处，一眼越千年</h1>
          </div>
          <p class="section-lead">
            以东方美学的典雅为基调。每一件展品都是凝固的时光，带你走进这座城市深沉的文化肌理。
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

    <section class="section-block section-block--dense timeline-section">
      <div class="timeline-section__title">
        <h2 class="section-title">平江纪事</h2>
      </div>

      <div class="timeline-container">
        <article v-for="entry in timelineData" :key="entry.dynasty" class="timeline-item">
          <div class="timeline-item__axis" aria-hidden="true">
            <span class="timeline-item__dot" />
          </div>

          <div class="timeline-item__content">
            <p class="timeline-item__dynasty">{{ entry.dynasty }}</p>
            <h3 class="timeline-item__title">{{ entry.title }}</h3>
            <p class="timeline-item__desc">{{ entry.desc }}</p>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.museums-page {
  --museum-accent: 159, 63, 52;
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

.museums-title-frame {
  position: relative;
  display: inline-flex;
  width: 100%;
  margin-top: 0.1rem;
  margin-bottom: 1.5rem;
  padding: 1.5rem 2rem;
  border: 1px solid rgba(var(--museum-accent), 0.22);
  border-radius: 26px;
  background: linear-gradient(135deg, rgba(var(--museum-accent), 0.08), rgba(255, 255, 255, 0.78));
  box-shadow: 0 20px 44px rgba(159, 63, 52, 0.08);
  box-sizing: border-box;
}

.museums-title-frame::before,
.museums-title-frame::after {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  opacity: 0.9;
}

.museums-title-frame::before {
  top: 12px;
  left: 12px;
  border-top: 1px solid rgba(var(--museum-accent), 0.72);
  border-left: 1px solid rgba(var(--museum-accent), 0.72);
}

.museums-title-frame::after {
  right: 12px;
  bottom: 12px;
  border-right: 1px solid rgba(var(--museum-accent), 0.72);
  border-bottom: 1px solid rgba(var(--museum-accent), 0.72);
}

.museums-title-frame .section-title {
  color: rgb(109, 42, 34);
  margin: 0;
  font-size: clamp(32px, 4vw, 46px);
  letter-spacing: 0.05em;
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

.timeline-section__title {
  display: grid;
  justify-items: center;
  text-align: center;
  margin-bottom: 1.4rem;
}

.timeline-section__title .section-title {
  font-size: clamp(2rem, 3.2vw, 2.8rem);
}

.timeline-container {
  position: relative;
  display: grid;
  gap: 1.15rem;
  width: min(100%, 980px);
  margin: 0 auto;
  padding: 0.8rem 0;
}

.timeline-container::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  border-left: 1px dashed rgba(163, 59, 41, 0.3);
  transform: translateX(-0.5px);
}

.timeline-item {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 4.5rem minmax(0, 1fr);
  align-items: start;
  padding: 0.35rem 0;
  opacity: 0;
  transform: translateY(40px);
  transition: all 0.8s cubic-bezier(0.33, 1, 0.68, 1);
}

.timeline-item.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.timeline-item__axis {
  grid-column: 2;
  display: flex;
  justify-content: center;
  padding-top: 1.55rem;
}

.timeline-item__dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: #a33b29;
  box-shadow: 0 0 0 6px rgba(163, 59, 41, 0.14);
}

.timeline-item__content {
  grid-column: 3;
  width: min(100%, 26rem);
  padding: 1.15rem 1.2rem 1.25rem;
  border-radius: 26px;
  border: 1px solid rgba(163, 59, 41, 0.14);
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 18px 44px rgba(163, 59, 41, 0.08);
}

.timeline-item:nth-child(odd) .timeline-item__content {
  grid-column: 1;
  justify-self: end;
  text-align: right;
}

.timeline-item__dynasty {
  margin: 0;
  font-family: var(--font-serif);
  font-weight: 700;
  font-size: 1.06rem;
  letter-spacing: 0.12em;
  color: rgba(163, 59, 41, 0.9);
}

.timeline-item__title {
  margin: 0.6rem 0 0;
  font-family: var(--font-serif);
  font-weight: 600;
  font-size: 1.36rem;
  color: var(--ink-900);
}

.timeline-item__desc {
  margin: 0.65rem 0 0;
  color: var(--ink-700);
}

@media (max-width: 980px) {
  .timeline-container::before {
    left: 22px;
    transform: none;
  }

  .timeline-item {
    grid-template-columns: 44px 1fr;
    gap: 0.8rem;
  }

  .timeline-item__axis {
    grid-column: 1;
    padding-top: 1.4rem;
  }

  .timeline-item__content,
  .timeline-item:nth-child(odd) .timeline-item__content {
    grid-column: 2;
    justify-self: start;
    text-align: left;
    width: 100%;
  }
}

@media (max-width: 640px) {
  .museums-title-frame {
    max-width: 100%;
    padding: 1.2rem 1.5rem;
  }

  .museums-title-frame .section-title {
    font-size: 28px;
  }
}
</style>