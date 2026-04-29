const panoramaAssetModules = typeof import.meta.glob === 'function'
  ? import.meta.glob('../../image/拙政园1774850195997/*.webp', {
    eager: true,
    import: 'default',
  })
  : {};

const panoramaFallbackAssetModules = typeof import.meta.glob === 'function'
  ? import.meta.glob('../../image/拙政园1774850195997/*.jpg', {
    eager: true,
    import: 'default',
  })
  : {};

const panoramaAsset = (fileName) => {
  const webpFileName = fileName.replace(/\.[^.]+$/, '.webp');
  return (
    panoramaAssetModules[`../../image/拙政园1774850195997/${webpFileName}`] ||
    new URL(/* @vite-ignore */ `../../image/拙政园1774850195997/${webpFileName}`, import.meta.url).href
  );
};

const panoramaFallbackAsset = (fileName) => (
  panoramaFallbackAssetModules[`../../image/拙政园1774850195997/${fileName}`] ||
  new URL(/* @vite-ignore */ `../../image/拙政园1774850195997/${fileName}`, import.meta.url).href
);

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

const buildScene = ({
  id,
  order,
  fileName,
  image,
  title,
  description,
  accent,
  initialPan,
  initialTilt,
  initialFov,
  initialMobilePan,
  initialMobileTilt,
  initialMobileFov,
  initialHotspotId,
  hotspots,
}) => {
  const primaryImage = image || panoramaAsset(fileName);
  const fallbackImage = image || panoramaFallbackAsset(fileName);

  return {
    id,
    order,
    isPanorama: true,
    image: primaryImage,
    thumbnail: primaryImage,
    fallbackImage,
    fallbackThumbnail: fallbackImage,
    title,
    description,
    accent,
    sourceName: {
      zh: '项目本地全景素材',
      en: 'Local panorama asset set',
    },
    sourceLabel: {
      zh: '当前画面使用 image 文件夹中的拙政园实景全景图。',
      en: 'This scene uses the local panorama images stored in the project image folder.',
    },
    initialPan,
    initialTilt,
    initialFov,
    initialMobilePan,
    initialMobileTilt,
    initialMobileFov,
    initialHotspotId,
    hotspots,
  };
};

export const zhuozhengPanoramaCover = panoramaAsset('cover.jpg');
export const zhuozhengPanoramaCoverFallback = panoramaFallbackAsset('cover.jpg');

export const zhuozhengPanoramaSpotlights = [
  {
    id: 'west-water',
    image: panoramaAsset('7_07.jpg'),
    fallbackImage: panoramaFallbackAsset('7_07.jpg'),
    title: {
      zh: '西园水阁',
      en: 'West Garden Waterside',
    },
    caption: {
      zh: '更适合慢下来观察建筑边界、水面层次和植物围合关系。',
      en: 'A calmer node for reading architecture, water layers, and planting enclosure.',
    },
  },
  {
    id: 'east-water',
    image: panoramaAsset('2_02.jpg'),
    fallbackImage: panoramaFallbackAsset('2_02.jpg'),
    title: {
      zh: '东园水岸',
      en: 'East Water Edge',
    },
    caption: {
      zh: '更适合看临水空间的开阔感，以及亭、水、岸线的关系。',
      en: 'A wider waterside node focused on pond, pavilion, and shoreline.',
    },
  },
  {
    id: 'xiaofeihong',
    image: panoramaAsset('8_08_小飞虹.jpg'),
    fallbackImage: panoramaFallbackAsset('8_08_小飞虹.jpg'),
    title: {
      zh: '小飞虹',
      en: 'Xiao Feihong',
    },
    caption: {
      zh: '桥、廊和倒影会同时成立，是识别度最高的节点之一。',
      en: 'A highly recognizable scene where bridge, corridor, and reflection align.',
    },
  },
  {
    id: 'yuanxiangtang',
    image: panoramaAsset('10_10_远香堂.jpg'),
    fallbackImage: panoramaFallbackAsset('10_10_远香堂.jpg'),
    title: {
      zh: '远香堂',
      en: 'Yuanxiang Tang',
    },
    caption: {
      zh: '适合作为路线收束节点，建筑与水面的关系最稳。',
      en: 'A strong closing node where architecture and water settle the route.',
    },
  },
];

