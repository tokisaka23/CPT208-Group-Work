<script setup>
import { computed } from 'vue';
import InkCard from '../components/InkCard.vue';
import { currentLanguage, resolveLocalized } from '../i18n';
import { useSiteContentI18n } from '../data/siteContentI18n';

const { gardenCards } = useSiteContentI18n();

const pageTextSource = {
  eyebrow: {
    zh: '古典园林',
    en: 'Classical Gardens',
    ja: '古典庭園',
    ko: '고전 정원',
  },
  title: {
    zh: '借一窗幽绿，收半卷江南。',
    en: 'Borrow a frame of green and keep half of Jiangnan inside it.',
    ja: '一枚の窓景に江南の静けさを収める。',
    ko: '한 장면의 초록 안에 강남의 분위기를 담다.',
  },
  lead: {
    zh: '苏州园林不是越快越好看。走得慢一点，借景、回廊、水院和留白才会一层层露出来。',
    en: 'Suzhou gardens are not best understood quickly. Slow walking lets borrowed views, corridors, water courts, and empty space appear layer by layer.',
    ja: '蘇州の庭園は急いで見る場所ではありません。ゆっくり歩くほど、借景や回廊、水庭、余白の関係が見えてきます。',
    ko: '쑤저우 정원은 빨리 볼수록 좋은 장소가 아닙니다. 천천히 걸을수록 차경과 회랑, 수원, 여백의 관계가 한 겹씩 드러납니다.',
  },
  noteTitle: {
    zh: '观看建议',
    en: 'How to read the gardens',
    ja: '見方のヒント',
    ko: '감상 팁',
  },
  noteBody: {
    zh: '可以先看拙政园的开阔水面，再去留园读层层转景，最后到网师园感受小尺度里的深远。',
    en: 'Begin with the open water courts of Humble Administrator\'s Garden, move to Lingering Garden for layered framing, and end with the compact depth of Master of Nets Garden.',
    ja: 'まず拙政園の広い水庭を見て、次に留園で層のある景色を読み、最後に網師園の小さな空間にある深さへ向かうと流れが整います。',
    ko: '먼저 졸정원의 넓은 수면을 보고, 다음으로 유원에서 겹겹이 바뀌는 장면을 읽은 뒤, 마지막에 망사원의 작은 규모 안 깊이를 느끼면 동선이 자연스럽습니다.',
  },
  methodsEyebrow: {
    zh: '观看方法',
    en: 'How To See',
    ja: '見る順序',
    ko: '보는 순서',
  },
  methodsTitle: {
    zh: '先建立整体感，再回到细节和边角。',
    en: 'Build the whole first, then return to the smaller details.',
    ja: 'まず全体をつかみ、そのあと細部へ戻る。',
    ko: '먼저 전체를 잡고, 그다음 세부와 모서리로 돌아온다.',
  },
  methods: [
    {
      title: {
        zh: '先看整体',
        en: 'See the whole first',
        ja: 'まず全体を見る',
        ko: '먼저 전체를 본다',
      },
      text: {
        zh: '不要急着拍照，先把水面、亭台、树影和路径的关系走顺一遍。',
        en: 'Do not rush into photos. Walk once to read how water, pavilions, shadows, and paths relate to each other.',
        ja: '写真を急がず、水面や亭、木影、道の関係をまず一度歩いてつかみます。',
        ko: '사진부터 서두르지 말고 물과 정자, 나무 그림자, 길의 관계를 먼저 한 번 걸으며 읽습니다.',
      },
    },
    {
      title: {
        zh: '再看框景',
        en: 'Then read the frames',
        ja: '次に額縁の景を見る',
        ko: '그다음 프레임을 읽는다',
      },
      text: {
        zh: '第二遍再去看洞门、花窗和长廊，你会发现视线其实一直在被裁切和重组。',
        en: 'On the second pass, doorways, lattice windows, and corridors reveal how the view keeps being cut and recomposed.',
        ja: '二周目で洞門や花窓、長廊を見ると、視線が何度も切り取られて組み直されていることに気づきます。',
        ko: '두 번째로 동문과 화창, 긴 회랑을 보면 시선이 계속 잘리고 다시 짜여 있다는 점이 선명해집니다.',
      },
    },
    {
      title: {
        zh: '最后停一会',
        en: 'End with stillness',
        ja: '最後に少し止まる',
        ko: '마지막에 잠시 멈춘다',
      },
      text: {
        zh: '真正动人的时刻常常出现在停顿之后，所以给一张椅子、一段栏杆或一处水边留点时间。',
        en: 'The most memorable moments often come after you stop, so leave time for a bench, a railing, or the water\'s edge.',
        ja: '印象に残る瞬間は立ち止まったあとに現れることが多いので、椅子や欄干、水辺に少し時間を残しておくと良いです。',
        ko: '가장 오래 남는 순간은 멈춘 뒤에 오는 경우가 많으니 의자나 난간, 물가에 잠시 머물 시간을 남겨 두는 편이 좋습니다.',
      },
    },
  ],
};

