import { resolveGardenGalleryImage } from './gardenImages';

const slug = 'zhuozhengyuan';

const buildHotspot = ({
  id,
  label,
  title,
  description,
  x,
  y,
}) => ({
  id,
  label,
  title,
  description,
  x,
  y,
  yaw: Math.round(x * 3.6),
  pitch: Math.round((50 - y) * 1.5),
});

export const zhuozhengPanoramaScenesSource = [
  {
    id: 'furong-xie',
    order: '01',
    isPanorama: false,
    title: {
      zh: '芙蓉榭',
      en: 'Furong Xie',
    },
    description: {
      zh: '先从东园水边切入，读清临水亭榭和岸线之间的关系。',
      en: 'Start from the eastern water edge and read the relation between the pavilion and shoreline.',
    },
    image: resolveGardenGalleryImage(slug, 0, ''),
    sourcePage: 'https://commons.wikimedia.org/wiki/File%3ASuzhou_Zhuozheng_Yuan_2015.04.23_08-06-07.jpg',
    sourceName: 'Project asset + Wikimedia reference',
    sourceAuthor: 'Local project asset / Zhangzhugang reference',
    sourceLicense: 'Local project asset',
    sourceLabel: {
      zh: '当前展示使用项目内拙政园图片，景点参考为芙蓉榭',
      en: 'Current display uses the local project image, referenced to Furong Xie',
    },
    initialPan: 34,
    hotspots: [
      buildHotspot({
        id: 'furong-water',
        label: 'Water Edge',
        title: {
          zh: '先看水边尺度',
          en: 'Start with the water edge',
        },
        description: {
          zh: '这一层先建立人、亭、水三者之间的距离感。',
          en: 'This first reading establishes the distance between visitor, pavilion, and water.',
        },
        x: 28,
        y: 64,
      }),
      buildHotspot({
        id: 'furong-pavilion',
        label: 'Pavilion',
        title: {
          zh: '临水亭榭',
          en: 'Waterside pavilion',
        },
        description: {
          zh: '贴近建筑本体后，画面的节奏会从开阔转向停顿。',
          en: 'As the building comes forward, the scene shifts from openness to pause.',
        },
        x: 61,
        y: 45,
      }),
    ],
  },
  {
    id: 'hefeng-simianting',
    order: '02',
    isPanorama: false,
    title: {
      zh: '荷风四面亭',
      en: 'Hefeng Simianting',
    },
    description: {
      zh: '这一景更适合看借景逻辑，亭、水和远处天际要一起读。',
      en: 'This node is best for reading borrowed scenery across pavilion, pond, and skyline.',
    },
    image: resolveGardenGalleryImage(slug, 1, ''),
    sourcePage: 'https://commons.wikimedia.org/wiki/File%3ASuzhou_Zhuozheng_Yuan_2015.04.23_08-13-07.jpg',
    sourceName: 'Project asset + Wikimedia reference',
    sourceAuthor: 'Local project asset / Zhangzhugang reference',
    sourceLicense: 'Local project asset',
    sourceLabel: {
      zh: '当前展示使用项目内拙政园图片，景点参考为荷风四面亭',
      en: 'Current display uses the local project image, referenced to Hefeng Simianting',
    },
    initialPan: 46,
    hotspots: [
      buildHotspot({
        id: 'hefeng-pavilion',
        label: 'Pavilion',
        title: {
          zh: '荷风四面亭',
          en: 'Hefeng Simianting',
        },
        description: {
          zh: '亭子像一个稳定锚点，把开阔水面重新组织起来。',
          en: 'The pavilion stabilizes the scene and reorganizes the open water view.',
        },
        x: 67,
        y: 46,
      }),
      buildHotspot({
        id: 'hefeng-borrowed-view',
        label: 'Borrowed View',
        title: {
          zh: '远借视线',
          en: 'Borrowed view',
        },
        description: {
          zh: '这里真正重要的是视线被再次拉远，而不只是亭子本身。',
          en: 'What matters here is how the eye is pulled farther out, not just the pavilion itself.',
        },
        x: 82,
        y: 27,
      }),
    ],
  },
  {
    id: 'yuanxiang-tang',
    order: '03',
    isPanorama: false,
    title: {
      zh: '远香堂',
      en: 'Yuanxiang Tang',
    },
    description: {
      zh: '远香堂是中园最重要的观看节点之一，适合把视线从水面重新收回。',
      en: 'Yuanxiang Tang is one of the key viewing nodes where the gaze gathers back from the water.',
    },
    image: resolveGardenGalleryImage(slug, 2, ''),
    sourcePage: 'https://commons.wikimedia.org/wiki/File%3ASuzhou_Zhuozheng_Yuan_2015.04.23_08-55-14.jpg',
    sourceName: 'Project asset + Wikimedia reference',
    sourceAuthor: 'Local project asset / Zhangzhugang reference',
    sourceLicense: 'Local project asset',
    sourceLabel: {
      zh: '当前展示使用项目内拙政园图片，景点参考为远香堂',
      en: 'Current display uses the local project image, referenced to Yuanxiang Tang',
    },
    initialPan: 48,
    hotspots: [
      buildHotspot({
        id: 'yuanxiang-hall',
        label: 'Hall',
        title: {
          zh: '远香堂主体',
          en: 'Main hall',
        },
        description: {
          zh: '堂体让开阔空间变得更有中心，也更容易形成观看停顿。',
          en: 'The hall recenters the broad space and creates a more deliberate pause.',
        },
        x: 56,
        y: 42,
      }),
      buildHotspot({
        id: 'yuanxiang-foreground',
        label: 'Forecourt',
        title: {
          zh: '前场停顿',
          en: 'Foreground pause',
        },
        description: {
          zh: '从前景回看时，建筑、树影和水面会叠出完整层次。',
          en: 'Looking back through the foreground makes the hall, trees, and water layer together.',
        },
        x: 34,
        y: 67,
      }),
    ],
  },
  {
    id: 'xiaofeihong',
    order: '04',
    isPanorama: false,
    title: {
      zh: '小飞虹',
      en: 'Xiao Feihong',
    },
    description: {
      zh: '这一景的重点不是单独看桥，而是桥、廊和倒影一起出现。',
      en: 'The key here is not the bridge alone, but bridge, corridor, and reflection together.',
    },
    image: resolveGardenGalleryImage(slug, 3, ''),
    sourcePage: 'https://commons.wikimedia.org/wiki/File%3ACovered_bridge_in_Humble_Administrator%27s_Garden.JPG',
    sourceName: 'Project asset + Wikimedia reference',
    sourceAuthor: 'Local project asset / Han Duyi reference',
    sourceLicense: 'Local project asset',
    sourceLabel: {
      zh: '当前展示使用项目内拙政园图片，景点参考为小飞虹',
      en: 'Current display uses the local project image, referenced to Xiao Feihong',
    },
    initialPan: 54,
    hotspots: [
      buildHotspot({
        id: 'xiao-bridge',
        label: 'Covered Bridge',
        title: {
          zh: '桥体中轴',
          en: 'Bridge axis',
        },
        description: {
          zh: '小飞虹最强的地方在于中轴感非常稳，景别一眼就成立。',
          en: 'Xiao Feihong is powerful because its axis reads instantly and very clearly.',
        },
        x: 50,
        y: 47,
      }),
      buildHotspot({
        id: 'xiao-reflection',
        label: 'Reflection',
        title: {
          zh: '桥与倒影',
          en: 'Bridge and reflection',
        },
        description: {
          zh: '真正完整的画面是桥和水面一起构成的双重结构。',
          en: 'The full composition emerges when bridge and water reflection are read together.',
        },
        x: 50,
        y: 74,
      }),
    ],
  },
  {
    id: 'liuting-ge',
    order: '05',
    isPanorama: false,
    title: {
      zh: '留听阁',
      en: 'Liuting Ge',
    },
    description: {
      zh: '西园更安静，留听阁适合把注意力从大空间转向细部停留。',
      en: 'The western garden is quieter, and Liuting Ge shifts attention toward finer pauses.',
    },
    image: resolveGardenGalleryImage(slug, 1, ''),
    sourcePage: 'https://commons.wikimedia.org/wiki/File%3ASuzhou_Zhuozheng_Yuan_2015.04.23_08-34-51.jpg',
    sourceName: 'Project asset + Wikimedia reference',
    sourceAuthor: 'Local project asset / Zhangzhugang reference',
    sourceLicense: 'Local project asset',
    sourceLabel: {
      zh: '当前展示使用项目内拙政园图片，景点参考为留听阁',
      en: 'Current display uses the local project image, referenced to Liuting Ge',
    },
    initialPan: 52,
    hotspots: [
      buildHotspot({
        id: 'liuting-facade',
        label: 'Facade',
        title: {
          zh: '留听阁立面',
          en: 'Liuting Ge facade',
        },
        description: {
          zh: '西园的观看节奏更紧，立面和近景植物会比大水面更重要。',
          en: 'In the west garden, facade and foreground planting matter more than broad water views.',
        },
        x: 51,
        y: 42,
      }),
      buildHotspot({
        id: 'liuting-approach',
        label: 'Approach',
        title: {
          zh: '接近路径',
          en: 'Approach route',
        },
        description: {
          zh: '斜向接近时，园林那种“缓入”感会更明显。',
          en: 'Approaching obliquely makes the garden’s slower entry rhythm easier to feel.',
        },
        x: 36,
        y: 66,
      }),
    ],
  },
  {
    id: 'jianshan-lou',
    order: '06',
    isPanorama: false,
    title: {
      zh: '见山楼',
      en: 'Jianshan Lou',
    },
    description: {
      zh: '见山楼适合做收束节点，建筑和水面会把游览重新稳住。',
      en: 'Jianshan Lou works as a closing node that stabilizes the visit through building and water.',
    },
    image: resolveGardenGalleryImage(slug, 2, ''),
    sourcePage: 'https://commons.wikimedia.org/wiki/File%3A%E6%8B%99%E6%94%BF%E5%9B%AD%E8%A7%81%E5%B1%B1%E6%A5%BC2024.11_%283%29.jpg',
    sourceName: 'Project asset + Wikimedia reference',
    sourceAuthor: 'Local project asset / ScareCriterion12 reference',
    sourceLicense: 'Local project asset',
    sourceLabel: {
      zh: '当前展示使用项目内拙政园图片，景点参考为见山楼',
      en: 'Current display uses the local project image, referenced to Jianshan Lou',
    },
    initialPan: 44,
    hotspots: [
      buildHotspot({
        id: 'jianshan-building',
        label: 'Building',
        title: {
          zh: '见山楼主体',
          en: 'Jianshan Lou massing',
        },
        description: {
          zh: '楼体和近水关系会让结尾场景显得更稳，也更完整。',
          en: 'The building’s relation to nearby water makes the closing scene feel settled and complete.',
        },
        x: 58,
        y: 43,
      }),
      buildHotspot({
        id: 'jianshan-water',
        label: 'Water',
        title: {
          zh: '楼前水面',
          en: 'Foreground water',
        },
        description: {
          zh: '前景水面留出了呼吸感，不会让楼体显得太紧。',
          en: 'The foreground water keeps breathing room around the architecture.',
        },
        x: 41,
        y: 70,
      }),
    ],
  },
];
