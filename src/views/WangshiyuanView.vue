<script setup>
import GardenDetailPage from '../components/GardenDetailPage.vue';
import { resolveGardenGalleryImage, resolveGardenHeroImage } from '../data/gardenImages';

const slug = 'wangshiyuan';

const garden = {
  mapSlug: slug,
  kicker: '小中见大的代表',
  name: '网师园',
  englishName: 'The Master of Nets Garden',
  intro:
    '网师园的尺度更亲近，也更安静。它适合在走完大园之后再来看，你会明显感受到“小中见大”的精妙，以及建筑细部带来的诗意。',
  heroImage: resolveGardenHeroImage(
    slug,
    'https://images.unsplash.com/photo-1697832245666-78c870b29813?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600&dpr=2&auto=format',
  ),
  heroAlt: '网师园园林景观',
  design: {
    variant: 'wangshiyuan',
    accent: '#1C1917',
    accentRgb: '28, 25, 23',
    secondary: '#9F3F34',
    secondaryRgb: '159, 63, 52',
    watermark: '幽',
    heroImagePosition: 'center 44%',
    paper: 'rgba(255, 255, 255, 0.92)',
    paperStrong: 'rgba(255, 255, 255, 0.96)',
    muted: 'rgba(68, 64, 60, 0.86)',
    shadow: '0 36px 96px rgba(28, 25, 23, 0.16)',
    heroQuote: '小处更静，静处更深。',
    heroCaption: '把大园的喧闹放下，网师园会用更克制的尺度把你带回自己。',
    galleryTitle: '横向展开：夜游的余韵',
    galleryIntro: '这卷画更像低声讲述：不要滑得太快，让每张卡片之间留下呼吸的空隙。',
    highlightIntro: '它的精彩不靠“多”，而靠每一次裁切都刚刚好。',
    stepperIntro: '先建立整体比例，再贴近细部，最后找一个角落把时间放慢。',
    tipsTitle: '静读网师园',
    tipsIntro: '留白不是空，是把情绪留出来。把速度降下来，才会听见园林的声音。',
  },
  backHref: '/',
  badges: ['尺度亲近', '适合安静慢看', '细部很有味道'],
  facts: [
    { label: '推荐停留', value: '1.5 - 2 小时' },
    { label: '观看重点', value: '建筑细部、夜游氛围' },
    { label: '最佳节奏', value: '午后或傍晚更舒服' },
    { label: '适合人群', value: '喜欢静谧与细节' },
  ],
  highlights: [
    {
      title: '尺度不大，但景深丰富',
      description:
        '网师园非常适合细看。它的精彩并不靠“大”，而是靠每一个视角都经过收放与裁切，层层往里递进。',
    },
    {
      title: '建筑细部更容易被看见',
      description:
        '在较亲近的尺度里，砖雕、漏窗、匾额、栏杆与屋檐之间的关系会更清楚，也更容易进入情绪。',
    },
    {
      title: '氛围含蓄，适合慢下来',
      description:
        '如果你更喜欢安静的园林体验，网师园往往会留下很深印象，尤其适合在下午或夜色里停留。',
    },
  ],
  itinerary: [
    {
      title: '第一段：先走主空间建立比例感',
      description: '先感受整体尺度，你会更快理解为什么这座园林能在有限空间里做出丰富层次。',
    },
    {
      title: '第二段：贴近建筑细部观察',
      description: '可以有意识地看窗棂、栏杆、匾额与檐口，它们是网师园气质的重要来源。',
    },
    {
      title: '第三段：找一个安静角落停留',
      description: '试着坐一会儿、站一会儿，不急着赶路，网师园的魅力常常在停顿中出现。',
    },
  ],
  tips: [
    '如果当天安排了多座园林，建议把网师园放在后半程，心会更静。',
    '这里很适合观察“少即是多”的空间表达，不需要追求一次看完所有角落。',
    '遇到人少的时候，尽量多停留片刻，体验空间氛围比匆匆拍照更值得。',
  ],
  gallery: [
    {
      ratio: 'portrait',
      title: '一隅的光',
      caption: '图片收在一角，留白让尺度变得更深。',
      src: resolveGardenGalleryImage(
        slug,
        0,
        'https://images.unsplash.com/photo-1697832245666-78c870b29813?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1800&dpr=2&auto=format',
      ),
    },
    {
      ratio: 'square',
      title: '窗棂的节奏',
      caption: '靠近砖雕、漏窗和栏杆，气质会变得很具体。',
      src: resolveGardenGalleryImage(
        slug,
        1,
        'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1500&dpr=2&auto=format',
      ),
    },
    {
      ratio: 'landscape',
      title: '水面低声',
      caption: '小水面不喧哗，但每一次倒影都在替你留住时间。',
      src: resolveGardenGalleryImage(
        slug,
        2,
        'https://images.unsplash.com/photo-1526481280695-3c687fd643ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2000&dpr=2&auto=format',
      ),
    },
    {
      ratio: 'tall',
      title: '朱砂一点',
      caption: '极少量的红，让水墨更显安静。',
      src: resolveGardenGalleryImage(
        slug,
        3,
        'https://images.unsplash.com/photo-1548013146-72479768bada?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1400&dpr=2&auto=format',
      ),
    },
  ],
  relatedGardens: [
    {
      kicker: '回看开阔视野',
      label: '拙政园',
      description: '想重新回到更舒展的水院空间，可以切换到拙政园详情。',
      href: '/zhuozheng',
    },
    {
      kicker: '继续看层层框景',
      label: '留园',
      description: '如果你更喜欢连续廊道与转折叙事，可以继续看留园。',
      href: '/liu',
    },
    {
      kicker: '回到首页',
      label: '继续浏览主页面',
      description: '返回首页后，可以继续查看路线推荐和园林札记。',
      href: '/',
    },
  ],
  nextGarden: {
    label: '拙政园',
    href: '/zhuozheng',
  },
};
</script>

<template>
  <GardenDetailPage :garden="garden" />
</template>
