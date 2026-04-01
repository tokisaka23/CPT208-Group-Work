<script setup>
import { computed } from 'vue';
import InkCard from '../components/InkCard.vue';
import { currentLanguage, resolveLocalized } from '../i18n';
import { useSiteContent } from '../data/siteContent';

const { gardenCards } = useSiteContent();

const pageTextSource = {
  title: {
    zh: '借一窗幽绿，藏半部江南',
    en: 'Borrow a window of green and hold half of Jiangnan within it.',
    ja: '一枚の窓に幽かな緑を借り、江南の半分をしのばせる。',
    ko: '한 칸의 창에 그윽한 녹음을 빌려 강남의 절반을 담는다.',
  },
  lead: {
    zh: '不出城郭而获山水之怡。将自然山水浓缩于方寸之间，让脚步和心跳随着回廊一起慢下来。',
    en: 'Within the city walls, these gardens condense mountains and waters into intimate scales, slowing both your pace and your breathing.',
    ja: '城を離れずして山水の気配を得る。自然の景を小さな尺度へ凝縮し、歩みと呼吸を回廊とともに静かにしてくれる。',
    ko: '성곽을 벗어나지 않고도 산수의 기운을 얻는다. 자연을 작은 스케일로 응축해 걸음과 호흡을 함께 늦춰 준다.',
  },
  noteTitle: {
    zh: '观看建议',
    en: 'How to Read the Gardens',
    ja: '見方のヒント',
    ko: '관람 팁',
  },
  noteBody: {
    zh: '先从拙政园建立水院尺度，再进留园看连续框景，最后到网师园细读小中见大的诗意。',
    en: 'Begin with the open water courts of Humble Administrator\'s Garden, move to the layered framing of Lingering Garden, and end with the quiet precision of Master of Nets Garden.',
    ja: 'まずは拙政園で水庭の尺度をつかみ、次に留園で連続するフレームを見て、最後に網師園で小さく深い詩情を読む。',
    ko: '먼저 졸정원에서 수원의 스케일을 잡고, 유원에서 연속적인 프레임 풍경을 본 뒤, 마지막에 망사원에서 작지만 깊은 시성을 읽는다.',
  },
  methodsTitle: {
    zh: '三步看园，不急，景自然会浮出来。',
    en: 'See a garden in three steps and let the view reveal itself slowly.',
    ja: '三つの段階で庭を見る。急がなければ景色は自然に立ち上がる。',
    ko: '세 단계로 정원을 본다. 서두르지 않으면 풍경은 스스로 떠오른다.',
  },
  methods: [
    {
      title: {
        zh: '先看大势',
        en: 'See the Whole First',
        ja: 'まず全体を見る',
        ko: '먼저 큰 흐름을 본다',
      },
      text: {
        zh: '先不要急着拍照，顺着游线走一遍，感受水院、廊道与山石的整体关系。',
        en: 'Do not rush to photograph. Walk the route once and read the overall relation between water courts, corridors, and rocks.',
        ja: '急いで写真を撮らず、まずは一周して水庭・回廊・石組の全体関係を感じる。',
        ko: '사진부터 찍지 말고 한 바퀴 걸으며 수원과 회랑, 괴석의 전체 관계를 읽는다.',
      },
    },
    {
      title: {
        zh: '再看框景',
        en: 'Then Read the Frames',
        ja: '次にフレームを見る',
        ko: '다음은 프레임 풍경을 본다',
      },
      text: {
        zh: '第二遍回头看门洞、花窗和柱廊，会发现景色其实被反复裁切与重组。',
        en: 'On the second pass, doorways and lattice windows reveal how the view has been cut and recomposed again and again.',
        ja: '二周目には門洞や花窓、柱廊に目を向けると、景色が何度も切り取り直されているのが見えてくる。',
        ko: '두 번째에는 문과 화창, 주랑을 보며 풍경이 여러 번 잘리고 다시 조합되는 방식을 본다.',
      },
    },
    {
      title: {
        zh: '最后停留',
        en: 'End with Stillness',
        ja: '最後にとどまる',
        ko: '마지막은 머무르기',
      },
      text: {
        zh: '找一个边缘位置坐一会儿，园林真正动人的地方往往出现在停顿之后。',
        en: 'Sit at an edge for a while. The most moving moments often appear after you stop.',
        ja: '少し端の場所に腰を下ろす。庭園のいちばん心を動かす部分は、立ち止まったあとに現れることが多い。',
        ko: '가장자리 어딘가에 잠시 앉아 본다. 정원의 가장 인상적인 순간은 멈춘 뒤에 나타나는 경우가 많다.',
      },
    },
  ],
};

const pageText = computed(() => resolveLocalized(pageTextSource, currentLanguage.value));
const gardenMethods = computed(() => pageText.value.methods);
</script>

<template>
  <div class="page-shell gardens-page">
    <section class="section-block section-block--first garden-intro-panel">
      <div class="section-header">
        <div>
          <p class="eyebrow">Classical Gardens</p>
          <div class="gardens-title-frame">
            <h1 class="section-title">{{ pageText.title }}</h1>
          </div>
          <p class="section-lead">
            {{ pageText.lead }}
          </p>
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
          <p class="eyebrow">How To See</p>
          <h2 class="section-title">{{ pageText.methodsTitle }}</h2>
        </div>
      </div>

      <div class="three-notes-grid">
        <article v-for="item in gardenMethods" :key="item.title" class="method-note">
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
