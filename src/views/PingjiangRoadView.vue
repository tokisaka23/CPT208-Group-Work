<script setup>
import GardenDetailPage from '../components/GardenDetailPage.vue';
import { resolveGardenGalleryImage, resolveGardenHeroImage } from '../data/gardenImages';

const slug = 'pingjiangroad';

const garden = {
  mapSlug: slug,
  kicker: '苏州水巷主线',
  name: '平江路',
  englishName: 'Pingjiang Road',
  intro:
    '平江路适合做很多路线的开头，也适合做最后的收尾。它不像园林那样把空间收得很紧，而是用河道、桥影、白墙和店铺把苏州的城市气质慢慢铺开。',
  heroImage: resolveGardenHeroImage(
    slug,
    'https://commons.wikimedia.org/wiki/Special:FilePath/Suzhou%20Pingjiang%20Road.jpg',
  ),
  heroAlt: '平江路临水街巷景色',
  design: {
    variant: 'zhuozheng',
    accent: '#5B7368',
    accentRgb: '91, 115, 104',
    secondary: '#C18A5A',
    secondaryRgb: '193, 138, 90',
    watermark: '河',
    heroImagePosition: 'center 52%',
    heroQuote: '先沿河认方向，再向支巷散开。',
    heroCaption: '平江路最适合承接节奏: 春天看柳，夏天看夜色，秋天看收束，冬天看白墙与安静水面。',
    galleryTitle: '横向展开: 河街、桥影与慢节奏',
    galleryIntro: '这里的精彩不靠单一景点，而是靠连续的沿河步行把气质慢慢积起来。',
    highlightIntro: '平江路值得看的不是“有没有打卡点”，而是苏州的城市感怎么在河边一点点展开。',
    stepperIntro: '先顺着主河走，再进支巷，最后把停留留给桥边和傍晚。',
    tipsTitle: '古街慢游',
    tipsIntro: '平江路适合空一点的行程安排。它不需要被塞满，反而需要给桥、水声和傍晚留时间。',
  },
  backHref: '/',
  badges: ['适合四季切换', '可作路线收尾', '白天夜晚气质不同'],
  facts: [
    { label: '推荐停留', value: '1.5 - 3 小时' },
    { label: '核心看点', value: '河街、桥影、支巷与夜色' },
    { label: '最佳时段', value: '傍晚到入夜前后' },
    { label: '适合人群', value: '喜欢散步和街巷气氛的人' },
  ],
  highlights: [
    {
      title: '它负责把苏州的整体气质打开',
      description:
        '如果园林是苏州的精读页，平江路更像目录页。先在这里建立对白墙黛瓦、河街关系和城市节奏的感受，后面再进园林会更顺。',
    },
    {
      title: '四季都有不同的停留理由',
      description:
        '春天看柳色，夏天看晚风和灯影，秋天看收束后的清爽，冬天看白墙和安静水面，所以它很适合做四季主页里的固定锚点。',
    },
    {
      title: '适合做路线的最后一段',
      description:
        '很多景点看完之后，真正把一天情绪收住的往往不是再赶一个点，而是在平江路沿河慢慢走完最后这段。',
    },
  ],
  itinerary: [
    {
      title: '第一段: 沿主河道先走一遍',
      description: '不要急着进店或拍照，先顺着河街走一段，把整体方向和气质建立起来。',
    },
    {
      title: '第二段: 再挑一两条支巷慢慢进去',
      description: '等你知道主线之后，再往支巷散开，才会更明显感受到平江路的层次和留白。',
    },
    {
      title: '第三段: 把最慢的时间留给傍晚',
      description: '傍晚时桥影、灯色和水面会开始接上，特别适合当一天的收尾。',
    },
  ],
  tips: [
    '如果当天安排了园林或博物馆，建议把平江路放在前后任意一端做节奏转换。',
    '这里更适合边走边看，不适合把时间全部花在单个店铺上。',
    '想拍照的话，桥边、转角和靠水的白墙段通常比人流密集处更耐看。',
  ],
  gallery: [
    {
      ratio: 'panorama',
      title: '先沿河看整体',
      caption: '平江路最先给人的不是细节，而是一整条临水旧街的气质。',
      src: resolveGardenGalleryImage(
        slug,
        0,
        'https://commons.wikimedia.org/wiki/Special:FilePath/Suzhou%20Pingjiang%20Road.jpg',
      ),
    },
    {
      ratio: 'portrait',
      title: '桥边最适合停顿',
      caption: '真正适合停下来的位置，往往在桥边和转角，而不是最热闹的人群中央。',
      src: resolveGardenGalleryImage(
        slug,
        1,
        'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1400&dpr=2&auto=format',
      ),
    },
    {
      ratio: 'landscape',
      title: '傍晚灯影慢慢接上',
      caption: '等到偏晚的时候，平江路才会把它最完整的一层气氛给出来。',
      src: resolveGardenGalleryImage(
        slug,
        2,
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1800&dpr=2&auto=format',
      ),
    },
    {
      ratio: 'square',
      title: '白墙水面最见苏州',
      caption: '就算什么都不做，只是沿河走过，苏州的气质也已经很完整。',
      src: resolveGardenGalleryImage(
        slug,
        3,
        'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1500&dpr=2&auto=format',
      ),
    },
  ],
  relatedGardens: [
    {
      kicker: '春夏连接',
      label: '拙政园',
      description: '如果想从水巷转入更典型的苏州园林，拙政园是最顺的下一站。',
      href: '/zhuozheng',
    },
    {
      kicker: '秋日收束',
      label: '天平山',
      description: '如果你是在秋天安排路线，可以先去天平山看枫叶，再回平江路收尾。',
      href: '/tianping',
    },
    {
      kicker: '回到首页',
      label: '继续切换四季主页',
      description: '回到首页后，可以继续查看春夏秋冬不同的景点推荐逻辑。',
      href: '/',
    },
  ],
  nextGarden: {
    label: '苏州博物馆',
    href: '/suzhou-museum',
  },
};
</script>

<template>
  <GardenDetailPage :garden="garden" />
</template>
