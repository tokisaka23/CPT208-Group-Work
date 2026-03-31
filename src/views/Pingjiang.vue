<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import InkCard from '../components/InkCard.vue';
import { currentLanguage, resolveLocalized } from '../i18n';
import { useSiteContent } from '../data/siteContent';

const { chapterCards, pingjiangRhythms } = useSiteContent();

const pageTextSource = {
  heroTitle: {
    zh: '平江古街，在一条临水旧街里打开苏州的园林、文博与市井。',
    en: 'Pingjiang Road opens Suzhou\'s gardens, museums, and street life along one old canal-side street.',
    ja: '平江古街は、水辺の旧街路の中で蘇州の庭園・博物館・町の暮らしをひらいてくれる。',
    ko: '평강고가는 물가의 오래된 거리 안에서 쑤저우의 정원과 박물관, 생활 풍경을 펼쳐 보인다.',
  },
  heroLead: {
    zh: '以平江路为引线，顺着河埠、桥影和白墙黛瓦慢慢走：先入园看水石与花窗，再入馆读城，最后回到巷口的人间烟火。',
    en: 'Use Pingjiang Road as your guide: follow the canal edge, bridges, and white walls into gardens, museums, and finally the warmth of the lanes.',
    ja: '平江路を一本の導線にして、河岸や橋影、白壁と黒瓦に沿ってゆっくり歩く。庭園に入り、館で街を読み、最後に路地の生活へ戻る。',
    ko: '평강로를 한 줄의 동선으로 삼아 하안과 다리 그림자, 백벽과 흑와를 따라 천천히 걷는다. 먼저 정원으로, 그다음 박물관으로, 마지막은 골목의 생활 풍경으로 돌아온다.',
  },
  primaryAction: {
    zh: '先入园林',
    en: 'Start with Gardens',
    ja: 'まず庭園へ',
    ko: '먼저 정원으로',
  },
  secondaryAction: {
    zh: '再看市井',
    en: 'Then the Streets',
    ja: '次に町を見る',
    ko: '다음은 골목으로',
  },
  statPrimary: {
    zh: '平江慢行主线',
    en: 'Main walking route',
    ja: '平江の散策主線',
    ko: '평강 산책 메인 루트',
  },
  statSecondary: {
    zh: '独立主题路径',
    en: 'Independent routes',
    ja: '独立した主題ルート',
    ko: '독립 테마 루트',
  },
  statTertiary: {
    zh: '看完整体气质',
    en: 'For the full atmosphere',
    ja: '街の気配をひと通り見る',
    ko: '전체 분위기를 보는 하루',
  },
  poemLabel: {
    zh: '姑苏意境',
    en: 'Suzhou Mood',
    ja: '姑蘇の気配',
    ko: '고소의 정취',
  },
  poemText: {
    zh: '君到姑苏见，人家尽枕河',
    en: 'When you arrive in Suzhou, every household seems to rest by the river.',
    ja: '君、姑蘇に到れば見る。人家ことごとく河に枕す。',
    ko: '그대가 고소에 이르면, 집집마다 강을 베고 있음을 보게 된다.',
  },
  briefLabel: {
    zh: '慢游提示',
    en: 'Slow Travel Tip',
    ja: 'ゆっくり歩くためのヒント',
    ko: '슬로우 트래블 팁',
  },
  briefTitle: {
    zh: '先顺着主街建立方向，再向两侧支巷轻轻散开。',
    en: 'First take the main street to orient yourself, then drift gently into the side lanes.',
    ja: 'まずは大通りで方向感覚をつかみ、そのあと両側の路地へ静かに広がっていく。',
    ko: '먼저 큰 거리로 방향을 잡고, 그다음 양옆 골목으로 천천히 퍼져 나간다.',
  },
  briefBody: {
    zh: '这样最容易把园林的静、博物馆的雅与市井的活，收束成一条完整的江南叙事。',
    en: 'That is the easiest way to gather garden quiet, museum elegance, and street vitality into one Jiangnan story.',
    ja: 'そう歩くと、庭園の静けさと博物館の品格、町のにぎわいがひとつの江南の物語としてまとまる。',
    ko: '이렇게 걸으면 정원의 고요함과 박물관의 우아함, 골목의 활기를 하나의 강남 서사로 묶기 쉽다.',
  },
  sectionTitle: {
    zh: '从平江古街出发，把苏州拆成四页，各自成章。',
    en: 'Starting from Pingjiang Road, Suzhou unfolds into four distinct chapters.',
    ja: '平江古街を起点に、蘇州を四つの頁へと分けて読む。',
    ko: '평강고가에서 출발해 쑤저우를 네 개의 장면으로 나누어 읽는다.',
  },
  sectionLead: {
    zh: '首页负责打开整体气质，其余三页分别承接园林、文博与非遗市井，让浏览路线更清晰，视觉语言也更专注。',
    en: 'The home page opens the overall atmosphere, while the other three pages focus on gardens, museums, and living heritage.',
    ja: 'トップページが全体の気配をひらき、残りの三頁が庭園・博物館・生活文化をそれぞれ受け持つ。',
    ko: '첫 페이지가 전체 분위기를 열고, 나머지 세 페이지가 정원과 박물관, 생활 유산을 각각 맡는다.',
  },
  sectionNote: {
    zh: '这不是急促的信息堆叠，而是一种像翻册页一样的观看方式：一页一景，一页一气息。',
    en: 'This is not a stack of rushed information but a way of looking that feels like turning through an album: one page, one scene, one mood.',
    ja: 'これは情報を急いで積み上げる構成ではなく、冊子をめくるように一頁ずつ景色と気配を読むためのつくりだ。',
    ko: '이건 서둘러 정보를 쌓아 올린 구성이 아니라, 한 페이지씩 풍경과 기운을 넘겨 보는 방식이다.',
  },
  rhythmTitle: {
    zh: '一日之间，平江路的气息会沿着河岸轻轻换调。',
    en: 'Across a single day, Pingjiang Road changes its mood along the canal.',
    ja: '一日のあいだに、平江路の気配は川沿いにそっと調子を変えていく。',
    ko: '하루 동안 평강로의 기운은 물가를 따라 천천히 결을 바꾼다.',
  },
};

