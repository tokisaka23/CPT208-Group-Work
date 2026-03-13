<script setup>
import GardenDetailPage from '../components/GardenDetailPage.vue';

const garden = {
  kicker: '框景层次代表',
  name: '留园',
  englishName: 'The Lingering Garden',
  intro:
    '留园很适合喜欢“移步换景”的人。它最迷人的地方不是单个景点，而是你在廊、院、厅、石之间不断被引导前进，节奏很完整。',
  heroImage:
    'https://images.unsplash.com/photo-1771937820345-6aced121dba7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600&dpr=2&auto=format',
  heroAlt: '留园园林景观',
  backHref: '#home',
  badges: ['长廊串联强', '框景丰富', '适合细看建筑'],
  facts: [
    { label: '推荐停留', value: '2 小时左右' },
    { label: '观看重点', value: '长廊、厅堂、山石' },
    { label: '最佳节奏', value: '跟着廊道慢慢转' },
    { label: '适合人群', value: '喜欢层次和构图' },
  ],
  highlights: [
    {
      title: '长廊把景串成连续叙事',
      description:
        '你在留园中很少会突然被抛到一个孤立场景里，更多时候是廊道带着你一步一步进入下一层画面。',
    },
    {
      title: '厅堂与庭院关系非常完整',
      description:
        '建筑内部与外部互相借景，站在不同位置回看，会发现门、窗、柱子本身也是景观的一部分。',
    },
    {
      title: '适合观察“转折”怎么发生',
      description:
        '从开到收、从明到暗、从宽到窄，这些变化在留园里很清楚，是理解苏州园林空间节奏的好地方。',
    },
  ],
  itinerary: [
    {
      title: '第一段：顺着廊道看整体连接',
      description: '进入后先不要频繁停下，先把连续空间关系走一遍，感受“移步换景”怎么自然发生。',
    },
    {
      title: '第二段：回头看门窗和框景',
      description: '第二遍再关注门框、漏窗和柱廊，你会发现同一个景被多次重新组织。',
    },
    {
      title: '第三段：停在庭院边缘看山石',
      description: '不要只看中轴景点，侧边与角落往往更能看到山石、植物与建筑如何互相衬托。',
    },
  ],
  tips: [
    '留园非常适合边走边回头看，很多精彩构图都在你转身时出现。',
    '如果你喜欢拍照，建议多站在廊道与门洞交界处寻找层层递进的画面。',
    '相比快速打卡，留园更适合两段式游览：先走一遍，再细看一遍。',
  ],
  relatedGardens: [
    {
      kicker: '前一站',
      label: '拙政园',
      description: '如果想先从更开阔的水院视野入门，可以回看拙政园。',
      href: '#/gardens/zhuozhengyuan',
    },
    {
      kicker: '下一站',
      label: '网师园',
      description: '想继续体验更小尺度、更安静的空间氛围，可以接着看网师园。',
      href: '#/gardens/wangshiyuan',
    },
    {
      kicker: '回到首页',
      label: '继续浏览主页面',
      description: '返回首页查看更多路线、札记与服务功能。',
      href: '#home',
    },
  ],
  nextGarden: {
    label: '网师园',
    href: '#/gardens/wangshiyuan',
  },
};
</script>

<template>
  <GardenDetailPage :garden="garden" />
</template>
