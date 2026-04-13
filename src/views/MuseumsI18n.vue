<script setup>
import { computed, nextTick, onMounted, onUnmounted } from 'vue';
import InkCard from '../components/InkCard.vue';
import { currentLanguage, resolveLocalized } from '../i18n';
import { useSiteContentI18n } from '../data/siteContentI18n';

const { museumCards } = useSiteContentI18n();

const pageTextSource = {
  eyebrow: {
    zh: '文博与记忆',
    en: 'Museums & Memory',
    ja: '博物館と記憶',
    ko: '박물관과 기억',
  },
  title: {
    zh: '时间停驻处，一眼可以穿过千年。',
    en: 'Where time pauses, one glance can cross a thousand years.',
    ja: '時間が少し止まる場所では、一瞥が千年を越えていく。',
    ko: '시간이 잠시 멈추는 곳에서는 한 번의 시선이 천 년을 건너갑니다.',
  },
  lead: {
    zh: '这里不只是看文物，也是看苏州如何把建筑、器物、声景和审美放进同一条文化脉络里。',
    en: 'These museum stops are not only about objects. They show how architecture, collections, soundscape, and taste sit inside the same Suzhou cultural line.',
    ja: 'ここで見るのは展示品だけではありません。建築、器物、音の風景、美意識がどう一つの蘇州文化の流れに入っているかも見えてきます。',
    ko: '이곳은 유물만 보는 장소가 아닙니다. 건축과 수집품, 소리의 풍경, 미감이 하나의 쑤저우 문화 흐름 안에 놓여 있다는 점도 함께 드러납니다.',
  },
  sealTitle: {
    zh: '东方审美的厚度',
    en: 'The weight of East Asian aesthetics',
    ja: '東アジア美学の厚み',
    ko: '동아시아 미감의 두께',
  },
  sealBody: {
    zh: '真正耐看的部分，常常来自材料、比例、秩序和克制，而不只是展柜里的物件本身。',
    en: 'What stays with you here often comes from material, proportion, order, and restraint, not only from what sits in the display case.',
    ja: '長く印象に残るのは展示ケースの中身だけでなく、素材や比例、秩序、抑制の効いた空間そのものです。',
    ko: '오래 남는 인상은 진열장 속 물건만이 아니라 재료와 비례, 질서, 절제가 살아 있는 공간 그 자체에서 옵니다.',
  },
  sealStamp: {
    zh: '文',
    en: 'M',
    ja: '文',
    ko: '문',
  },
  timelineTitle: {
    zh: '平江与苏州的一条时间线',
    en: 'A short timeline of Pingjiang and Suzhou',
    ja: '平江と蘇州をたどる短い時間線',
    ko: '평강과 쑤저우를 잇는 짧은 시간선',
  },
  timelineData: [
    {
      dynasty: {
        zh: '春秋 · 吴',
        en: 'Spring and Autumn · Wu',
        ja: '春秋・呉',
        ko: '춘추 · 오',
      },
      title: {
        zh: '水路与街巷并行成形',
        en: 'Canals and streets formed together',
        ja: '水路と街路が並んで骨格をつくる',
        ko: '수로와 거리의 골격이 함께 잡히다',
      },
      desc: {
        zh: '城市格局很早就围绕河道展开，平江路一带因此形成了水陆并行的基本结构。',
        en: 'The city pattern grew around canals very early, giving Pingjiang its enduring water-and-street double structure.',
        ja: '街の骨格は早くから河道に沿って形づくられ、平江一帯に水路と街路が並ぶ基本構造が生まれました。',
        ko: '도시 구조는 일찍부터 수로를 중심으로 형성되어 평강 일대에 물길과 거리가 나란히 가는 기본 틀이 만들어졌습니다.',
      },
    },
    {
      dynasty: {
        zh: '南宋',
        en: 'Southern Song',
        ja: '南宋',
        ko: '남송',
      },
      title: {
        zh: '《平江图》把城市刻进石上',
        en: 'The Pingjiang Map fixed the city in stone',
        ja: '「平江図」が都市の姿を石に残す',
        ko: '평강도가 도시의 모습을 돌에 남기다',
      },
      desc: {
        zh: '石刻地图让今天的平江路仍能和宋代城市布局互相对照，这是苏州记忆最直观的证据之一。',
        en: 'The carved map lets today\'s Pingjiang still be compared with its Song-era plan, making urban memory unusually visible.',
        ja: '石刻地図のおかげで、今の平江路を宋代の都市計画と見比べることができ、都市の記憶がとても具体的に残っています。',
        ko: '석각 지도 덕분에 지금의 평강로를 송대 도시 배치와 직접 비교할 수 있어 도시 기억이 매우 선명하게 남아 있습니다.',
      },
    },
    {
      dynasty: {
        zh: '明清',
        en: 'Ming and Qing',
        ja: '明清',
        ko: '명청',
      },
      title: {
        zh: '园林、戏曲与商贸彼此缠绕',
        en: 'Gardens, opera, and trade intertwined',
        ja: '庭園、戯曲、商いが重なり合う',
        ko: '정원과 희곡, 상업이 겹쳐지다',
      },
      desc: {
        zh: '文人、商贾、园林营造和昆曲声腔一起，让苏州形成了很独特的城市文化密度。',
        en: 'Scholars, merchants, garden making, and Kunqu performance together created Suzhou\'s unusual cultural density.',
        ja: '文人や商人、庭園の造営、昆曲の声が重なり、蘇州独特の文化密度をつくっていきました。',
        ko: '문인과 상인, 정원 조성, 곤곡의 소리가 한데 겹치며 쑤저우 특유의 문화 밀도를 만들어 냈습니다.',
      },
    },
    {
      dynasty: {
        zh: '今天',
        en: 'Today',
        ja: '現在',
        ko: '오늘',
      },
      title: {
        zh: '一座仍在呼吸的历史现场',
        en: 'A historical city still very much alive',
        ja: '今も息づく歴史の現場',
        ko: '지금도 살아 움직이는 역사 현장',
      },
      desc: {
        zh: '今天的博物馆、古街与园林并不是分开的景点，而是同一座城市在不同尺度里的连续阅读。',
        en: 'Museums, old streets, and gardens now read less like separate attractions and more like connected chapters of one city.',
        ja: '今の博物館、古街、庭園は別々の観光地というより、一つの都市を異なる尺度で読む連続した章のように見えてきます。',
        ko: '오늘의 박물관과 고가, 정원은 따로 떨어진 관광지가 아니라 한 도시를 다른 스케일로 읽는 연속된 장면처럼 보입니다.',
      },
    },
  ],
};

const pageText = computed(() => resolveLocalized(pageTextSource, currentLanguage.value));

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
          <p class="eyebrow">{{ pageText.eyebrow }}</p>
          <div class="museums-title-frame">
            <h1 class="section-title">{{ pageText.title }}</h1>
          </div>
          <p class="section-lead">{{ pageText.lead }}</p>
        </div>
        <div class="seal-panel">
          <span class="seal-panel__stamp">{{ pageText.sealStamp }}</span>
          <div>
            <strong>{{ pageText.sealTitle }}</strong>
            <p>{{ pageText.sealBody }}</p>
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
        <h2 class="section-title">{{ pageText.timelineTitle }}</h2>
      </div>

      <div class="timeline-container">
        <article v-for="entry in pageText.timelineData" :key="entry.dynasty" class="timeline-item">
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
