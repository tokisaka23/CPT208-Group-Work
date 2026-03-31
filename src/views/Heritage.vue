<script setup>
import { computed } from 'vue';
import InkCard from '../components/InkCard.vue';
import { currentLanguage, resolveLocalized } from '../i18n';
import { useSiteContent } from '../data/siteContent';

const { heritageCards, heritageSteps } = useSiteContent();

const pageTextSource = {
  title: {
    zh: '巷陌藏烟火，吴侬软语醉人',
    en: 'The lanes hold warmth, and the soft local voices linger in the air.',
    ja: '路地に暮らしの熱が宿り、やわらかな呉語が人を包む。',
    ko: '골목에는 생활의 온기가 숨어 있고, 부드러운 오어가 사람을 감싼다.',
  },
  lead: {
    zh: '街巷深处是传了几代的非遗手艺与老字号。在升腾的热气与喧闹声中，感受苏州最抚凡人心的烟火气。',
    en: 'Deep in the lanes are inherited crafts and old shops, where steam, voices, and everyday life reveal Suzhou at its warmest.',
    ja: '路地の奥には代々受け継がれてきた手仕事と老舗があり、湯気とざわめきの中で蘇州のもっとも人に近い温度が感じられる。',
    ko: '골목 깊숙한 곳에는 세대를 이어 온 수공예와 오래된 가게가 있다. 김과 소란 속에서 쑤저우의 가장 인간적인 온기를 느낄 수 있다.',
  },
  stepLabel: {
    zh: '巷口路线',
    en: 'Lane Sequence',
    ja: '路地の順路',
    ko: '골목 동선',
  },
  bustleTitle: {
    zh: '真正的平江路，不只看景，还要闻到、听到、吃到、带走。',
    en: 'The real Pingjiang Road is not only seen. It is smelled, heard, tasted, and taken home.',
    ja: '本当の平江路は、見るだけではない。香り、音、味、そして持ち帰る手ざわりまで含まれている。',
    ko: '진짜 평강로는 보는 것만이 아니다. 냄새 맡고, 듣고, 먹고, 가져가는 경험까지 포함된다.',
  },
  bustleChips: [
    {
      title: { zh: '吃', en: 'Eat', ja: '食べる', ko: '먹기' },
      text: {
        zh: '清汤细面、糕团、时令点心',
        en: 'Clear-broth noodles, rice cakes, and seasonal sweets',
        ja: '澄んだ麺、糕団、季節の菓子',
        ko: '맑은 국물 면, 떡, 계절 간식',
      },
    },
    {
      title: { zh: '听', en: 'Listen', ja: '聴く', ko: '듣기' },
      text: {
        zh: '评弹、昆曲、船橹与人声',
        en: 'Pingtan, Kunqu, boat sounds, and street voices',
        ja: '評弾、昆曲、舟の音、人の声',
        ko: '평탄, 곤곡, 노 젓는 소리와 사람 목소리',
      },
    },
    {
      title: { zh: '逛', en: 'Wander', ja: '歩く', ko: '둘러보기' },
      text: {
        zh: '河埠、支巷、小桥、旧铺面',
        en: 'Canal edges, side lanes, bridges, and old storefronts',
        ja: '河岸、路地、小橋、古い店構え',
        ko: '하안, 골목, 작은 다리, 오래된 가게',
      },
    },
    {
      title: { zh: '带走', en: 'Bring Home', ja: '持ち帰る', ko: '가져가기' },
      text: {
        zh: '宋锦、香器、纸本与小手作',
        en: 'Song brocade, incense ware, paper goods, and small crafts',
        ja: '宋錦、香の器、紙もの、小さな手仕事',
        ko: '송금, 향 도구, 종이 공예, 작은 수공예품',
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
          <p class="eyebrow">Living Heritage</p>
          <div class="heritage-title-frame">
            <h1 class="section-title">{{ pageText.title }}</h1>
          </div>
          <p class="section-lead">
            {{ pageText.lead }}
          </p>
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
          <p class="eyebrow">Street Texture</p>
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
