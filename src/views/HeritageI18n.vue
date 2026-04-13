<script setup>
import { computed } from 'vue';
import InkCard from '../components/InkCard.vue';
import { currentLanguage, resolveLocalized } from '../i18n';
import { useSiteContentI18n } from '../data/siteContentI18n';

const { heritageCards, heritageSteps } = useSiteContentI18n();

const pageTextSource = {
  eyebrow: {
    zh: '非遗市井',
    en: 'Living Heritage',
    ja: '暮らしの遺産',
    ko: '생활 유산',
  },
  title: {
    zh: '巷陌藏烟火，吴语与手艺都还活着。',
    en: 'The lanes keep their warmth, and both local voices and craft are still alive.',
    ja: '路地のあたたかさの中で、ことばも手仕事も今も生きている。',
    ko: '골목의 온기 속에서 말과 손기술이 지금도 살아 있습니다.',
  },
  lead: {
    zh: '平江路真正耐看的地方，不只在古建和景色里，也在一碗面、一段评弹、一间小店和一件手作里面。',
    en: 'What lasts on Pingjiang Road is not only architecture or scenery, but also a bowl of noodles, a stretch of Pingtan, a small shop, and a handmade object.',
    ja: '平江路で長く残るものは建物や景色だけではありません。一杯の麺や一段の評彈、小さな店、一つの手仕事の中にもあります。',
    ko: '평강로에서 오래 남는 것은 건축과 풍경만이 아닙니다. 한 그릇의 국수와 한 토막의 평탄, 작은 가게와 수공예품 안에도 있습니다.',
  },
  stepLabel: {
    zh: '街巷顺序',
    en: 'Lane sequence',
    ja: '路地の順序',
    ko: '골목 순서',
  },
  bustleEyebrow: {
    zh: '街巷质感',
    en: 'Street Texture',
    ja: '路地の質感',
    ko: '골목의 질감',
  },
  bustleTitle: {
    zh: '真正的平江路，不只要看，还要听、要吃、要停下来。',
    en: 'The real Pingjiang Road is not only something to see, but also something to hear, taste, and pause inside.',
    ja: '本当の平江路は、見るだけでなく、聴いて、味わって、立ち止まって感じる場所です。',
    ko: '진짜 평강로는 보기만 하는 곳이 아니라 듣고, 맛보고, 잠시 멈춰 느끼는 장소입니다.',
  },
  bustleChips: [
    {
      title: {
        zh: '吃',
        en: 'Eat',
        ja: '味わう',
        ko: '먹다',
      },
      text: {
        zh: '一碗热面或一口时令小吃，往往比攻略更快把你带进当地节奏。',
        en: 'A hot bowl of noodles or a seasonal bite often brings you into the local rhythm faster than any guide.',
        ja: '温かい麺や季節のおやつは、どんなガイドより早くその土地のテンポに入れてくれます。',
        ko: '따뜻한 국수 한 그릇이나 제철 간식 한입이 어떤 가이드보다 빨리 현지 리듬으로 데려갑니다.',
      },
    },
    {
      title: {
        zh: '听',
        en: 'Listen',
        ja: '聴く',
        ko: '듣다',
      },
      text: {
        zh: '评弹、船声、说话声和店门声，会把平江路从“看见”变成“进入”。',
        en: 'Pingtan, boat sounds, voices, and shop doors turn Pingjiang Road from a sight into an atmosphere you enter.',
        ja: '評彈や舟の音、人の声、店の戸の音が、平江路を「眺める場所」から「入っていく空気」へ変えていきます。',
        ko: '평탄과 배 소리, 사람 목소리, 가게 문 여닫는 소리가 평강로를 보는 장소에서 들어가는 분위기로 바꿔 줍니다.',
      },
    },
    {
      title: {
        zh: '走',
        en: 'Wander',
        ja: '歩く',
        ko: '걷다',
      },
      text: {
        zh: '主街之外真正有意思的地方，常常在支巷、桥边和转角里。',
        en: 'Many of the most memorable moments happen beyond the main street, in side lanes, at bridges, and around corners.',
        ja: '主通りの外にある支路や橋のそば、曲がり角にこそ忘れにくい場面が潜んでいます。',
        ko: '메인 거리 바깥의 골목과 다리 옆, 모퉁이에 오히려 더 오래 기억되는 장면이 숨어 있습니다.',
      },
    },
    {
      title: {
        zh: '带走',
        en: 'Bring home',
        ja: '持ち帰る',
        ko: '가져가다',
      },
      text: {
        zh: '值得带走的不只是纪念品，而是你对这条街慢下来的记忆。',
        en: 'What you take home is not only an object, but also the slower memory this street leaves behind.',
        ja: '持ち帰るのは土産物だけではなく、この街で速度がゆるんだ記憶そのものです。',
        ko: '가져가는 것은 기념품만이 아니라 이 거리에서 느려졌던 기억 그 자체이기도 합니다.',
      },
    },
  ],
};