const pageText = computed(() => resolveLocalized(pageTextSource, currentLanguage.value));
</script>

<template>
  <div class="page-shell gardens-page">
    <section class="section-block section-block--first garden-intro-panel">
      <div class="section-header">
        <div>
          <p class="eyebrow">{{ pageText.eyebrow }}</p>
          <div class="gardens-title-frame">
            <h1 class="section-title">{{ pageText.title }}</h1>
          </div>
          <p class="section-lead">{{ pageText.lead }}</p>
        </div>
        <div class="section-note garden-note">
          <strong>{{ pageText.noteTitle }}</strong>
          <p>{{ pageText.noteBody }}</p>
        </div>
      </div>
    </section>

    <section class="section-block">
      <div class="cards-grid cards-grid--3">
        <InkCard v-for="item in gardenCards" :key="item.title" :item="item" tone="celadon" />
      </div>
    </section>

    <section class="section-block section-block--dense garden-methods-panel">
      <div class="section-header section-header--compact">
        <div>
          <p class="eyebrow">{{ pageText.methodsEyebrow }}</p>
          <h2 class="section-title">{{ pageText.methodsTitle }}</h2>
        </div>
      </div>

      <div class="three-notes-grid">
        <article v-for="item in pageText.methods" :key="item.title" class="method-note">
          <h3>{{ item.title }}</h3>
          <p>{{ item.text }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.gardens-page {
  --garden-accent: 95, 127, 114;
  position: relative;
}

.gardens-page::before {
  content: '';
  position: absolute;
  inset: 1rem 0 auto;
  height: 16rem;
  border-radius: 32px;
  background:
    radial-gradient(circle at 20% 30%, rgba(var(--garden-accent), 0.18), transparent 44%),
    linear-gradient(180deg, rgba(var(--garden-accent), 0.08), rgba(var(--garden-accent), 0));
  pointer-events: none;
  z-index: -1;
}

.garden-intro-panel {
  padding: 1.2rem 0 0;
}

.gardens-title-frame {
  position: relative;
  display: inline-flex;
  width: 100%;
  margin-top: 0.1rem;
  margin-bottom: 1.5rem;
  padding: 1.5rem 2rem;
  border: 1px solid rgba(var(--garden-accent), 0.22);
  border-radius: 26px;
  background: linear-gradient(135deg, rgba(var(--garden-accent), 0.08), rgba(255, 255, 255, 0.78));
  box-shadow: 0 20px 44px rgba(95, 127, 114, 0.08);
  box-sizing: border-box;
}

.gardens-title-frame::before,
.gardens-title-frame::after {
  content: '';
  position: absolute;
  width: 18px;
  height: 18px;
  opacity: 0.9;
}

.gardens-title-frame::before {
  top: 12px;
  left: 12px;
  border-top: 1px solid rgba(var(--garden-accent), 0.72);
  border-left: 1px solid rgba(var(--garden-accent), 0.72);
}

.gardens-title-frame::after {
  right: 12px;
  bottom: 12px;
  border-right: 1px solid rgba(var(--garden-accent), 0.72);
  border-bottom: 1px solid rgba(var(--garden-accent), 0.72);
}

.gardens-title-frame .section-title {
  color: rgb(54, 82, 70);
  margin: 0;
  font-size: clamp(32px, 4vw, 46px);
  letter-spacing: 0.05em;
}

.garden-note {
  border-left-color: rgba(var(--garden-accent), 0.32);
  background: rgba(var(--garden-accent), 0.06);
}

.garden-note strong {
  color: var(--celadon-700);
}

.garden-methods-panel {
  padding-bottom: 1rem;
}

.three-notes-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.method-note {
  padding: 1.15rem 1.2rem;
  border: 1px solid rgba(var(--garden-accent), 0.16);
  border-radius: 24px;
  background: rgba(248, 252, 249, 0.9);
  box-shadow: 0 18px 36px rgba(95, 127, 114, 0.08);
}

.method-note h3 {
  margin: 0;
  font-size: 1.2rem;
  color: var(--celadon-700);
}

.method-note p {
  margin: 0.75rem 0 0;
  color: var(--ink-700);
}

@media (max-width: 980px) {
  .three-notes-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .gardens-title-frame {
    max-width: 100%;
    padding: 1.2rem 1.5rem;
  }

  .gardens-title-frame .section-title {
    font-size: 28px;
  }
}
</style>
