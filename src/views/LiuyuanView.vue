<script setup>
import GardenDetailPage from '../components/GardenDetailPage.vue';
import { resolveGardenGalleryImage, resolveGardenHeroImage } from '../data/gardenImages';

const slug = 'liuyuan';

const garden = {
  mapSlug: slug,
  kicker: '框景层次代表',
  name: '留园',
  englishName: 'The Lingering Garden',
  intro:
    '留园很适合喜欢“移步换景”的人。它最迷人的地方不是单个景点，而是你在廊、院、厅、石之间不断被引导前进，节奏很完整。',
  heroImage: resolveGardenHeroImage(
    slug,
    'https://images.unsplash.com/photo-1771937820345-6aced121dba7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600&dpr=2&auto=format',
  ),
  heroAlt: '留园园林景观',
  design: {
    variant: 'liuyuan',
    accent: '#6D4324',
    accentRgb: '109, 67, 36',
    secondary: '#A67448',
    secondaryRgb: '166, 116, 72',
    watermark: '境',
    heroImagePosition: 'center center',
    heroQuote: '不是一眼望尽，而是一转再转。',
    heroCaption: '留园的节奏来自廊道、门洞与厅堂之间不断重组的框景。',
    galleryTitle: '横向展开：一卷曲廊',
    galleryIntro: '画卷里的卡片高低错落，像走在曲廊里，视线一会儿被抬起，一会儿被收进门洞。',
    highlightIntro: '在留园，精彩不是单点爆发，而是连续的“前后景关系”。',
    stepperIntro: '先顺着廊道建立叙事，再回头看每一处转折如何发生。',
    tipsIntro: '留园适合边走边回头。精彩画面，常常在转身之后才真正成立。',
  },
  backHref: '/',
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
  gallery: [
    {
      ratio: 'landscape',
      title: '先看廊道串联',
      caption: '不要急着停，先让曲廊把空间关系连成一句完整的话。',
      src: resolveGardenGalleryImage(
        slug,
        0,
        'https://images.unsplash.com/photo-1771937820345-6aced121dba7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2200&dpr=2&auto=format',
      ),
    },
    {
      ratio: 'tall',
      title: '门洞像取景器',
      caption: '月洞门与漏窗，是留园最会“裁切景色”的地方。',
      src: resolveGardenGalleryImage(
        slug,
        1,
        'https://images.unsplash.com/photo-1555217851-6141535bd771?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600&dpr=2&auto=format',
      ),
    },
    {
      ratio: 'panorama',
      title: '厅堂与庭院互借',
      caption: '内外相看，柱子、窗棂和门框本身也成了景。',
      src: resolveGardenGalleryImage(
        slug,
        2,
        'https://images.unsplash.com/photo-1530789253388-582c481c54b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2200&dpr=2&auto=format',
      ),
    },
    {
      ratio: 'portrait',
      title: '山石藏在转角',
      caption: '别只盯着中轴，侧边与角落往往更有味道。',
      src: resolveGardenGalleryImage(
        slug,
        3,
        'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1500&dpr=2&auto=format',
      ),
    },
  ],
  relatedGardens: [
    {
      kicker: '前一站',
      label: '拙政园',
      description: '如果想先从更开阔的水院视野入门，可以回看拙政园。',
      href: '/zhuozheng',
    },
    {
      kicker: '下一站',
      label: '网师园',
      description: '想继续体验更小尺度、更安静的空间氛围，可以接着看网师园。',
      href: '/wangshi',
    },
    {
      kicker: '回到首页',
      label: '继续浏览主页面',
      description: '返回首页查看更多路线、札记与服务功能。',
      href: '/',
    },
  ],
  nextGarden: {
    label: '网师园',
    href: '/wangshi',
  },
};
</script>

<template>
  <GardenDetailPage :garden="garden" />
</template>
