const panoramaAssetModules = typeof import.meta.glob === 'function'
  ? import.meta.glob('../../image/网师园/*.webp', {
    eager: true,
    import: 'default',
  })
  : {};

const panoramaFallbackAssetModules = typeof import.meta.glob === 'function'
  ? import.meta.glob('../../image/网师园/*.jpg', {
    eager: true,
    import: 'default',
  })
  : {};

const panoramaAsset = (fileName) => {
  const webpFileName = fileName.replace(/\.[^.]+$/, '.webp');
  return (
    panoramaAssetModules[`../../image/网师园/${webpFileName}`] ||
    new URL(/* @vite-ignore */ `../../image/网师园/${webpFileName}`, import.meta.url).href
  );
};

const panoramaFallbackAsset = (fileName) => (
  panoramaFallbackAssetModules[`../../image/网师园/${fileName}`] ||
  new URL(/* @vite-ignore */ `../../image/网师园/${fileName}`, import.meta.url).href
);

const text = (zh, en) => ({ zh, en });

const hotspot = (id, zhLabel, enLabel, zhTitle, enTitle, zhDescription, enDescription, x, y) => ({
  id,
  label: text(zhLabel, enLabel),
  title: text(zhTitle, enTitle),
  description: text(zhDescription, enDescription),
  x,
  y,
  yaw: Math.round(x * 3.6),
  pitch: Math.round((50 - y) * 1.5),
});

const scene = (id, order, fileName, titleZh, titleEn, descZh, descEn, accent, initialPan, hotspots, options = {}) => ({
  id,
  order,
  isPanorama: true,
  image: panoramaAsset(fileName),
  thumbnail: panoramaAsset(fileName),
  fallbackImage: panoramaFallbackAsset(fileName),
  fallbackThumbnail: panoramaFallbackAsset(fileName),
  title: text(titleZh, titleEn),
  description: text(descZh, descEn),
  accent,
  sourceName: text('项目本地全景素材', 'Local panorama asset set'),
  sourceLabel: text('当前画面使用 image 文件夹中的网师园实景全景图。', 'This scene uses the local panorama images stored in the project image folder.'),
  initialPan,
  initialTilt: options.initialTilt,
  initialFov: options.initialFov,
  initialMobilePan: options.initialMobilePan,
  initialMobileTilt: options.initialMobileTilt,
  initialMobileFov: options.initialMobileFov,
  initialHotspotId: options.initialHotspotId,
  hotspots,
});

export const wangshiyuanPanoramaCover = panoramaAsset('cover.jpg');
export const wangshiyuanPanoramaCoverFallback = panoramaFallbackAsset('cover.jpg');

export const wangshiyuanPanoramaSpotlights = [
  {
    id: 'wanjuan-tang',
    image: panoramaAsset('3_万卷堂.jpg'),
    fallbackImage: panoramaFallbackAsset('3_万卷堂.jpg'),
    title: text('万卷堂', 'Wanjuan Tang'),
    caption: text('先从厅堂秩序读起，更容易看懂网师园怎样在小尺度里铺开层次。', 'Start with the hall order to understand how depth unfolds in a compact site.'),
  },
  {
    id: 'dianchunyi-garden',
    image: panoramaAsset('8_殿春簃花园.jpg'),
    fallbackImage: panoramaFallbackAsset('8_殿春簃花园.jpg'),
    title: text('殿春簃花园', 'Dianchunyi Garden'),
    caption: text('假山、花墙和亭子放在一起，是“小中见大”最直接的一景。', 'Rockery, walls, and pavilion make one of the clearest compact compositions.'),
  },
  {
    id: 'waterside-pavilion',
    image: panoramaAsset('12_水阁.jpg'),
    fallbackImage: panoramaFallbackAsset('12_水阁.jpg'),
    title: text('水阁', 'Waterside Pavilion'),
    caption: text('窗棂、栏杆和池水一起工作，最适合慢慢看叠合层次。', 'Lattice, railings, and pond water overlap into a calm layered view.'),
  },
  {
    id: 'xiaoshan-conggui-xuan',
    image: panoramaAsset('14_小山丛桂轩.jpg'),
    fallbackImage: panoramaFallbackAsset('14_小山丛桂轩.jpg'),
    title: text('小山丛桂轩', 'Xiaoshan Conggui Xuan'),
    caption: text('路线走到这里会明显慢下来，边界和留白都更耐看。', 'By this stop the route slows down and the edges become more legible.'),
  },
];

