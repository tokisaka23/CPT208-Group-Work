<script setup>
import GardenDetailPage from '../components/GardenDetailPage.vue';
import { resolveGardenGalleryImage, resolveGardenHeroImage } from '../data/gardenImages';

const slug = 'tianpingshan';

const garden = {
  mapSlug: slug,
  kicker: '苏州秋色代表',
  name: '天平山',
  englishName: 'Tianping Mountain',
  intro:
    '如果想给苏州的秋天找一个最直接的答案，通常就是天平山。这里最适合在红枫进入状态的时节前来，看山径、古枫、寺院与远眺视野一起把秋意推到最满。',
  heroImage: resolveGardenHeroImage(
    slug,
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1800&dpr=2&auto=format',
  ),
  heroAlt: '天平山秋日红枫景色',
  design: {
    variant: 'liuyuan',
    accent: '#A44A2B',
    accentRgb: '164, 74, 43',
    secondary: '#D08B45',
    secondaryRgb: '208, 139, 69',
    watermark: '枫',
    heroImagePosition: 'center 48%',
    heroQuote: '先看山上的红，再回城里读秋。',
    heroCaption: '天平山适合做秋季路线的第一站，把最鲜明的季节感先收到眼里。',
    galleryTitle: '横向展开: 山径、枫色与远眺',
    galleryIntro: '这里的节奏和园林不同，先上山看开阔视野，再回到树下看颜色和层次。',
    highlightIntro: '秋天的天平山不只是“看枫叶”，更是看山路、古寺和苏州秋色如何叠在一起。',
    stepperIntro: '先抓整体色调，再找局部枝叶，最后把傍晚留给回城后的古街。',
    tipsTitle: '秋游建议',
    tipsIntro: '天平山最怕的是只顾打卡不顾节奏。把时间留给停顿，景色会比照片更完整。',
  },
  backHref: '/',
  badges: ['秋季主推', '红枫辨识度最高', '适合搭配古街收尾'],
  facts: [
    { label: '推荐季节', value: '11 月中下旬' },
    { label: '核心看点', value: '红枫、山径、古寺与远景' },
    { label: '推荐停留', value: '2 - 4 小时' },
    { label: '适合人群', value: '第一次来苏州看秋景的人' },
  ],
  highlights: [
    {
      title: '红枫是最明确的秋季记忆点',
      description:
        '苏州很多地方都能感到秋意，但天平山把季节性景观推得最鲜明。颜色一到位，整条路线的主题就会立刻成立。',
    },
    {
      title: '山景和城景形成反差',
      description:
        '它和园林的观看逻辑不同，不是一直在小空间里细读，而是先用山路和高差把视野打开，再回到树下看细节。',
    },
    {
      title: '适合接园林或古街做第二段',
      description:
        '看完最热烈的秋色之后，再去留园或平江路，会很容易把情绪从热闹收回到安静，路线层次更完整。',
    },
  ],
  itinerary: [
    {
      title: '第一段: 先从山径建立整体色调',
      description: '刚到不要急着贴近树叶拍照，先看山路、坡度和大片枫色如何把视线往上引。',
    },
    {
      title: '第二段: 再回到树下看局部层次',
      description: '等你知道整座山的颜色关系以后，再看古枫树干、枝叶层次和石阶，会更有节奏感。',
    },
    {
      title: '第三段: 下午回城接一段留园或平江路',
      description: '把最显眼的秋景放在前半段，后半段回到城里看更静的秋意，会比整天都停在山里更耐读。',
    },
  ],
  tips: [
    '如果是专门看枫叶，尽量提前确认红叶期，再决定日期。',
    '天气晴朗但不过分刺眼的时候，山上的色彩层次通常更明显。',
    '建议把天平山安排在秋季路线前半段，后半段转去留园或平江路更顺。',
  ],
  gallery: [
    {
      ratio: 'panorama',
      title: '先看整面秋山',
      caption: '先确认整座山的颜色关系，再决定从哪里慢慢停下来。',
      src: resolveGardenGalleryImage(
        slug,
        0,
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2200&dpr=2&auto=format',
      ),
    },
    {
      ratio: 'portrait',
      title: '树下看古枫枝干',
      caption: '贴近之后，真正耐看的往往是树干、石阶和叶色之间的关系。',
      src: resolveGardenGalleryImage(
        slug,
        1,
        'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600&dpr=2&auto=format',
      ),
    },
    {
      ratio: 'landscape',
      title: '石阶把节奏带出来',
      caption: '天平山的好看不只在颜色，也在上山这件事本身的节奏。',
      src: resolveGardenGalleryImage(
        slug,
        2,
        'https://images.unsplash.com/photo-1501785888041-af3ef285b470?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1800&dpr=2&auto=format',
      ),
    },
    {
      ratio: 'square',
      title: '把秋色收回城里',
      caption: '看完山景之后，再回到古街或园林，秋意会更沉下来。',
      src: resolveGardenGalleryImage(
        slug,
        3,
        'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1500&dpr=2&auto=format',
      ),
    },
  ],
  relatedGardens: [
    {
      kicker: '秋意收束',
      label: '留园',
      description: '看完天平山后，如果想把热烈的秋色收回到更安静的空间，可以接着看留园。',
      href: '/liu',
    },
    {
      kicker: '傍晚收尾',
      label: '平江路',
      description: '如果想把一天最后一段留给苏州城里的秋意，平江路会比继续赶景点更合适。',
      href: '/pingjiang-road',
    },
    {
      kicker: '回到首页',
      label: '继续切换四季主页',
      description: '回到首页后，可以继续查看春夏秋冬不同的苏州推荐。',
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
