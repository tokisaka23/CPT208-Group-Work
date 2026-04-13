import { resolveGardenGalleryImage } from './gardenImages';

const zhuozhengSlug = 'zhuozhengyuan';

export const gardenScenePreviews = {
  zhuozhengyuan: {
    eyebrow: {
      zh: '实景预览',
      en: 'Scene Preview',
    },
    title: {
      zh: '拙政园水院实景预览',
      en: 'Waterside Scene Preview of Humble Administrator\'s Garden',
    },
    intro: {
      zh: '先按数字园区的搭建方式，把前院、游廊、月洞门、水院、临水亭和假山组织成一段连续可看的空间预览，先看整体骨架，再进细部镜头。',
      en: 'This preview builds the forecourt, corridor, moon gate, pond, pavilion, and rockery into one continuous sequence so you can read the overall structure before moving into detail shots.',
    },
    stats: [
      {
        label: { zh: '预览节点', en: 'Preview Nodes' },
        value: '06',
      },
      {
        label: { zh: '镜头组', en: 'Camera Cuts' },
        value: '05',
      },
      {
        label: { zh: '空间主线', en: 'Spatial Spine' },
        value: { zh: '前院-水院-亭廊', en: 'Court - Pond - Pavilion' },
      },
    ],
    shots: [
      {
        id: 'forecourt',
        itemId: 'courtyard',
        label: { zh: '前院入景', en: 'Entry Court' },
        title: { zh: '先把前院尺度压住', en: 'Open with a compressed forecourt' },
        summary: {
          zh: '先用白墙、石阶和厅前空地把镜头收紧，再把真正的水院留给后面的展开。',
          en: 'Start by tightening the frame with walls, steps, and forecourt ground before releasing the main water scene later.',
        },
        tags: [
          { zh: '白墙前院', en: 'White-wall court' },
          { zh: '厅前石阶', en: 'Stone steps' },
          { zh: '收束开场', en: 'Compressed opening' },
        ],
        image: resolveGardenGalleryImage(zhuozhengSlug, 1, ''),
      },
      {
        id: 'corridor',
        itemId: 'corridor',
        label: { zh: '游廊过渡', en: 'Corridor Sequence' },
        title: { zh: '用游廊把空间串起来', en: 'Let the corridor stitch the sequence' },
        summary: {
          zh: '廊道不是连接件，而是节奏控制器。它决定了视线怎样一段段被放出来。',
          en: 'The corridor is not just a connector. It edits the pace and releases the view in measured fragments.',
        },
        tags: [
          { zh: '游廊节奏', en: 'Corridor rhythm' },
          { zh: '框景过渡', en: 'Framed transition' },
          { zh: '连续动线', en: 'Continuous route' },
        ],
        image: resolveGardenGalleryImage(zhuozhengSlug, 2, ''),
      },
      {
        id: 'moon-gate',
        itemId: 'moonGate',
        label: { zh: '月洞门', en: 'Moon Gate' },
        title: { zh: '用圆门做第一层框景', en: 'Use the moon gate as the first frame' },
        summary: {
          zh: '月洞门负责把前后景重新编排，镜头经过这里，空间层次会一下子清楚起来。',
          en: 'The moon gate rearranges front and back layers so the sequence sharpens as the camera crosses it.',
        },
        tags: [
          { zh: '圆门框景', en: 'Circular framing' },
          { zh: '窗洞重组', en: 'Layered openings' },
          { zh: '转折节点', en: 'Turning point' },
        ],
        image: resolveGardenGalleryImage(zhuozhengSlug, 1, ''),
      },
      {
        id: 'pond',
        itemId: 'pond',
        label: { zh: '水院展开', en: 'Water Court' },
        title: { zh: '让水面把整体空间拉开', en: 'Let the pond open the whole scene' },
        summary: {
          zh: '不规则池岸会让亭、桥、树和墙都不再像摆件，而更像一个真实被走进去的园子。',
          en: 'The irregular shoreline keeps pavilion, bridge, trees, and walls from reading like props and makes the garden feel inhabited.',
        },
        tags: [
          { zh: '不规则池岸', en: 'Irregular edge' },
          { zh: '水面倒影', en: 'Water reflection' },
          { zh: '主空间展开', en: 'Main spatial reveal' },
        ],
        image: resolveGardenGalleryImage(zhuozhengSlug, 0, ''),
      },
      {
        id: 'pavilion',
        itemId: 'pavilion',
        label: { zh: '临水停顿', en: 'Waterside Pause' },
        title: { zh: '亭子负责制造停顿', en: 'The pavilion creates the pause' },
        summary: {
          zh: '走到亭边以后，屋面、栏杆和水面会形成最完整的一次重叠，这是最适合做实景预览的停驻镜头。',
          en: 'At the pavilion edge the roof, rails, and pond overlap into the clearest pause in the sequence.',
        },
        tags: [
          { zh: '亭边停驻', en: 'Pavilion pause' },
          { zh: '屋檐压景', en: 'Low eaves' },
          { zh: '近景重叠', en: 'Foreground overlap' },
        ],
        image: resolveGardenGalleryImage(zhuozhengSlug, 2, ''),
      },
      {
        id: 'rockery',
        itemId: 'rockery',
        label: { zh: '假山收束', en: 'Rockery Finish' },
        title: { zh: '最后用假山把动线收住', en: 'Close the route with the rockery' },
        summary: {
          zh: '假山和地势起伏负责压缩空间，把前面展开的水院重新收回到更深、更安静的角落里。',
          en: 'The rockery and raised ground compress the space again and draw the open water sequence back into a deeper corner.',
        },
        tags: [
          { zh: '太湖石', en: 'Taihu rock' },
          { zh: '高差变化', en: 'Ground relief' },
          { zh: '结尾收束', en: 'Compressed finish' },
        ],
        image: resolveGardenGalleryImage(zhuozhengSlug, 3, ''),
      },
    ],
  },
};