const pageText = computed(() => resolveLocalized(pageTextSource, currentLanguage.value));
</script>

<template>
  <div class="page-shell pingjiang-page">
    <section class="page-hero pingjiang-hero">
      <div class="pingjiang-hero__backdrop" />
      <div class="pingjiang-hero__veil" />

      <div class="pingjiang-hero__content">
        <div class="pingjiang-hero__copy">
          <p class="eyebrow">Pingjiang Road</p>
          <h1 class="hero-title">{{ pageText.heroTitle }}</h1>
          <p class="hero-lead">
            {{ pageText.heroLead }}
          </p>

          <div class="hero-actions">
            <RouterLink to="/gardens" class="button-primary">{{ pageText.primaryAction }}</RouterLink>
            <RouterLink to="/heritage" class="button-ghost">{{ pageText.secondaryAction }}</RouterLink>
          </div>

          <div class="hero-stat-row">
            <div>
              <strong>1.6 km</strong>
              <span>{{ pageText.statPrimary }}</span>
            </div>
            <div>
              <strong>4 条</strong>
              <span>{{ pageText.statSecondary }}</span>
            </div>
            <div>
              <strong>{{ currentLanguage === 'en' ? '1 day' : currentLanguage === 'ja' ? '一日' : currentLanguage === 'ko' ? '하루' : '一日' }}</strong>
              <span>{{ pageText.statTertiary }}</span>
            </div>
          </div>
        </div>

        <aside class="pingjiang-hero__aside">
          <div class="poem-panel">
            <p class="poem-panel__label">{{ pageText.poemLabel }}</p>
            <p class="poem-vertical">{{ pageText.poemText }}</p>
          </div>
          <div class="floating-brief">
            <span>{{ pageText.briefLabel }}</span>
            <h2>{{ pageText.briefTitle }}</h2>
            <p>{{ pageText.briefBody }}</p>
          </div>
        </aside>
      </div>
    </section>

    <section class="section-block">
      <div class="section-header">
        <div>
          <p class="eyebrow">Four Independent Pages</p>
          <h2 class="section-title">{{ pageText.sectionTitle }}</h2>
          <p class="section-lead">
            {{ pageText.sectionLead }}
          </p>
        </div>
        <div class="section-note serif-copy">
          {{ pageText.sectionNote }}
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
          <h2 class="section-title">{{ pageText.rhythmTitle }}</h2>
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