const pageText = computed(() => resolveLocalized(pageTextSource, currentLanguage.value));
</script>

<template>
  <div class="page-shell heritage-page">
    <section class="section-block section-block--first heritage-header">
      <div class="section-header heritage-header__grid">
        <div>
          <p class="eyebrow">{{ pageText.eyebrow }}</p>
          <div class="heritage-title-frame">
            <h1 class="section-title">{{ pageText.title }}</h1>
          </div>
          <p class="section-lead">{{ pageText.lead }}</p>
        </div>
        <div class="heritage-steps">
          <article v-for="step in heritageSteps" :key="step" class="heritage-step">
            <span>{{ pageText.stepLabel }}</span>
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
          <p class="eyebrow">{{ pageText.bustleEyebrow }}</p>
          <h2 class="section-title">{{ pageText.bustleTitle }}</h2>
        </div>
      </div>

      <div class="bustle-grid">
        <article v-for="item in pageText.bustleChips" :key="item.title" class="bustle-chip">
          <strong>{{ item.title }}</strong>
          <span>{{ item.text }}</span>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.heritage-page {
  --tight-gap: 0.95rem;
  --market-accent: 146, 98, 55;
  position: relative;
}

.heritage-page::before {
  content: '';
  position: absolute;
  inset: 1.1rem 0 auto;
  height: 17rem;
  border-radius: 32px;
  background:
    radial-gradient(circle at 18% 24%, rgba(var(--market-accent), 0.22), transparent 38%),
    linear-gradient(180deg, rgba(var(--market-accent), 0.08), rgba(var(--market-accent), 0));
  pointer-events: none;
  z-index: -1;
}

.heritage-header {
  position: relative;
  padding-top: 0.9rem;
}

.heritage-header::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -0.45rem;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(var(--market-accent), 0.38), transparent);
}

.heritage-header__grid {
  align-items: start;
}

.heritage-title-frame {
  position: relative;
  display: inline-flex;
  width: 100%;
  writing-mode: horizontal-tb;
  -webkit-writing-mode: horizontal-tb;
  margin-top: 0.1rem;
  margin-bottom: 1.5rem;
  padding: 1.5rem 2rem;
  border: 1px solid rgba(var(--market-accent), 0.22);
  border-radius: 26px;
  background: linear-gradient(135deg, rgba(var(--market-accent), 0.14), rgba(255, 255, 255, 0.78));
  box-shadow: 0 20px 44px rgba(146, 98, 55, 0.1);
  box-sizing: border-box;
}

.heritage-title-frame::before,
.heritage-title-frame::after {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  opacity: 0.9;
}

.heritage-title-frame::before {
  top: 12px;
  left: 12px;
  border-top: 1px solid rgba(var(--market-accent), 0.72);
  border-left: 1px solid rgba(var(--market-accent), 0.72);
}

.heritage-title-frame::after {
  right: 12px;
  bottom: 12px;
  border-right: 1px solid rgba(var(--market-accent), 0.72);
  border-bottom: 1px solid rgba(var(--market-accent), 0.72);
}

.heritage-title-frame .section-title {
  color: rgb(109, 67, 36);
  writing-mode: horizontal-tb;
  margin: 0;
  font-size: clamp(32px, 4vw, 46px);
  letter-spacing: 0.05em;
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
  .heritage-title-frame {
    max-width: 100%;
    padding: 1.2rem 1.5rem;
  }

  .heritage-title-frame .section-title {
    font-size: 28px;
  }

  .bustle-grid {
    grid-template-columns: 1fr;
  }
}
</style>
