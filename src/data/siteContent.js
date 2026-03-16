// --- 原始卡片数据（来自你原先单页的 featuredGardens / museumsData / heritageData） ---
import kunquMuseumImage from '../assets/kunqu-museum.jpg';
import { resolveGardenCardImage ,resolveGardenGalleryImage} from './gardenImages';

export const featuredGardens = [
  {
    slug: 'zhuozhengyuan',
    dynasty: '明代名园',
    tag: '世界文化遗产',
    name: '拙政园',
    location: '苏州 · 姑苏区',
    distance: '📍 距主街 50米',
    rating: '4.9',
    description: '以水为脉、以亭为骨，园内形成“虽由人作，宛自天开”的经典空间秩序。',
    path: '/zhuozheng',
    image: resolveGardenCardImage(
      'zhuozhengyuan',
      'https://images.unsplash.com/photo-1611288618898-e2a93f848cf6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600&dpr=2&auto=format',
    ),
  },
  {
    slug: 'liuyuan',
    dynasty: '清代宅园',
    tag: '空间曲折精巧',
    name: '留园',
    location: '苏州 · 姑苏区',
    distance: '📍 距主街 900米',
    rating: '4.8',
    description: '长廊串联山水、厅堂与花木，节奏舒展，层次细腻，是“移步换景”的代表。',
    path: '/liu',
    gallery: [0, 1, 2].map(i => resolveGardenGalleryImage('liuyuan', i)),
    image: resolveGardenCardImage(
      'liuyuan',
      'https://images.unsplash.com/photo-1771937820345-6aced121dba7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600&dpr=2&auto=format',
    ),
  },
  {
    slug: 'wangshiyuan',
    dynasty: '宋韵遗意',
    tag: '小中见大',
    name: '网师园',
    location: '苏州 · 姑苏区',
    distance: '📍 距主街 650米',
    rating: '4.9',
    description: '以紧凑尺度营造出丰富景深，夜游时更显静谧含蓄，极具东方诗性。',
    path: '/wangshi',
    gallery: [0, 1, 2, 3].map(i => resolveGardenGalleryImage('wangshiyuan', i)),
    image: resolveGardenCardImage(
      'wangshiyuan',
      'https://images.unsplash.com/photo-1697832245666-78c870b29813?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600&dpr=2&auto=format',
    ),
  },
];

export const museumsData = [
  {
    name: '苏州博物馆',
    category: '建筑与文物',
    distance: '📍 距平江路步行约 12 分钟',
    objectPosition: '62% center',
    description:
      '从平江路转入东北街，贝聿铭以白墙、片石、水院和光影重构了现代语境下的苏州气质，适合与园林一并观看。',
    detail:
      '馆内既有吴地书画、瓷器、工艺等常设展陈，也有非常适合慢慢停留的庭院与连桥空间。它不是一座只看建筑外观的博物馆，而是把“现代设计语言”与“苏州传统审美”真正融合在了一起。',
    highlights: [
      '先看中庭与几何屋顶的明暗关系',
      '再进馆读吴地文物，形成“街巷—园林—文博”的完整脉络',
      '若时间充裕，可连同忠王府片区一起看，会更容易理解苏州城市文脉',
    ],
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Suzhou%20Museum%20%281%29.jpg',
  },
  {
    name: '昆曲博物馆',
    category: '戏曲与声腔',
    distance: '📍 距主街支巷即达',
    objectPosition: 'center 44%',
    description:
      '从平江路的水岸转入旧宅深处，展陈、戏台与曲谱共同把昆曲的身段、唱腔与江南生活连接起来。',
    detail:
      '这座馆更适合带着“听”的心情去看：服饰、道具、唱词、乐器和舞台空间会一点点把昆曲的节奏展开。相比单纯打卡拍照，它更像是平江路声景体验的一次延伸。',
    highlights: [
      '白天可看展陈与旧戏台空间',
      '留意戏服纹样、道具与唱本细节，会比匆匆走过更有意思',
      '夜晚可衔接评弹、昆曲演出，把街区声景听完整',
    ],
    image: kunquMuseumImage,
    fallbackImage: kunquMuseumImage,
  },
];