export const zhuozhengPanoramaScenesSource = [
  buildScene({
    id: 'entry',
    order: '01',
    fileName: '1_01_入口.jpg',
    accent: '#c96d4a',
    initialPan: 50,
    initialMobilePan: 53,
    initialMobileTilt: -6,
    initialMobileFov: 98,
    initialHotspotId: 'entry-axis',
    title: {
      zh: '入口',
      en: 'Entrance',
    },
    description: {
      zh: '从入口节点切入，先建立园路、水面和视线展开的第一层节奏。',
      en: 'Enter through the front gate and establish the first rhythm between path, water, and sightline.',
    },
    hotspots: [
      buildHotspot({
        id: 'entry-axis',
        label: {
          zh: '主游线',
          en: 'Main Axis',
        },
        title: {
          zh: '主游线方向',
          en: 'Main route direction',
        },
        description: {
          zh: '先沿主游线观察，可以更容易理解整个漫游的推进顺序。',
          en: 'Follow the main axis first to understand the order of the tour.',
        },
        x: 51,
        y: 53,
      }),
      buildHotspot({
        id: 'entry-foreground',
        label: {
          zh: '入口前场',
          en: 'Foreground',
        },
        title: {
          zh: '入口前场',
          en: 'Entrance forecourt',
        },
        description: {
          zh: '前场负责把人慢慢带入园林，而不是立刻给出全部景色。',
          en: 'The forecourt eases visitors into the garden instead of revealing everything at once.',
        },
        x: 34,
        y: 68,
      }),
    ],
  }),
  buildScene({
    id: 'east-water',
    order: '02',
    fileName: '2_02.jpg',
    accent: '#8aa96d',
    initialPan: 58,
    initialMobilePan: 57,
    initialMobileTilt: -8,
    initialMobileFov: 102,
    initialHotspotId: 'east-pavilion-line',
    title: {
      zh: '东园水岸',
      en: 'East Water Edge',
    },
    description: {
      zh: '这一段适合拉开观看尺度，把临水空间的开阔感先读出来。',
      en: 'This stop opens up the scale of the garden and foregrounds the waterside atmosphere.',
    },
    hotspots: [
      buildHotspot({
        id: 'east-water-surface',
        label: {
          zh: '水面',
          en: 'Water',
        },
        title: {
          zh: '水面展开',
          en: 'Water surface opening',
        },
        description: {
          zh: '水面的留白会把视线向外推，让空间先“松”下来。',
          en: 'The open water pushes the eye outward and relaxes the scene.',
        },
        x: 48,
        y: 72,
      }),
      buildHotspot({
        id: 'east-pavilion-line',
        label: {
          zh: '岸线亭榭',
          en: 'Pavilion Line',
        },
        title: {
          zh: '岸线与亭榭',
          en: 'Shoreline and pavilion',
        },
        description: {
          zh: '岸线不是背景，它和亭榭一起定义了停留的位置。',
          en: 'The shoreline and pavilion together define where the eye pauses.',
        },
        x: 69,
        y: 45,
      }),
    ],
  }),
  buildScene({
    id: 'corridor-water',
    order: '03',
    fileName: '3_03.jpg',
    accent: '#6e8ea9',
    initialPan: 42,
    initialMobilePan: 45,
    initialMobileTilt: -7,
    initialMobileFov: 98,
    initialHotspotId: 'corridor-turn',
    title: {
      zh: '曲廊临池',
      en: 'Corridor by the Pond',
    },
    description: {
      zh: '曲廊把视线引成连续的转折，这一景更强调移动中的节奏。',
      en: 'The corridor creates a flowing sequence of turns and emphasizes movement.',
    },
    hotspots: [
      buildHotspot({
        id: 'corridor-turn',
        label: {
          zh: '曲廊转折',
          en: 'Corridor',
        },
        title: {
          zh: '廊道转折',
          en: 'Corridor turn',
        },
        description: {
          zh: '曲线和折线交替出现，漫游的“走”感就在这里形成。',
          en: 'The alternation of curves and turns creates the feeling of walking through the garden.',
        },
        x: 62,
        y: 52,
      }),
      buildHotspot({
        id: 'corridor-water-view',
        label: {
          zh: '临池借景',
          en: 'View',
        },
        title: {
          zh: '临池借景',
          en: 'Borrowed pond view',
        },
        description: {
          zh: '从廊中看水面，景深会比正对观看时更明显。',
          en: 'Viewing the pond from within the corridor deepens the spatial layering.',
        },
        x: 38,
        y: 66,
      }),
    ],
  }),
  buildScene({
    id: 'courtyard-turn',
    order: '04',
    fileName: '4_04.jpg',
    accent: '#c5a45f',
    initialPan: 36,
    title: {
      zh: '庭院转折',
      en: 'Courtyard Transition',
    },
    description: {
      zh: '由开敞转入收束空间，节奏会从“看远”转向“看近”。',
      en: 'This transition shifts the rhythm from long views toward closer details.',
    },
    hotspots: [
      buildHotspot({
        id: 'courtyard-frame',
        label: {
          zh: '门洞框景',
          en: 'Frame',
        },
        title: {
          zh: '门洞取景',
          en: 'Framed opening',
        },
        description: {
          zh: '框景会把视线重新收紧，让下一景更有进入感。',
          en: 'Framed openings compress the view and strengthen the next arrival.',
        },
        x: 55,
        y: 48,
      }),
      buildHotspot({
        id: 'courtyard-detail',
        label: {
          zh: '院落细部',
          en: 'Detail',
        },
        title: {
          zh: '院落细部',
          en: 'Courtyard detail',
        },
        description: {
          zh: '这里更适合停留片刻，读柱廊、地面和墙体之间的关系。',
          en: 'Pause here to read the relation between colonnade, paving, and walls.',
        },
        x: 73,
        y: 70,
      }),
    ],
  }),
  buildScene({
    id: 'tingyuxuan-outside',
    order: '05',
    fileName: '5_05_听雨轩外.jpg',
    accent: '#8f6fc9',
    initialPan: 60,
    title: {
      zh: '听雨轩外',
      en: 'Tingyuxuan Exterior',
    },
    description: {
      zh: '听雨轩外部更适合看建筑与树影、水岸之间的整体关系。',
      en: 'The exterior of Tingyuxuan highlights the relation between building, trees, and water edge.',
    },
    hotspots: [
      buildHotspot({
        id: 'tingyuxuan-exterior',
        label: {
          zh: '轩外立面',
          en: 'Exterior',
        },
        title: {
          zh: '轩外立面',
          en: 'Exterior facade',
        },
        description: {
          zh: '先在外部看清建筑体量，进入内部时空间对比会更明显。',
          en: 'Read the exterior massing first to sharpen the contrast once you step inside.',
        },
        x: 63,
        y: 46,
      }),
      buildHotspot({
        id: 'tingyuxuan-shadow',
        label: {
          zh: '树影水岸',
          en: 'Shadow',
        },
        title: {
          zh: '树影与水岸',
          en: 'Tree shadow and shoreline',
        },
        description: {
          zh: '树影把空间切成更细的层次，让外景不会显得太平。',
          en: 'Tree shadows break the scene into finer layers and keep the exterior from feeling flat.',
        },
        x: 44,
        y: 68,
      }),
    ],
  }),
  buildScene({
    id: 'tingyuxuan-inside',
    order: '06',
    fileName: '6_06_听雨轩内.jpg',
    accent: '#c45a72',
    initialPan: 48,
    title: {
      zh: '听雨轩内',
      en: 'Inside Tingyuxuan',
    },
    description: {
      zh: '进入室内后，窗景与屋架让全景体验从开阔转为包裹。',
      en: 'Inside the pavilion, framed windows and roof structure turn the panorama from open to enclosed.',
    },
    hotspots: [
      buildHotspot({
        id: 'tingyuxuan-window',
        label: {
          zh: '窗内看园',
          en: 'Window View',
        },
        title: {
          zh: '窗内看园',
          en: 'Garden through the window',
        },
        description: {
          zh: '窗框会把外景重新组织成一幅幅局部画面。',
          en: 'The windows reorganize the outside view into framed compositions.',
        },
        x: 51,
        y: 44,
      }),
      buildHotspot({
        id: 'tingyuxuan-structure',
        label: {
          zh: '内部梁架',
          en: 'Structure',
        },
        title: {
          zh: '内部梁架',
          en: 'Interior structure',
        },
        description: {
          zh: '抬头看梁架，能更明显感受到室内空间的包裹感。',
          en: 'Looking upward makes the enclosure of the interior more tangible.',
        },
        x: 28,
        y: 24,
      }),
    ],
  }),
  buildScene({
    id: 'west-water',
    order: '07',
    fileName: '7_07.jpg',
    accent: '#5d9388',
    initialPan: 55,
    title: {
      zh: '西园水阁',
      en: 'West Garden Waterside',
    },
    description: {
      zh: '西园节奏更安静，适合慢下来观察建筑边界与植物层次。',
      en: 'The west garden is calmer and better suited for slower observation of architecture and planting.',
    },
    hotspots: [
      buildHotspot({
        id: 'west-water-view',
        label: {
          zh: '水阁回望',
          en: 'Waterside',
        },
        title: {
          zh: '水阁回望',
          en: 'Waterside glance back',
        },
        description: {
          zh: '回望时，建筑和水面会形成更稳的前后层次。',
          en: 'Looking back stabilizes the layered relation between building and water.',
        },
        x: 58,
        y: 51,
      }),
      buildHotspot({
        id: 'west-plants',
        label: {
          zh: '植物围合',
          en: 'Planting',
        },
        title: {
          zh: '植物围合',
          en: 'Planting enclosure',
        },
        description: {
          zh: '植物不是装饰，而是把安静气氛围出来的空间边界。',
          en: 'The planting acts as a spatial boundary, not just decoration.',
        },
        x: 34,
        y: 60,
      }),
    ],
  }),
  buildScene({
    id: 'xiaofeihong',
    order: '08',
    fileName: '8_08_小飞虹.jpg',
    accent: '#d46a52',
    initialPan: 50,
    initialMobilePan: 50,
    initialMobileTilt: -4,
    initialMobileFov: 98,
    initialHotspotId: 'xiaofeihong-axis',
    title: {
      zh: '小飞虹',
      en: 'Xiao Feihong',
    },
    description: {
      zh: '这是整组全景里识别度最高的节点之一，桥、廊和倒影会同时成立。',
      en: 'This is one of the most recognizable stops, where bridge, corridor, and reflection align at once.',
    },
    hotspots: [
      buildHotspot({
        id: 'xiaofeihong-axis',
        label: {
          zh: '桥体中轴',
          en: 'Bridge',
        },
        title: {
          zh: '桥体中轴',
          en: 'Bridge axis',
        },
        description: {
          zh: '桥体是这一景的视觉锚点，几乎一眼就能抓住中心。',
          en: 'The bridge acts as the visual anchor and establishes the center immediately.',
        },
        x: 50,
        y: 47,
      }),
      buildHotspot({
        id: 'xiaofeihong-reflection',
        label: {
          zh: '桥与倒影',
          en: 'Reflection',
        },
        title: {
          zh: '桥与倒影',
          en: 'Bridge and reflection',
        },
        description: {
          zh: '真正完整的画面来自上方桥体和下方水面的一起阅读。',
          en: 'The full image appears when the bridge and its reflection are read together.',
        },
        x: 49,
        y: 72,
      }),
    ],
  }),
  buildScene({
    id: 'tree-path',
    order: '09',
    fileName: '9_09.jpg',
    accent: '#798f47',
    initialPan: 40,
    title: {
      zh: '林间回望',
      en: 'Tree-lined Return',
    },
    description: {
      zh: '林木把路径压得更窄，漫游的节奏也因此慢下来。',
      en: 'The trees compress the route and slow the rhythm of the tour.',
    },
    hotspots: [
      buildHotspot({
        id: 'tree-path-route',
        label: {
          zh: '游线收束',
          en: 'Path',
        },
        title: {
          zh: '游线收束',
          en: 'Compressed route',
        },
        description: {
          zh: '这一段最适合感受“移步换景”，因为每一步都会重新构图。',
          en: 'This is where the shifting-view effect becomes strongest, with each step reframing the scene.',
        },
        x: 52,
        y: 63,
      }),
      buildHotspot({
        id: 'tree-path-canopy',
        label: {
          zh: '树冠围合',
          en: 'Canopy',
        },
        title: {
          zh: '树冠围合',
          en: 'Canopy enclosure',
        },
        description: {
          zh: '头顶树冠把空间压低，形成更亲近的停留感。',
          en: 'The tree canopy lowers the perceived ceiling and makes the stop more intimate.',
        },
        x: 31,
        y: 28,
      }),
    ],
  }),
  buildScene({
    id: 'yuanxiangtang',
    order: '10',
    fileName: '10_10_远香堂.jpg',
    accent: '#b57a43',
    initialPan: 54,
    initialMobilePan: 55,
    initialMobileTilt: -5,
    initialMobileFov: 98,
    initialHotspotId: 'yuanxiang-hall',
    title: {
      zh: '远香堂',
      en: 'Yuanxiang Tang',
    },
    description: {
      zh: '用远香堂收束整条线路，建筑和水面会把整个游览重新稳定下来。',
      en: 'The route closes at Yuanxiang Tang, where hall and water bring the whole tour back into balance.',
    },
    hotspots: [
      buildHotspot({
        id: 'yuanxiang-hall',
        label: {
          zh: '远香堂主体',
          en: 'Hall',
        },
        title: {
          zh: '远香堂主体',
          en: 'Main hall',
        },
        description: {
          zh: '主堂体量让空间重新获得中心，是收束全程的最好位置。',
          en: 'The main hall recenters the space and works well as the closing node.',
        },
        x: 57,
        y: 44,
      }),
      buildHotspot({
        id: 'yuanxiang-forewater',
        label: {
          zh: '堂前水面',
          en: 'Forewater',
        },
        title: {
          zh: '堂前水面',
          en: 'Forewater',
        },
        description: {
          zh: '前景水面留出呼吸感，让结束节点依然保持开阔。',
          en: 'The foreground water keeps the ending broad and breathable.',
        },
        x: 43,
        y: 70,
      }),
    ],
  }),
];
