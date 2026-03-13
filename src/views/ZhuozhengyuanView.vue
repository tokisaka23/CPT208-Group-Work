<script setup>
import GardenDetailPage from '../components/GardenDetailPage.vue';

const garden = {
  kicker: '经典入门园林',
  name: '拙政园',
  englishName: 'The Humble Administrator’s Garden',
  intro:
    '如果你想第一次就看懂苏州园林，拙政园很适合作为起点。它的水面开阔、亭榭舒展，适合先从大空间建立整体感，再慢慢进入细部。',
  heroImage:
    'https://images.unsplash.com/photo-1611288618898-e2a93f848cf6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600&dpr=2&auto=format',
  heroAlt: '拙政园园林景观',
  backHref: '#home',
  badges: ['适合第一次来苏州', '水院视野开阔', '慢游友好'],
  facts: [
    { label: '推荐停留', value: '2 - 3 小时' },
    { label: '观看重点', value: '水院、亭榭、借景' },
    { label: '最佳节奏', value: '上午先看整体' },
    { label: '适合人群', value: '初次游园与拍照' },
  ],
  highlights: [
    {
      title: '先被水院打开视线',
      description:
        '拙政园最迷人的地方之一，是你一进入就能感受到空间被池水慢慢拉开，视线和呼吸都更舒缓。',
    },
    {
      title: '亭榭与长窗形成层次',
      description:
        '远看有节奏，近看有细节。亭台、水榭、花窗与植物彼此呼应，很适合慢慢观察前后景关系。',
    },
    {
      title: '大空间里依然有细腻转折',
      description:
        '虽然整体气质开阔，但它并不单调，步行过程中仍然会经历遮挡、转折和重新展开的空间变化。',
    },
  ],
  itinerary: [
    {
      title: '第一段：先沿水面走一圈',
      description: '不要急着拍局部，先从主要水面与亭榭关系建立整体印象，再进入细部会更容易看懂。',
    },
    {
      title: '第二段：停下来看看窗框取景',
      description: '走到长窗和洞门附近时，试着停 1 到 2 分钟，你会发现画面中的树、水、建筑会重新组合。',
    },
    {
      title: '第三段：留一点时间给安静角落',
      description: '除了主景，也可以刻意走慢一点，去看人少的转角、檐下与水边，气氛会更完整。',
    },
  ],
  tips: [
    '上午光线更柔和，适合先从整体空间建立印象。',
    '如果人流较多，尽量不要跟着人群节奏赶路，慢下来会更容易发现细节。',
    '拍照时可多利用窗框、廊柱和倒影，它们能自然形成东方画面的层次。',
  ],
  relatedGardens: [
    {
      kicker: '下一站推荐',
      label: '留园',
      description: '如果你想看更连续的廊道和更强的转折感，接着看留园会很顺。',
      href: '#/gardens/liuyuan',
    },
    {
      kicker: '夜游气质',
      label: '网师园',
      description: '想体验更静的尺度和更含蓄的空间气质，可以继续看网师园。',
      href: '#/gardens/wangshiyuan',
    },
    {
      kicker: '回到首页',
      label: '继续浏览主页面',
      description: '返回首页后，你还可以查看推荐路线、园林札记与更多服务。',
      href: '#home',
    },
  ],
  nextGarden: {
    label: '留园',
    href: '#/gardens/liuyuan',
  },
};
</script>

<template>
  <GardenDetailPage :garden="garden" />
</template>