export const heritageData = [
  {
    name: '苏式汤面',
    category: '晨起一碗',
    distance: '距主街 30米',
    description: '白汤清亮、细面利落，浇头和汤头各有讲究，是进入平江路日常节奏最快的方式。',
    image:
      'https://images.unsplash.com/photo-1617093727343-374698b1b08d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900&dpr=2&auto=format',
  },
  {
    name: '评弹',
    category: '吴侬软语',
    distance: '距主街 80米',
    description: '一桌一椅、一弦一拍，在书场里把平江路的水声、人声与故事声慢慢叠在一起。',
    image:
      'https://images.unsplash.com/photo-1516280440614-37939bbacd81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900&dpr=2&auto=format',
  },
  {
    name: '宋锦',
    category: '织造非遗',
    distance: '距主街 120米',
    description: '纹样细密、色阶温润，把江南审美织进衣料与器物，也让平江路的手作气息更具体可见。',
    image:
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900&dpr=2&auto=format',
  },
];

// --- 多页路由页面使用的标准化卡片数据 ---
export const gardenCards = featuredGardens.map((garden) => ({
  title: garden.name,
  eyebrow: garden.dynasty,
  badge: garden.tag,
  subtitle: garden.location,
  meta: [garden.distance, `评分 ${garden.rating}`],
  description: garden.description,
  path: garden.path,
  image: garden.image,
  slug: garden.slug,
  gallery: garden.gallery,
}));

export const museumCards = museumsData.map((museum) => ({
  title: museum.name,
  eyebrow: museum.category,
  badge: museum.distance,
  subtitle: museum.description,
  meta: [],
  description: museum.detail,
  highlights: museum.highlights,
  objectPosition: museum.objectPosition,
  image: museum.image,
  fallbackImage: museum.fallbackImage,
}));

export const heritageCards = heritageData.map((moment) => ({
  title: moment.name,
  eyebrow: moment.category,
  badge: moment.distance,
  subtitle: '',
  meta: [],
  description: moment.description,
  image: moment.image,
}));

export const chapterCards = [
  {
    title: '古典园林',
    eyebrow: 'Garden Route',
    badge: '青瓷绿',
    subtitle: '在花窗与水院之间读懂苏州的静',
    meta: ['框景', '回廊', '移步换景'],
    description: '从拙政园、留园到网师园，建立一条由开阔到幽深、由大景到细部的观看路径。',
    image: resolveGardenCardImage(
      'zhuozhengyuan',
      'https://images.unsplash.com/photo-1611288618898-e2a93f848cf6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600&dpr=2&auto=format',
    ),
    to: '/gardens',
    actionLabel: '步入园林',
  },
  {
    title: '文博殿堂',
    eyebrow: 'Museum Route',
    badge: '朱砂红',
    subtitle: '让建筑、器物与戏曲把城市讲得更厚重',
    meta: ['建筑', '文物', '声景'],
    description: '从现代水院到旧宅戏台，在展厅与庭院的收放之间，慢慢读出苏州的文化肌理。',
    image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Suzhou%20Museum%20%281%29.jpg',
    to: '/museums',
    actionLabel: '步入文博',
  },
  {
    title: '非遗市井',
    eyebrow: 'Heritage Route',
    badge: '烟火气',
    subtitle: '从一碗面、一段评弹进入苏州的热闹生活面',
    meta: ['吃', '听', '买'],
    description: '把主街、河埠与支巷串起来，体会最真实的平江路日常节奏与人间烟火。',
    image:
      'https://images.unsplash.com/photo-1617093727343-374698b1b08d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900&dpr=2&auto=format',
    to: '/heritage',
    actionLabel: '步入市井',
  },
];

export const pingjiangRhythms = [
  {
    title: '晨起看河埠',
    text: '早些到达，听见洗帚、开铺、行人轻语，平江路一天的节奏会从水边慢慢醒来。',
  },
  {
    title: '午后入园',
    text: '把园林放在日光变柔的时候，白墙、花窗与树影的层次会更耐看，停留也更从容。',
  },
  {
    title: '夜色听曲',
    text: '等到灯火与水面互相映照，再回到书场与小馆，平江路的“声景”会比白天更完整。',
  },
];

export const museumDetails = [
  '局部以朱砂红提气，但始终保持克制，让厚重感来自材质与留白。',
  '标题分割线和标签采用印章式比例，避免过度装饰。',
  '用更深的文字层级和更清晰的边界，强调“读城”的分量感。',
];

export const heritageSteps = [
  '先吃一碗热面，把身体速度放下来。',
  '再拐进支巷听评弹，让耳朵接管节奏。',
  '最后看手作与市集，把热闹收进可带走的器物里。',
];
