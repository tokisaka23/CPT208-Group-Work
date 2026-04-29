const panoramaAssetModules = typeof import.meta.glob === 'function'
  ? import.meta.glob('../../image/苏州园林留园/*.webp', {
    eager: true,
    import: 'default',
  })
  : {};

const panoramaFallbackAssetModules = typeof import.meta.glob === 'function'
  ? import.meta.glob('../../image/苏州园林留园/*.jpg', {
    eager: true,
    import: 'default',
  })
  : {};

const panoramaAsset = (fileName) => {
  const webpFileName = fileName.replace(/\.[^.]+$/, '.webp');
  return (
    panoramaAssetModules[`../../image/苏州园林留园/${webpFileName}`] ||
    new URL(/* @vite-ignore */ `../../image/苏州园林留园/${webpFileName}`, import.meta.url).href
  );
};

const panoramaFallbackAsset = (fileName) => (
  panoramaFallbackAssetModules[`../../image/苏州园林留园/${fileName}`] ||
  new URL(/* @vite-ignore */ `../../image/苏州园林留园/${fileName}`, import.meta.url).href
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
}) => ({
  id,
  order,
  isPanorama: true,
  image: image || panoramaAsset(fileName),
  thumbnail: image || panoramaAsset(fileName),
  fallbackImage: image || panoramaFallbackAsset(fileName),
  fallbackThumbnail: image || panoramaFallbackAsset(fileName),
  title,
  description,
  accent,
  sourceName: {
    zh: '项目本地全景素材',
    en: 'Local panorama asset set',
  },
  sourceLabel: {
    zh: '当前画面使用 image 文件夹中的留园实景全景图。',
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
});

export const liuyuanPanoramaCover = panoramaAsset('cover.jpg');
export const liuyuanPanoramaCoverFallback = panoramaFallbackAsset('cover.jpg');

export const liuyuanPanoramaSpotlights = [
  {
    id: 'corridor-sequence',
    image: panoramaAsset('3_03.jpg'),
    fallbackImage: panoramaFallbackAsset('3_03.jpg'),
    title: {
      zh: '曲廊回环',
      en: 'Corridor Sequence',
    },
    caption: {
      zh: '连续转折把留园的游线感一下拉出来，最适合先读节奏。',
      en: 'Layered turns make the route logic legible right away.',
    },
  },
  {
    id: 'water-court',
    image: panoramaAsset('4_04.jpg'),
    fallbackImage: panoramaFallbackAsset('4_04.jpg'),
    title: {
      zh: '水庭初见',
      en: 'Water Court',
    },
    caption: {
      zh: '从门洞与廊架之间看水庭，前后景关系最清楚。',
      en: 'The water court reads best through framed foreground and depth.',
    },
  },
  {
    id: 'guanyun-peak',
    image: panoramaAsset('6_06.jpg'),
    fallbackImage: panoramaFallbackAsset('6_06.jpg'),
    title: {
      zh: '冠云峰前',
      en: 'Guanyun Peak',
    },
    caption: {
      zh: '留园最强识别点之一，山石与建筑的对照最直接。',
      en: 'One of the most recognizable nodes in the whole garden.',
    },
  },
  {
    id: 'wufengxianguan',
    image: panoramaAsset('8_08.jpg'),
    fallbackImage: panoramaFallbackAsset('8_08.jpg'),
    title: {
      zh: '五峰仙馆',
      en: 'Wufeng Xianguan',
    },
    caption: {
      zh: '厅堂与院落互相借景，适合慢慢看空间怎样被重组。',
      en: 'A good stop for reading how hall and courtyard borrow from each other.',
    },
  },
];

export const liuyuanPanoramaScenesSource = [
  buildScene({
    id: 'entry',
    order: '01',
    fileName: '1_01.jpg',
    accent: '#8c5b33',
    initialPan: 50,
    initialMobilePan: 50,
    initialMobileTilt: -6,
    initialMobileFov: 98,
    initialHotspotId: 'entry-axis',
    title: {
      zh: '入口门厅',
      en: 'Entrance Hall',
    },
    description: {
      zh: '先从入口门厅建立游览起势，留园的节奏不是一下铺开，而是顺着门、廊、院慢慢推进。',
      en: 'The tour begins with a measured entry sequence built through gate, corridor, and court.',
    },
    hotspots: [
      buildHotspot({
        id: 'entry-axis',
        label: {
          zh: '起始游线',
          en: 'Route Start',
        },
        title: {
          zh: '起始游线',
          en: 'Starting route',
        },
        description: {
          zh: '先顺着正前方的引导看进去，更容易理解整条路线后续怎样展开。',
          en: 'Following the forward route first makes the later sequence easier to read.',
        },
        x: 50,
        y: 54,
      }),
      buildHotspot({
        id: 'entry-frame',
        label: {
          zh: '门厅框景',
          en: 'Framing',
        },
        title: {
          zh: '门厅框景',
          en: 'Entry framing',
        },
        description: {
          zh: '留园从入口就开始用门框和屋架收束视线，不急着把景全部交出来。',
          en: 'The garden starts framing and compressing the view right from the entrance.',
        },
        x: 62,
        y: 40,
      }),
    ],
  }),
  buildScene({
    id: 'foyer-court',
    order: '02',
    fileName: '2_02.jpg',
    accent: '#a8784b',
    initialPan: 56,
    title: {
      zh: '前院过渡',
      en: 'Front Court Transition',
    },
    description: {
      zh: '这一段像给路线蓄势，把室内门厅和平缓展开的院落连接起来。',
      en: 'This transitional court links the enclosed foyer to the garden beyond.',
    },
    hotspots: [
      buildHotspot({
        id: 'foyer-court-axis',
        label: {
          zh: '院落转入',
          en: 'Transition',
        },
        title: {
          zh: '院落转入',
          en: 'Court transition',
        },
        description: {
          zh: '空间开始从室内感转向半开敞，观看尺度也随之变松。',
          en: 'The scale loosens here as the space shifts toward semi-open court.',
        },
        x: 54,
        y: 58,
      }),
      buildHotspot({
        id: 'foyer-court-eaves',
        label: {
          zh: '檐下界面',
          en: 'Eaves',
        },
        title: {
          zh: '檐下界面',
          en: 'Eave threshold',
        },
        description: {
          zh: '檐下是留园常见的缓冲层，会让转场显得更顺。',
          en: 'The eaves create a soft threshold that smooths the transition.',
        },
        x: 30,
        y: 28,
      }),
    ],
  }),
  buildScene({
    id: 'corridor-sequence',
    order: '03',
    fileName: '3_03.jpg',
    accent: '#6f5039',
    initialPan: 45,
    title: {
      zh: '曲廊回环',
      en: 'Corridor Sequence',
    },
    description: {
      zh: '留园最典型的体验之一就是曲廊不断引导前进，这一景更适合读“移步换景”的叙事感。',
      en: 'This stop captures Lingering Garden at its most characteristic: scenes linked by corridor movement.',
    },
    hotspots: [
      buildHotspot({
        id: 'corridor-turn',
        label: {
          zh: '廊道转折',
          en: 'Turn',
        },
        title: {
          zh: '廊道转折',
          en: 'Corridor turn',
        },
        description: {
          zh: '每一次转折都不是单独的惊喜，而是把下一景慢慢推出来。',
          en: 'Each turn prepares the next scene rather than revealing it all at once.',
        },
        x: 61,
        y: 52,
      }),
      buildHotspot({
        id: 'corridor-depth',
        label: {
          zh: '连续景深',
          en: 'Depth',
        },
        title: {
          zh: '连续景深',
          en: 'Layered depth',
        },
        description: {
          zh: '顺着廊道看，前景、中景和远景会自然串成一条线。',
          en: 'The corridor naturally strings foreground, middle ground, and distance together.',
        },
        x: 42,
        y: 61,
      }),
    ],
  }),
  buildScene({
    id: 'water-court',
    order: '04',
    fileName: '4_04.jpg',
    accent: '#4e6a62',
    initialPan: 52,
    initialMobilePan: 54,
    initialMobileTilt: -8,
    initialMobileFov: 100,
    initialHotspotId: 'water-court-frame',
    title: {
      zh: '水庭初见',
      en: 'First Water Court',
    },
    description: {
      zh: '从曲折空间忽然看见水庭，留园的层次会从收束转为舒展。',
      en: 'After a compressed sequence, the water court opens the composition outward.',
    },
    hotspots: [
      buildHotspot({
        id: 'water-court-pond',
        label: {
          zh: '池面留白',
          en: 'Water',
        },
        title: {
          zh: '池面留白',
          en: 'Open water',
        },
        description: {
          zh: '水面负责把前面连续的建筑节奏稍微放慢，让空间呼吸一下。',
          en: 'The pond slows the architectural rhythm and creates breathing room.',
        },
        x: 48,
        y: 72,
      }),
      buildHotspot({
        id: 'water-court-frame',
        label: {
          zh: '廊架框景',
          en: 'Frame',
        },
        title: {
          zh: '廊架框景',
          en: 'Framed court view',
        },
        description: {
          zh: '留园的开敞不是完全打开，廊架仍在帮你组织观看顺序。',
          en: 'Even open scenes stay organized by corridor framing.',
        },
        x: 67,
        y: 46,
      }),
    ],
  }),
  buildScene({
    id: 'hall-passage',
    order: '05',
    fileName: '5_05.jpg',
    accent: '#b17b54',
    initialPan: 44,
    title: {
      zh: '厅堂穿行',
      en: 'Hall Passage',
    },
    description: {
      zh: '由院落重新进入厅堂，视线从看远景回到看门框、柱列和室内层次。',
      en: 'The route folds back into architecture and resets attention to structure and threshold.',
    },
    hotspots: [
      buildHotspot({
        id: 'hall-passage-columns',
        label: {
          zh: '柱列节奏',
          en: 'Columns',
        },
        title: {
          zh: '柱列节奏',
          en: 'Column rhythm',
        },
        description: {
          zh: '柱列的重复会把行进节奏变得很清楚，也让空间层层后退。',
          en: 'Repeated columns make the walking rhythm and retreating depth very clear.',
        },
        x: 58,
        y: 44,
      }),
      buildHotspot({
        id: 'hall-passage-threshold',
        label: {
          zh: '内外交界',
          en: 'Threshold',
        },
        title: {
          zh: '内外交界',
          en: 'Inside-outside threshold',
        },
        description: {
          zh: '这里最适合看留园怎样让室内外互相借景。',
          en: 'This is a strong example of interior and exterior borrowing from each other.',
        },
        x: 39,
        y: 65,
      }),
    ],
  }),
  buildScene({
    id: 'guanyun-peak',
    order: '06',
    fileName: '6_06.jpg',
    accent: '#8e6542',
    initialPan: 53,
    initialMobilePan: 53,
    initialMobileTilt: -4,
    initialMobileFov: 96,
    initialHotspotId: 'guanyun-peak-main',
    title: {
      zh: '冠云峰前',
      en: 'Before Guanyun Peak',
    },
    description: {
      zh: '山石与厅堂对照最直接的节点之一，留园的“石”在这里真正站到舞台中央。',
      en: 'One of the clearest moments where rockery and architecture are set into direct dialogue.',
    },
    hotspots: [
      buildHotspot({
        id: 'guanyun-peak-main',
        label: {
          zh: '主峰对景',
          en: 'Peak',
        },
        title: {
          zh: '主峰对景',
          en: 'Main peak view',
        },
        description: {
          zh: '冠云峰不只是装饰，它会重新定义周边建筑的观看中心。',
          en: 'Guanyun Peak recenters the whole surrounding composition.',
        },
        x: 52,
        y: 40,
      }),
      buildHotspot({
        id: 'guanyun-peak-base',
        label: {
          zh: '山石基座',
          en: 'Rock Base',
        },
        title: {
          zh: '山石基座',
          en: 'Rock base',
        },
        description: {
          zh: '从下部看山石和地面关系，会更容易理解它为什么显得稳定。',
          en: 'Reading the rock against its base explains why the form feels so grounded.',
        },
        x: 49,
        y: 68,
      }),
    ],
  }),
  buildScene({
    id: 'guanyun-tower',
    order: '07',
    fileName: '7_07.jpg',
    accent: '#785741',
    initialPan: 59,
    title: {
      zh: '冠云楼下',
      en: 'Below Guanyun Tower',
    },
    description: {
      zh: '这一景适合把视线稍微抬高，看楼、峰、廊如何组成更立体的前后层次。',
      en: 'Here the scene becomes more vertical, with tower, rock, and corridor working in layers.',
    },
    hotspots: [
      buildHotspot({
        id: 'guanyun-tower-elevation',
        label: {
          zh: '楼体抬升',
          en: 'Tower',
        },
        title: {
          zh: '楼体抬升',
          en: 'Tower elevation',
        },
        description: {
          zh: '楼体让原本平行的游线突然有了向上的重心。',
          en: 'The tower introduces an upward center of gravity into the route.',
        },
        x: 62,
        y: 33,
      }),
      buildHotspot({
        id: 'guanyun-tower-link',
        label: {
          zh: '楼峰相连',
          en: 'Linkage',
        },
        title: {
          zh: '楼峰相连',
          en: 'Tower-rock linkage',
        },
        description: {
          zh: '建筑和山石不是分开的主角，它们在这里互相衬托。',
          en: 'Architecture and rockery support each other as one composition.',
        },
        x: 46,
        y: 50,
      }),
    ],
  }),
  buildScene({
    id: 'wufengxianguan',
    order: '08',
    fileName: '8_08.jpg',
    accent: '#9f6d3f',
    initialPan: 47,
    initialMobilePan: 49,
    initialMobileTilt: -5,
    initialMobileFov: 96,
    initialHotspotId: 'wufeng-hall',
    title: {
      zh: '五峰仙馆',
      en: 'Wufeng Xianguan',
    },
    description: {
      zh: '厅堂、庭院和山石在这里叠得很完整，是留园最适合停下来看构图的一景。',
      en: 'This is a composed node where hall, courtyard, and rockery align with unusual clarity.',
    },
    hotspots: [
      buildHotspot({
        id: 'wufeng-hall',
        label: {
          zh: '厅堂主面',
          en: 'Hall',
        },
        title: {
          zh: '厅堂主面',
          en: 'Hall front',
        },
        description: {
          zh: '厅堂正面稳住了场景秩序，是这一段的视觉锚点。',
          en: 'The hall front stabilizes the whole scene as its visual anchor.',
        },
        x: 54,
        y: 43,
      }),
      buildHotspot({
        id: 'wufeng-court',
        label: {
          zh: '院落回看',
          en: 'Court',
        },
        title: {
          zh: '院落回看',
          en: 'Courtyard glance back',
        },
        description: {
          zh: '从这里回看，院落边界和景深关系会比正对时更明显。',
          en: 'Looking back from here reveals the courtyard depth more clearly.',
        },
        x: 37,
        y: 66,
      }),
    ],
  }),
  buildScene({
    id: 'deep-court',
    order: '09',
    fileName: '9_09.jpg',
    accent: '#5c6a44',
    initialPan: 42,
    title: {
      zh: '林泉深转',
      en: 'Deep Garden Turn',
    },
    description: {
      zh: '越往深处走，留园越强调边界的收束，观看也会从大构图转向更细的局部。',
      en: 'Deeper in the route, the garden tightens its edges and shifts toward finer detail.',
    },
    hotspots: [
      buildHotspot({
        id: 'deep-court-canopy',
        label: {
          zh: '林木围合',
          en: 'Canopy',
        },
        title: {
          zh: '林木围合',
          en: 'Canopy enclosure',
        },
        description: {
          zh: '植物会把庭院的上部收紧，让停留感更强。',
          en: 'Planting tightens the upper edge and makes the stop feel more enclosed.',
        },
        x: 30,
        y: 25,
      }),
      buildHotspot({
        id: 'deep-court-path',
        label: {
          zh: '路径收束',
          en: 'Path',
        },
        title: {
          zh: '路径收束',
          en: 'Narrowed path',
        },
        description: {
          zh: '这一段最能感受到游线如何慢下来，不再追求一下看到全部。',
          en: 'The route slows here and stops trying to reveal the whole at once.',
        },
        x: 54,
        y: 64,
      }),
    ],
  }),
  buildScene({
    id: 'linked-courtyard',
    order: '10',
    fileName: '10_10.jpg',
    accent: '#ba8654',
    initialPan: 58,
    title: {
      zh: '曲院连景',
      en: 'Linked Courtyard',
    },
    description: {
      zh: '这是一种很典型的留园手法，用几个连续界面把同一处景反复重组。',
      en: 'A classic Lingering Garden move: one scene is reorganized again and again through layered thresholds.',
    },
    hotspots: [
      buildHotspot({
        id: 'linked-courtyard-door',
        label: {
          zh: '门洞透景',
          en: 'Gateway',
        },
        title: {
          zh: '门洞透景',
          en: 'Gateway view-through',
        },
        description: {
          zh: '门洞让同一景被切成新的画面，形成反复观看的理由。',
          en: 'The gateway cuts the same view into a new composition.',
        },
        x: 61,
        y: 46,
      }),
      buildHotspot({
        id: 'linked-courtyard-middle',
        label: {
          zh: '中景停驻',
          en: 'Midground',
        },
        title: {
          zh: '中景停驻',
          en: 'Midground pause',
        },
        description: {
          zh: '留园的层次常常不是靠远景，而是靠中景慢慢成立。',
          en: 'Many of the garden’s layers happen in the midground rather than the far distance.',
        },
        x: 46,
        y: 62,
      }),
    ],
  }),
  buildScene({
    id: 'rock-borrowed-view',
    order: '11',
    fileName: '11_11.jpg',
    accent: '#6d5c48',
    initialPan: 48,
    title: {
      zh: '山石借景',
      en: 'Borrowed Rock View',
    },
    description: {
      zh: '从侧向观看山石，建筑和植物会一起把石景抬起来，层次比正面更丰富。',
      en: 'Viewed from the side, rockery gains depth through its relation to walls and planting.',
    },
    hotspots: [
      buildHotspot({
        id: 'rock-borrowed-main',
        label: {
          zh: '石景主体',
          en: 'Rockery',
        },
        title: {
          zh: '石景主体',
          en: 'Main rockery',
        },
        description: {
          zh: '石景最有力量的时候，往往不是正面，而是与周边界面一起被读的时候。',
          en: 'Rockery feels strongest when read together with its surrounding edges.',
        },
        x: 53,
        y: 42,
      }),
      buildHotspot({
        id: 'rock-borrowed-side',
        label: {
          zh: '侧向借景',
          en: 'Borrowed View',
        },
        title: {
          zh: '侧向借景',
          en: 'Side borrowed view',
        },
        description: {
          zh: '侧向关系会把山石和背景牵在一起，画面更不容易散。',
          en: 'The side view binds rockery and background into a tighter composition.',
        },
        x: 36,
        y: 56,
      }),
    ],
  }),
  buildScene({
    id: 'quiet-side-yard',
    order: '12',
    fileName: '12_12.jpg',
    accent: '#7f6a55',
    initialPan: 40,
    title: {
      zh: '边院静观',
      en: 'Quiet Side Yard',
    },
    description: {
      zh: '主景之外的边院往往更安静，也更适合体会留园收放有度的空间气质。',
      en: 'The side yard reveals the calmer, more measured side of the garden.',
    },
    hotspots: [
      buildHotspot({
        id: 'quiet-side-yard-boundary',
        label: {
          zh: '边界层次',
          en: 'Boundary',
        },
        title: {
          zh: '边界层次',
          en: 'Boundary layering',
        },
        description: {
          zh: '看边院时更容易发现墙、檐、树影怎样一起做空间边界。',
          en: 'Walls, eaves, and shadows cooperate here to define the edge of space.',
        },
        x: 59,
        y: 39,
      }),
      buildHotspot({
        id: 'quiet-side-yard-rest',
        label: {
          zh: '停留点',
          en: 'Pause',
        },
        title: {
          zh: '停留点',
          en: 'Pause point',
        },
        description: {
          zh: '这一景适合停下来，而不是继续赶路。',
          en: 'This node works best as a place to stop rather than pass through quickly.',
        },
        x: 47,
        y: 67,
      }),
    ],
  }),
  buildScene({
    id: 'closing-court',
    order: '13',
    fileName: '13_13.jpg',
    accent: '#9b7349',
    initialPan: 55,
    initialMobilePan: 54,
    initialMobileTilt: -6,
    initialMobileFov: 98,
    initialHotspotId: 'closing-court-center',
    title: {
      zh: '庭心收束',
      en: 'Closing Court',
    },
    description: {
      zh: '用相对平稳的庭心收束整条游线，让前面的连续转折在这里重新安定下来。',
      en: 'The route closes on a steadier court that settles the earlier sequence of turns.',
    },
    hotspots: [
      buildHotspot({
        id: 'closing-court-center',
        label: {
          zh: '庭心中心',
          en: 'Center',
        },
        title: {
          zh: '庭心中心',
          en: 'Court center',
        },
        description: {
          zh: '收束节点最重要的是重新给出中心，让路线完整地停下来。',
          en: 'A closing node recenters the route and lets the sequence come to rest.',
        },
        x: 56,
        y: 47,
      }),
      buildHotspot({
        id: 'closing-court-foreground',
        label: {
          zh: '前场留白',
          en: 'Foreground',
        },
        title: {
          zh: '前场留白',
          en: 'Foreground opening',
        },
        description: {
          zh: '前景留白会让结尾不显得拥挤，反而更耐看。',
          en: 'Foreground openness keeps the ending broad rather than crowded.',
        },
        x: 42,
        y: 71,
      }),
    ],
  }),
];
