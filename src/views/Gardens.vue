<script setup>
import InkCard from '../components/InkCard.vue';
import { gardenCards } from '../data/siteContent';

const gardenMethods = [
  {
    title: '先看大势',
    text: '先不要急着拍照，顺着游线走一遍，感受水院、廊道与山石的整体关系。',
  },
  {
    title: '再看框景',
    text: '第二遍回头看门洞、花窗和柱廊，会发现景色其实被反复裁切与重组。',
  },
  {
    title: '最后停留',
    text: '找一个边缘位置坐一会儿，园林真正动人的地方往往出现在停顿之后。',
  },
];
</script>

<template>
  <div class="page-shell gardens-page">
    <section class="section-block section-block--first garden-intro-panel">
      <div class="section-header">
        <div>
          <p class="eyebrow">Classical Gardens</p>
          <h1 class="section-title">古典园林页，把青瓷绿轻轻铺进纸面，让苏州的生机带一点幽润。</h1>
          <p class="section-lead">
            延续平江主线的静气，但把整体纸色微微推向幽绿：让白墙、水石、树影与花窗，在更柔和的底色里显得清朗而有呼吸感。
          </p>
        </div>
        <div class="section-note garden-note">
          <strong>观看建议</strong>
          <p>先从拙政园建立水院尺度，再进留园看连续框景，最后到网师园细读小中见大的诗意。</p>
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
          <h2 class="section-title">三步看园，不急，景自然会浮出来。</h2>
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
  position: relative;
}

.gardens-page::before {
  content: '';
  position: absolute;
  inset: 1rem 0 auto;
  height: 16rem;
  border-radius: 32px;
  background:
    radial-gradient(circle at 20% 30%, rgba(95, 127, 114, 0.18), transparent 44%),
    linear-gradient(180deg, rgba(95, 127, 114, 0.08), rgba(95, 127, 114, 0));
  pointer-events: none;
  z-index: -1;
}

.garden-intro-panel {
  padding: 1.2rem 0 0;
}

.garden-note {
  border-left-color: rgba(95, 127, 114, 0.32);
  background: rgba(95, 127, 114, 0.06);
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
  border: 1px solid rgba(95, 127, 114, 0.16);
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
</style>