export const wangshiyuanPanoramaScenesSource = [
  scene(
    'gate',
    '01',
    '1_网师园大门.jpg',
    '网师园大门',
    'Main Gate',
    '从入口开始，先感受网师园怎样把视线压缩，再慢慢把空间放出来。',
    'The gate compresses the first view before slowly releasing the garden beyond.',
    '#6d7f59',
    53,
    [
      hotspot('gate-axis', '入园方向', 'Arrival Axis', '先顺着门厅往里看', 'Look inward through the gate first', '入口不是一下打开，而是先收住尺度感。', 'The entrance gathers the scale before releasing the garden.', 51, 54),
      hotspot('gate-eaves', '门廊屋面', 'Eaves', '檐下先把节奏放慢', 'The canopy slows the rhythm', '檐下空间先把人按住，这是网师园气质的第一层提示。', 'The covered threshold slows the rhythm immediately.', 66, 34),
    ],
  ),
  scene(
    'sedan-hall',
    '02',
    '2_轿厅.jpg',
    '轿厅',
    'Sedan Hall',
    '由入口转入轿厅，观看从街巷感过渡到宅园秩序。',
    'The sedan hall shifts the experience from threshold to residential garden order.',
    '#8d6e4e',
    48,
    [
      hotspot('sedan-core', '厅堂中心', 'Hall Core', '先读厅堂骨架', 'Read the hall structure first', '厅堂承担着转场功能，先看清结构更容易理解后面的庭院。', 'Reading the hall structure sharpens the later courtyard transitions.', 52, 48),
      hotspot('sedan-side', '侧向过渡', 'Transition', '从这里转入更深处', 'The route slips deeper from here', '网师园的深入感常常来自边界转换，而不是看得更远。', 'Depth here comes from crossing another edge rather than seeing farther.', 68, 59),
    ],
  ),
  scene(
    'wanjuan-tang',
    '03',
    '3_万卷堂.jpg',
    '万卷堂',
    'Wanjuan Tang',
    '万卷堂更适合建立整体比例感，厅堂、庭院和窗景关系会在这里变得清楚。',
    'Wanjuan Tang sets out the garden’s overall proportion with hall, court, and framed views in balance.',
    '#735142',
    50,
    [
      hotspot('wanjuan-axis', '厅堂轴线', 'Hall Axis', '厅堂是稳定画面的中心', 'The hall stabilizes the composition', '先看主堂的位置，后面的细部都会围绕这个中心展开。', 'The hall becomes an anchor for the finer details that follow.', 55, 44),
      hotspot('wanjuan-window', '窗景借看', 'Window View', '近景和远景一起成立', 'Near and far views align together', '门窗不是装饰，它们把小尺度里的层次切得更清楚。', 'Doors and windows cut the compact site into clearer layers.', 35, 52),
    ],
  ),
  scene(
    'wufeng-study',
    '04',
    '4_五峰书屋.jpg',
    '五峰书屋',
    'Wufeng Study',
    '走到书屋，观看开始更贴近建筑细部，栏杆、陈设与窗洞都成了景的一部分。',
    'At the study the focus moves closer to railings, fittings, and framed architectural details.',
    '#8a5f42',
    57,
    [
      hotspot('wufeng-frame', '书屋界面', 'Interior Frame', '书屋的界面很细', 'The study is built from subtle edges', '网师园的丰富感常常就藏在这些靠得很近的边界上。', 'Much of the garden’s richness sits in these close, carefully tuned edges.', 60, 42),
      hotspot('wufeng-rail', '栏杆前景', 'Railing', '前景先把视线收住', 'The foreground railing gathers the eye', '先有前景，后有远景，是网师园很典型的观看方式。', 'Foreground first, then distance: a typical Master of Nets sequence.', 53, 67),
    ],
  ),
  scene(
    'jixu-zhai',
    '05',
    '5_集虚斋.jpg',
    '集虚斋',
    'Jixu Zhai',
    '在更安静的室内节点里，漏窗、匾额和檐口会把园林气质变得更具体。',
    'In this quieter interior node, lattice openings, plaques, and eaves make the mood more tangible.',
    '#5f6e58',
    45,
    [
      hotspot('jixu-window', '漏窗细部', 'Lattice', '细部最能说明气质', 'Details carry the atmosphere here', '靠近窗棂和构件去看，网师园的含蓄感会更明显。', 'The restrained mood becomes clearer when you read the woodwork closely.', 62, 46),
      hotspot('jixu-threshold', '内外门槛', 'Threshold', '内外之间没有断开', 'Inside and outside remain continuous', '虽然在室内，园景仍然通过门窗不断参与进来。', 'Even indoors, the garden remains present through framed openings.', 40, 60),
    ],
  ),
  scene(
    'kansongduhua-xuan',
    '06',
    '6_看松读画轩.jpg',
    '看松读画轩',
    'Kansong Duhua Xuan',
    '这一景更像停下来看的地方，室内框景和外部池岸会一起组织出很稳的层次。',
    'This stop invites stillness, with interior framing and pond-side views settling into calm layers.',
    '#83543f',
    56,
    [
      hotspot('kansong-window', '窗中池景', 'Pond View', '从窗里读水边关系', 'Read the waterside through the windows', '窗洞把池水和对岸建筑重新切成一幅更安静的画面。', 'The window reframes pond and opposite buildings into a quieter composition.', 49, 44),
      hotspot('kansong-railing', '栏杆节奏', 'Railing', '前景栏杆让空间更深', 'The railing deepens the foreground', '网师园的深度经常先从近处成立，再把人带到远处。', 'Depth often begins close at hand before extending outward.', 69, 68),
    ],
  ),
  scene(
    'poolside-path-one',
    '07',
    '7_池边小径1.jpg',
    '池边小径一',
    'Poolside Path I',
    '离开厅堂后，小径把路径压得更近，空间感也随之转向“贴着景走”。',
    'The narrow path compresses the route and turns the experience into a close reading of edges.',
    '#607857',
    47,
    [
      hotspot('path-one-route', '小径方向', 'Path', '小径让漫游慢下来', 'The path slows the movement', '这里不是大开大合，而是一步一步把景换出来。', 'This is not a broad reveal but a step-by-step reframing.', 54, 62),
      hotspot('path-one-water', '池边留白', 'Water Edge', '水边是最安静的停顿', 'The water edge forms the quiet pause', '小水面没有把空间拉得很大，却会把节奏安静地放慢。', 'The small pond edge quiets the rhythm more than it widens the space.', 41, 71),
    ],
  ),
  scene(
    'dianchunyi-garden',
    '08',
    '8_殿春簃花园.jpg',
    '殿春簃花园',
    'Dianchunyi Garden',
    '花园节点把墙、石、亭和树压缩在一起，是最能体现网师园“小中见大”的地方之一。',
    'This node compresses wall, rockery, pavilion, and trees into one vivid compact composition.',
    '#9f5744',
    50,
    [
      hotspot('dian-pavilion', '亭子停点', 'Pavilion', '亭子给出了停留的重心', 'The pavilion anchors the pause', '亭子不大，却很稳，是这一景最容易抓住的停留点。', 'The pavilion is modest in scale but strongly centers the scene.', 69, 42),
      hotspot('dian-rockery', '假山层次', 'Rockery', '假山把深度压进墙前', 'Rockery pushes depth forward', '在很有限的院子里，假山把画面层次做得一点也不浅。', 'Within a limited yard, the rockery creates unexpectedly deep layering.', 41, 48),
    ],
  ),
  scene(
    'luhua-hall-garden',
    '09',
    '9_露华馆花园.jpg',
    '露华馆花园',
    'Luhua Hall Garden',
    '这一段更适合看园中边角如何处理，墙边、树影和石组会让空间显得比实际更深。',
    'This stop shows how corners use walls, shadow, and rock groupings to deepen space.',
    '#6b6046',
    43,
    [
      hotspot('luhua-corner', '边角深度', 'Corner Depth', '深度常常藏在边角里', 'Depth often hides in the corners', '网师园很少直接把所有东西摆在正中间。', 'The garden rarely puts everything in the center.', 63, 52),
      hotspot('luhua-shade', '树影围合', 'Shade', '树影让画面更柔和', 'Tree shadow softens the composition', '光影会让较小的院落显得更有停留感。', 'Light and shadow turn the small court into a place of pause.', 31, 34),
    ],
  ),
  scene(
    'flower-garden',
    '10',
    '10_花园.jpg',
    '花园',
    'Flower Garden',
    '花园空间把步行节奏重新放松一点，让前面较紧的边界转成更舒缓的浏览。',
    'The flower garden loosens the route after tighter boundaries and offers a more open pause.',
    '#8c694d',
    58,
    [
      hotspot('flower-open', '庭面展开', 'Open Court', '这里开始稍微松开', 'The space loosens here', '网师园虽然总体紧凑，但也会在关键节点上给出一口气。', 'Even in a compact garden, certain nodes offer room to breathe.', 53, 62),
      hotspot('flower-wall', '花墙边界', 'Garden Wall', '边界让开敞不至于散掉', 'Walls keep openness from dissolving', '即使画面更开，墙和树仍然在控制观看的边界。', 'Even here, walls and trees still hold the composition together.', 70, 39),
    ],
  ),
  scene(
    'daohe-hall',
    '11',
    '11_蹈和馆.jpg',
    '蹈和馆',
    'Daohe Hall',
    '蹈和馆这一景会把注意力再次拉回建筑内部，细看窗棂和梁架会比远看更有意思。',
    'Daohe Hall draws attention back indoors, where lattice and timber become the main event.',
    '#7a5545',
    49,
    [
      hotspot('daohe-window', '窗棂取景', 'Lattice', '窗棂比远景更重要', 'The lattice matters as much as the outside view', '在网师园里，建筑细部本身就是景。', 'Architectural detail here is scenery in its own right.', 62, 42),
      hotspot('daohe-beam', '梁架抬头', 'Ceiling', '抬头看会更有包裹感', 'Looking upward reveals the enclosure', '屋架把视线罩住，室内的安静感也因此更强。', 'The roof structure wraps the view and strengthens the quiet.', 49, 23),
    ],
  ),
  scene(
    'waterside-pavilion',
    '12',
    '12_水阁.jpg',
    '水阁',
    'Waterside Pavilion',
    '水阁是很适合慢慢看的节点，池水、窗景和栏杆在这里形成最稳定的叠合关系。',
    'The waterside pavilion is ideal for slow reading, with pond, windows, and railing layered in equilibrium.',
    '#5f7b7e',
    52,
    [
      hotspot('waterside-window', '窗中看池', 'Window View', '从窗中看池最能说明网师园', 'The pond through the window captures the garden’s character', '不是一眼看尽，而是让水和对岸建筑被框进来，慢慢成立。', 'The view is framed and allowed to settle slowly.', 50, 42),
      hotspot('waterside-rail', '栏杆前场', 'Foreground', '前景把空间往里推', 'The foreground pushes depth inward', '近处栏杆先把人留住，再把视线送向对岸。', 'The railing holds the viewer before releasing the gaze outward.', 64, 70),
    ],
  ),
  scene(
    'poolside-path-two',
    '13',
    '13_池边小径2.jpg',
    '池边小径二',
    'Poolside Path II',
    '回到池边小径后，观看会再次收紧，适合感受“边走边换景”的连续节奏。',
    'Back along the pond path, the view tightens again and the walking rhythm becomes more continuous.',
    '#6b7f63',
    44,
    [
      hotspot('path-two-route', '继续游线', 'Route', '路线并不长，但节奏很多', 'The route is short but full of rhythm', '网师园真正动人的地方，就在这些小尺度里的连续转折。', 'The garden’s appeal lies in these continuous small-scale shifts.', 55, 61),
      hotspot('path-two-edge', '水边界面', 'Waterside Edge', '边缘关系比中心更耐看', 'The edges are more compelling than the center', '到了后段，最值得看的反而是不那么显眼的边缘关系。', 'Later in the route, the edge conditions become the most rewarding.', 39, 69),
    ],
  ),
  scene(
    'xiaoshan-conggui-xuan',
    '14',
    '14_小山丛桂轩.jpg',
    '小山丛桂轩',
    'Xiaoshan Conggui Xuan',
    '最后在小山丛桂轩把路线收束下来，院落、树影和边界都回到更安静的稳定里。',
    'The tour closes here, where courtyard, shadow, and boundary settle into stillness.',
    '#8c5c48',
    54,
    [
      hotspot('xiaoshan-core', '收束中心', 'Center', '最后把节奏稳下来', 'The route comes to rest here', '尾声不靠夸张的景，而是靠稳定的尺度安静收住。', 'The ending relies on stable proportion rather than spectacle.', 56, 46),
      hotspot('xiaoshan-foreground', '庭前留白', 'Foreground', '前场留白让结尾更耐看', 'Foreground openness makes the ending linger', '适当留白会让结尾不显拥挤，反而更能把安静留下来。', 'A measured foreground keeps the finale broad and lingering.', 44, 70),
    ],
  ),
];
