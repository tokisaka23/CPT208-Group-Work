<script setup>
import GardenDetailPage from '../components/GardenDetailPage.vue';
import { resolveGardenGalleryImage, resolveGardenHeroImage } from '../data/gardenImages';

const slug = 'suzhoumuseum';

const garden = {
  mapSlug: slug,
  kicker: '园林外的文博入口',
  name: '苏州博物馆',
  englishName: 'Suzhou Museum',
  intro:
    '如果你想把苏州看得更完整，苏州博物馆很适合接在园林之后。它不是简单的室内替代，而是用建筑、庭院、展陈与光影，把苏州的古典审美翻译成当代空间。',
  heroImage: resolveGardenHeroImage(
    slug,
    'https://commons.wikimedia.org/wiki/Special:FilePath/Suzhou%20Museum%20%281%29.jpg',
  ),
  heroAlt: '苏州博物馆建筑外观',
  design: {
    variant: 'wangshiyuan',
    accent: '#2E3946',
    accentRgb: '46, 57, 70',
    secondary: '#A33B29',
    secondaryRgb: '163, 59, 41',
    watermark: '博',
    heroImagePosition: 'center center',
    paper: 'rgba(255, 255, 255, 0.94)',
    paperStrong: 'rgba(255, 255, 255, 0.98)',
    muted: 'rgba(68, 64, 60, 0.84)',
    shadow: '0 36px 96px rgba(28, 25, 23, 0.14)',
    heroQuote: '先看建筑，再读展陈。',
    heroCaption: '冬天尤其适合把苏州博物馆接入路线，让室内外的节奏自然切换。',
    galleryTitle: '横向展开: 几何、庭院与器物',
    galleryIntro: '这里不是一路热闹地推进，而是让你在建筑尺度和文物细节之间来回切换。',
    highlightIntro: '苏州博物馆最值得看的是“怎么被设计成苏州”，而不只是“里面放了什么”。',
    stepperIntro: '先从建筑和庭院读气质，再进入展厅，最后回到中庭收尾。',
    tipsTitle: '文博路线建议',
    tipsIntro: '来到这里，不要只顾着进展厅。先把建筑读懂，后面的文物和空间关系才更清楚。',
  },
  backHref: '/',
  badges: ['冬季友好', '适合接园林路线', '建筑本身值得看'],
  facts: [
    { label: '推荐停留', value: '1.5 - 3 小时' },
    { label: '核心看点', value: '建筑、庭院、吴地文物' },
    { label: '适合季节', value: '四季皆宜，冬天尤其合适' },
    { label: '适合人群', value: '想把园林和文博连起来的人' },
  ],
  highlights: [
    {
      title: '建筑本身就是苏州气质的翻译',
      description:
        '白墙、片石、几何屋面和庭院关系，让它既是现代建筑，又能和苏州园林、古城气质自然接上。',
    },
    {
      title: '很适合接在园林后面看',
      description:
        '看完留园或网师园之后来到这里，你会更清楚地感到苏州审美并没有断开，只是换了一种说法。',
    },
    {
      title: '冬季路线尤其需要它',
      description:
        '当天气偏冷或不想一直在户外时，苏州博物馆能把节奏稳住，同时不破坏整条路线的气质。',
    },
  ],
  itinerary: [
    {
      title: '第一段: 先看入口和中庭的空间关系',
      description: '刚到时先不要急着进展厅，先看建筑外部、院落、水面与屋顶线条如何组织视线。',
    },
    {
      title: '第二段: 再按兴趣进入展陈',
      description: '等你先建立了空间感，再去看吴地书画、器物与工艺，理解会更完整。',
    },
    {
      title: '第三段: 最后回到庭院和过渡空间',
      description: '离开前再站回中庭或连桥位置，你会更清楚这座馆为什么适合和苏州园林并置观看。',
    },
  ],
  tips: [
    '如果当天还安排了园林，建议一静一动搭配，不要把所有室内项目堆在一起。',
    '进馆前先绕着建筑外侧和庭院看一圈，体验会明显更完整。',
    '冬天或下雨天尤其适合把它作为路线中段，帮助节奏切换。',
  ],
  gallery: [
    {
      ratio: 'panorama',
      title: '先读建筑轮廓',
      caption: '先看建筑和庭院，后面的文物与展厅才会更容易接上苏州气质。',
      src: resolveGardenGalleryImage(
        slug,
        0,
        'https://commons.wikimedia.org/wiki/Special:FilePath/Suzhou%20Museum%20%281%29.jpg',
      ),
    },
    {
      ratio: 'portrait',
      title: '几何与白墙',
      caption: '它的现代感不是跳出来的，而是被苏州传统审美慢慢约束出来的。',
      src: resolveGardenGalleryImage(
        slug,
        1,
        'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1500&dpr=2&auto=format',
      ),
    },
    {
      ratio: 'landscape',
      title: '中庭让节奏慢下来',
      caption: '苏州博物馆最好的地方之一，是它知道什么时候该把人从展柜前拉回空间里。',
      src: resolveGardenGalleryImage(
        slug,
        2,
        'https://images.unsplash.com/photo-1518998053901-5348d3961a04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1800&dpr=2&auto=format',
      ),
    },
    {
      ratio: 'square',
      title: '适合接冬日路线',
      caption: '在偏冷的天气里，它能自然接住园林路线的后半段。',
      src: resolveGardenGalleryImage(
        slug,
        3,
        'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1500&dpr=2&auto=format',
      ),
    },
  ],
  relatedGardens: [
    {
      kicker: '先看园林',
      label: '留园',
      description: '如果想把园林和文博拼成一条更安静的线，留园很适合作为前一站。',
      href: '/liu',
    },
    {
      kicker: '城市主线',
      label: '平江路',
      description: '如果你想把建筑与街巷串起来，可以从平江路继续把苏州城市气质往外推开。',
      href: '/pingjiang-road',
    },
    {
      kicker: '回到首页',
      label: '继续切换四季主页',
      description: '回到首页后，可以继续查看四季主页里的推荐逻辑。',
      href: '/',
    },
  ],
  nextGarden: {
    label: '平江路',
    href: '/pingjiang-road',
  },
};
</script>

<template>
  <GardenDetailPage :garden="garden" />
</template>
