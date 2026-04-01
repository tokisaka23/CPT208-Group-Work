import { resolveGardenGalleryImage, resolveGardenHeroImage } from './gardenImages';

function buildZhuozhengyuan() {
  const slug = 'zhuozhengyuan';

  return {
    kicker: {
      zh: '经典入门园林',
      en: 'An Ideal First Garden',
      ja: '最初の一園に向く庭園',
      ko: '처음 보기 좋은 대표 정원',
    },
    name: {
      zh: '拙政园',
      en: 'Humble Administrator\'s Garden',
      ja: '拙政園',
      ko: '졸정원',
    },
    englishName: 'The Humble Administrator\'s Garden',
    intro: {
      zh: '如果你想第一次就看懂苏州园林，拙政园很适合作为起点。它的水面开阔、亭榭舒展，适合先从大空间建立整体感，再慢慢进入细部。',
      en: 'If you want to understand Suzhou gardens on your first visit, this is the right place to begin. Its broad water courts and open pavilions let you grasp the whole before moving into detail.',
      ja: '初めて蘇州庭園を見るなら、拙政園はよい出発点になる。広い水面とゆるやかな亭の配置が、まず全体をつかみ、そのあと細部へ入る視線をつくってくれる。',
      ko: '쑤저우 정원을 처음 이해하고 싶다면 졸정원이 가장 좋은 출발점이다. 넓은 수면과 여유로운 정자 배치가 먼저 전체를 읽고 그다음 세부로 들어가게 해 준다.',
    },
    heroImage: resolveGardenHeroImage(
      slug,
      'https://images.unsplash.com/photo-1611288618898-e2a93f848cf6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600&dpr=2&auto=format',
    ),
    heroAlt: {
      zh: '拙政园园林景观',
      en: 'View of Humble Administrator\'s Garden',
      ja: '拙政園の景観',
      ko: '졸정원 풍경',
    },
    design: {
      variant: 'zhuozheng',
      accent: '#5F7F72',
      accentRgb: '95, 127, 114',
      secondary: '#7B9A8D',
      secondaryRgb: '123, 154, 141',
      watermark: '门',
      heroImagePosition: 'center 42%',
      heroQuote: {
        zh: '水面先开，心也就慢下来。',
        en: 'The water opens first, and your mind slows with it.',
        ja: 'まず水面がひらき、それにつれて心も静まっていく。',
        ko: '먼저 수면이 열리고, 그에 맞춰 마음도 느려진다.',
      },
      heroCaption: {
        zh: '拙政园适合先看“大势”，再回头读细节与框景。',
        en: 'Start with the large composition, then return for the details and framed scenes.',
        ja: 'まず大きな構成を見て、そのあと細部とフレームの景色へ戻るのが似合う庭だ。',
        ko: '먼저 큰 구도를 보고, 그다음 세부와 프레임 풍경으로 돌아오는 방식이 잘 어울린다.',
      },
      galleryTitle: {
        zh: '横向展开：一卷水院',
        en: 'Unfolded Sideways: A Scroll of Water Courts',
        ja: '横にひらく、水庭の一巻',
        ko: '가로로 펼치는 수원의 두루마리',
      },
      galleryIntro: {
        zh: '横向轻扫，像展开手卷一样，让视线沿水面与亭榭慢慢延伸。',
        en: 'Glide sideways as if opening a handscroll, letting the gaze extend across water and pavilions.',
        ja: '手巻きをひらくように横へ視線を流し、水面と亭のあいだをゆっくりたどる。',
        ko: '두루마리를 펼치듯 가로로 시선을 옮기며 수면과 정자 사이를 천천히 따라간다.',
      },
      highlightIntro: {
        zh: '它的“开阔”并不是空，而是让景与人都有喘息空间。',
        en: 'Its openness is not emptiness. It gives both the scenery and the visitor room to breathe.',
        ja: 'この庭の「ひらけ」は空虚ではなく、景色にも人にも呼吸の余白を与えている。',
        ko: '이 정원의 개방감은 비어 있음이 아니라 풍경과 사람 모두에게 숨 쉴 여백을 주는 방식이다.',
      },
      stepperIntro: {
        zh: '把行走当作呼吸：先展开，再收拢，再停顿。',
        en: 'Treat walking like breathing: open out, gather in, then pause.',
        ja: '歩くことを呼吸のように考える。まずひらき、次に収め、最後にとどまる。',
        ko: '걷기를 호흡처럼 생각한다. 먼저 펼치고, 다시 모으고, 마지막에 멈춘다.',
      },
      tipsIntro: {
        zh: '拙政园的美常在“回头一眼”。给自己留一点停顿的空白。',
        en: 'Much of this garden\'s beauty appears in the backward glance. Leave space for a pause.',
        ja: '拙政園の美しさは、ふと振り返った一瞬に現れることが多い。立ち止まる余白を残しておきたい。',
        ko: '졸정원의 아름다움은 뒤돌아보는 한순간에 자주 나타난다. 잠시 멈출 여백을 남겨 두는 편이 좋다.',
      },
    },
    backHref: '/',
    panoramaHref: '/zhuozheng/panorama',
    badges: [
      { zh: '适合第一次来苏州', en: 'Great for a first Suzhou visit', ja: '初めての蘇州に向く', ko: '쑤저우 첫 방문에 적합' },
      { zh: '水院视野开阔', en: 'Wide water-court views', ja: '広い水庭の視界', ko: '넓은 수원 시야' },
      { zh: '慢游友好', en: 'Slow-travel friendly', ja: 'ゆっくり歩きやすい', ko: '천천히 보기 좋음' },
    ],
    facts: [
      {
        label: { zh: '推荐停留', en: 'Suggested stay', ja: 'おすすめ滞在', ko: '추천 체류 시간' },
        value: { zh: '2 - 3 小时', en: '2-3 hours', ja: '2-3時間', ko: '2-3시간' },
      },
      {
        label: { zh: '观看重点', en: 'Focus on', ja: '見るポイント', ko: '중점 감상' },
        value: { zh: '水院、亭榭、借景', en: 'Water courts, pavilions, borrowed views', ja: '水庭・亭・借景', ko: '수원, 정자, 차경' },
      },
      {
        label: { zh: '最佳节奏', en: 'Best rhythm', ja: 'おすすめの順番', ko: '가장 좋은 리듬' },
        value: { zh: '上午先看整体', en: 'Read the whole in the morning', ja: '午前に全体を見る', ko: '오전에 전체를 먼저 보기' },
      },
      {
        label: { zh: '适合人群', en: 'Best for', ja: '向いている人', ko: '추천 대상' },
        value: { zh: '初次游园与拍照', en: 'First-time visitors and photography', ja: '初訪問と写真好き', ko: '첫 방문자와 사진 촬영' },
      },
    ],
    highlights: [
      {
        title: { zh: '先被水院打开视线', en: 'The water court opens your view first', ja: 'まず水庭が視界をひらく', ko: '먼저 수원이 시야를 연다' },
        description: {
          zh: '拙政园最迷人的地方之一，是你一进入就能感受到空间被池水慢慢拉开，视线和呼吸都更舒缓。',
          en: 'One of its great charms is how the pond immediately stretches the space, relaxing both your gaze and your breathing.',
          ja: '入った瞬間に池の広がりが空間をやわらかく引きのばし、視線も呼吸も自然に落ち着いていく。',
          ko: '들어서는 순간 연못이 공간을 부드럽게 넓혀 주어 시선과 호흡 모두가 한결 느슨해진다.',
        },
      },
      {
        title: { zh: '亭榭与长窗形成层次', en: 'Pavilions and long windows create the layers', ja: '亭と長窓が層をつくる', ko: '정자와 긴 창이 층위를 만든다' },
        description: {
          zh: '远看有节奏，近看有细节。亭台、水榭、花窗与植物彼此呼应，很适合慢慢观察前后景关系。',
          en: 'From afar the rhythm is clear, and up close the details answer each other through windows, pavilions, and planting.',
          ja: '遠くからはリズムが見え、近づくと細部が応答し合う。亭や花窓、植栽が前景と後景をゆっくり結んでくれる。',
          ko: '멀리서는 리듬이 보이고 가까이서는 디테일이 살아난다. 정자와 창, 식재가 전경과 후경을 천천히 이어 준다.',
        },
      },
      {
        title: { zh: '大空间里依然有细腻转折', en: 'Even the large scenes still turn delicately', ja: '大きな空間にも繊細な曲がりがある', ko: '큰 공간 안에도 섬세한 전환이 있다' },
        description: {
          zh: '虽然整体气质开阔，但它并不单调，步行过程中仍然会经历遮挡、转折和重新展开的空间变化。',
          en: 'Although the overall mood is open, it is never flat. Walking through it still means passing through screens, turns, and renewed openings.',
          ja: '全体はひらけているが単調ではなく、歩くあいだに遮りや曲がり、再びひらく瞬間が何度も現れる。',
          ko: '전체 분위기는 개방적이지만 결코 단조롭지 않다. 걸어가다 보면 가림과 굽이, 다시 열리는 순간이 반복된다.',
        },
      },
    ],
    itinerary: [
      {
        title: { zh: '第一段：先沿水面走一圈', en: 'First: circle the main water edge', ja: '第一段階：まず水辺を一周する', ko: '첫 단계: 먼저 수면을 따라 한 바퀴' },
        description: {
          zh: '不要急着拍局部，先从主要水面与亭榭关系建立整体印象，再进入细部会更容易看懂。',
          en: 'Do not rush toward fragments. Start with the relation between the main pond and pavilions, then move into the details.',
          ja: '部分だけを急いで見ず、まずは大きな水面と亭の関係で全体像をつかんでから細部へ入る。',
          ko: '부분만 서둘러 보지 말고 먼저 큰 수면과 정자의 관계로 전체 인상을 잡은 뒤 세부로 들어간다.',
        },
      },
      {
        title: { zh: '第二段：停下来看看窗框取景', en: 'Second: pause by the framed views', ja: '第二段階：窓のフレームで立ち止まる', ko: '두 번째: 프레임 풍경 앞에서 멈추기' },
        description: {
          zh: '走到长窗和洞门附近时，试着停 1 到 2 分钟，你会发现画面中的树、水、建筑会重新组合。',
          en: 'Near long windows and moon gates, pause for a minute or two and watch how trees, water, and buildings rearrange themselves.',
          ja: '長窓や洞門の近くでは一、二分だけ立ち止まってみる。木や水、建築の関係が組み替わって見えてくる。',
          ko: '긴 창과 원문 근처에서는 1-2분만 멈춰 서 보자. 나무와 물, 건축의 관계가 새롭게 조합되어 보인다.',
        },
      },
      {
        title: { zh: '第三段：留一点时间给安静角落', en: 'Third: leave time for the quiet corners', ja: '第三段階：静かな隅に時間を残す', ko: '세 번째: 조용한 구석에 시간을 남기기' },
        description: {
          zh: '除了主景，也可以刻意走慢一点，去看人少的转角、檐下与水边，气氛会更完整。',
          en: 'Beyond the headline scenes, slow down for quieter corners, thresholds, and waterside edges where the atmosphere feels whole.',
          ja: '主景だけでなく、人の少ない曲がり角や縁側、水辺にも足を向けると、この庭の空気がより完全に見えてくる。',
          ko: '대표 장면 외에도 사람이 적은 모퉁이와 처마 아래, 물가를 천천히 보면 이 정원의 분위기가 더 완전하게 느껴진다.',
        },
      },
    ],
    tips: [
      { zh: '上午光线更柔和，适合先从整体空间建立印象。', en: 'Morning light is softer and works well for reading the overall space first.', ja: '午前の光はやわらかく、まず全体をつかむのに向いている。', ko: '오전의 빛이 더 부드러워 전체 공간을 먼저 읽기에 좋다.' },
      { zh: '如果人流较多，尽量不要跟着人群节奏赶路，慢下来会更容易发现细节。', en: 'If it is crowded, avoid matching the crowd\'s speed. Slowing down makes details easier to catch.', ja: '人が多いときほど周囲の歩調に引っぱられず、自分の速度を落とすほうが細部に気づきやすい。', ko: '사람이 많을수록 군중의 속도를 따라가지 않는 편이 좋다. 느리게 볼수록 세부가 잘 보인다.' },
      { zh: '拍照时可多利用窗框、廊柱和倒影，它们能自然形成东方画面的层次。', en: 'For photography, use window frames, columns, and reflections to build natural layers in the composition.', ja: '写真を撮るなら、窓枠や柱、反射を使うと東洋絵画のような層が自然につくれる。', ko: '사진을 찍을 때는 창틀과 기둥, 반영을 활용하면 동양화 같은 층위를 자연스럽게 만들 수 있다.' },
    ],
    gallery: [
      { ratio: 'panorama', title: { zh: '水院开卷', en: 'The Water Court Opens', ja: '水庭がひらく', ko: '수원이 펼쳐지다' }, caption: { zh: '先把视线放远，池水会替你把空间拉开。', en: 'Let your eyes travel far first. The pond will widen the space for you.', ja: 'まず遠くへ視線を置くと、池が空間をゆっくりひらいてくれる。', ko: '먼저 시선을 멀리 두면 연못이 공간을 천천히 넓혀 준다.' }, src: resolveGardenGalleryImage(slug, 0, 'https://images.unsplash.com/photo-1611288618898-e2a93f848cf6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2400&dpr=2&auto=format') },
      { ratio: 'portrait', title: { zh: '窗下取景', en: 'Framing by the Window', ja: '窓辺で切り取る', ko: '창 아래에서 프레이밍' }, caption: { zh: '贴近长窗与廊柱，细节会自然出现。', en: 'Move close to windows and columns, and the details begin to show themselves.', ja: '長窓や柱に近づくと、細部が自然に立ち上がってくる。', ko: '긴 창과 기둥 가까이 가면 세부가 자연스럽게 드러난다.' }, src: resolveGardenGalleryImage(slug, 1, 'https://images.unsplash.com/photo-1564495562478-5d593d7a7d2f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600&dpr=2&auto=format') },
      { ratio: 'landscape', title: { zh: '亭榭停顿', en: 'A Pause by the Pavilion', ja: '亭で立ち止まる', ko: '정자 곁의 멈춤' }, caption: { zh: '停下 30 秒，你会听见水面把节奏放慢。', en: 'Stop for 30 seconds and you can feel the water slowing the rhythm around you.', ja: '三十秒だけ止まると、水面がまわりの速度を静かに落としていくのがわかる。', ko: '30초만 멈추면 수면이 주변의 리듬을 늦추는 것을 느낄 수 있다.' }, src: resolveGardenGalleryImage(slug, 2, 'https://images.unsplash.com/photo-1508599589929-6d3d118b5043?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1800&dpr=2&auto=format') },
      { ratio: 'square', title: { zh: '借景与留白', en: 'Borrowed Views and Empty Space', ja: '借景と余白', ko: '차경과 여백' }, caption: { zh: '把留白当成画面的呼吸，它会让景更有层次。', en: 'Treat empty space as part of the composition\'s breathing room.', ja: '余白を画面の呼吸として扱うと、景色に層が生まれる。', ko: '여백을 화면의 호흡으로 생각하면 풍경에 층위가 생긴다.' }, src: resolveGardenGalleryImage(slug, 3, 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1400&dpr=2&auto=format') },
    ],
    immersive: {
      overview: {
        zh: '从实时导览和沉浸漫游两个角度，重新阅读拙政园的水院、亭榭与回望关系。',
        en: 'Read Humble Administrator\'s Garden again through a live guide mode and an immersive panoramic tour.',
      },
      ar: {
        headline: {
          zh: 'AR 水院导览',
          en: 'AR Water-Court Guide',
        },
        summary: {
          zh: '抬起手机时，重点会叠加在主水面、远香堂和借景回望线上。',
          en: 'Lift the phone to overlay notes onto the main water court, the pavilion axis, and the return view.',
        },
        tip: {
          zh: '建议先点击水院，再读亭榭，最后回看借景关系。',
          en: 'Start with the water court, then the pavilion, and finish with the borrowed view.',
        },
        hotspots: [
          {
            id: 'water-court',
            label: { zh: '水院', en: 'Water Court' },
            title: { zh: '先读开阔水面', en: 'Read the open water first' },
            description: {
              zh: '这里决定了入园第一眼的空间尺度，先建立整体，再进入细节会更顺。',
              en: 'This open water plane sets the first spatial scale before you move into details.',
            },
            artifact: { zh: '水面、岸线、停驻点', en: 'Water plane, edge line, pause points' },
            x: 28,
            y: 63,
          },
          {
            id: 'pavilion-axis',
            label: { zh: '亭榭', en: 'Pavilion' },
            title: { zh: '亭榭让视线有了停顿', en: 'The pavilion creates the pause' },
            description: {
              zh: '从水面转向亭榭时，视线会从展开变成收拢，这是节奏变化最明显的一步。',
              en: 'Turning from the pond to the pavilion shifts the view from open to gathered.',
            },
            artifact: { zh: '台基、廊檐、栏杆节奏', en: 'Platform, eaves, railing rhythm' },
            x: 57,
            y: 42,
          },
          {
            id: 'borrowed-view',
            label: { zh: '借景', en: 'Borrowed View' },
            title: { zh: '回望时借景更明显', en: 'Borrowed views sharpen on the way back' },
            description: {
              zh: '回头看时，窗框、树影和水面会重新组织画面，这是拙政园最适合慢看的地方。',
              en: 'On the backward glance, frames, trees, and reflections reorganize the scene.',
            },
            artifact: { zh: '窗框、树影、倒影', en: 'Frames, tree shadows, reflections' },
            x: 77,
            y: 54,
          },
        ],
      },
      vr: {
        headline: {
          zh: 'VR 水院漫游',
          en: 'VR Water-Court Tour',
        },
        summary: {
          zh: '拖动画面，沿着“开阔水院 - 亭榭停顿 - 借景回望”的顺序漫游。',
          en: 'Pan through the sequence of open water, pavilion pause, and backward borrowed views.',
        },
        tip: {
          zh: '左右拖拽会改变视角，切换场景可以感受空间如何一层层展开。',
          en: 'Drag to pan and switch scenes to feel how the space unfolds in layers.',
        },
        scenes: [
          {
            id: 'water-entry',
            title: { zh: '主水院入口', en: 'Main Water Entry' },
            description: {
              zh: '先用最开阔的视角建立整体印象，再决定往哪一个细节靠近。',
              en: 'Begin with the broadest view to build the overall impression first.',
            },
            image: resolveGardenGalleryImage(slug, 0, 'https://images.unsplash.com/photo-1611288618898-e2a93f848cf6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2400&dpr=2&auto=format'),
            initialPan: 35,
            panRange: 34,
            hotspots: [
              {
                id: 'entry-water-axis',
                label: { zh: '主水面', en: 'Main Water' },
                title: { zh: '视线先被水面拉开', en: 'The water pulls the eye open first' },
                description: {
                  zh: '水面越开阔，后续每一次转折就越容易被感受到。',
                  en: 'The broader the pond reads, the clearer every later turn becomes.',
                },
                x: 24,
                y: 60,
              },
              {
                id: 'entry-pavilion',
                label: { zh: '亭榭关系', en: 'Pavilion Axis' },
                title: { zh: '亭榭是第二个重心', en: 'The pavilion becomes the second center of gravity' },
                description: {
                  zh: '它让你的视线从平面转换到层次更细的立面阅读。',
                  en: 'It shifts your attention from the flat plane into layered architectural reading.',
                },
                x: 61,
                y: 41,
              },
            ],
          },
          {
            id: 'pavilion-pause',
            title: { zh: '亭边停顿', en: 'Pause by the Pavilion' },
            description: {
              zh: '停下来以后，亭、廊、水三者会形成更清晰的前后景关系。',
              en: 'Pausing here sharpens the layered relation between pavilion, corridor, and water.',
            },
            image: resolveGardenGalleryImage(slug, 2, 'https://images.unsplash.com/photo-1508599589929-6d3d118b5043?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1800&dpr=2&auto=format'),
            initialPan: 50,
            panRange: 26,
            hotspots: [
              {
                id: 'pause-eaves',
                label: { zh: '檐口', en: 'Eaves' },
                title: { zh: '檐口让水面有了边界', en: 'The eaves give the pond a clear edge' },
                description: {
                  zh: '屋檐的压低感让视野从“远”转向“近”。',
                  en: 'The low eaves turn a distant reading into a closer one.',
                },
                x: 48,
                y: 28,
              },
              {
                id: 'pause-reflection',
                label: { zh: '倒影', en: 'Reflection' },
                title: { zh: '倒影在这里变成第二层画面', en: 'The reflection becomes a second picture plane' },
                description: {
                  zh: '如果稍微停留，倒影会让亭榭关系看起来更完整。',
                  en: 'A short pause lets the reflection complete the composition.',
                },
                x: 66,
                y: 70,
              },
            ],
          },
          {
            id: 'framed-return',
            title: { zh: '回望借景', en: 'Framed Return View' },
            description: {
              zh: '回头看时，借景和留白会让空间层次突然变深。',
              en: 'On the way back, borrowed views and empty space suddenly deepen the composition.',
            },
            image: resolveGardenGalleryImage(slug, 1, 'https://images.unsplash.com/photo-1564495562478-5d593d7a7d2f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600&dpr=2&auto=format'),
            initialPan: 42,
            panRange: 22,
            hotspots: [
              {
                id: 'return-frame',
                label: { zh: '窗框', en: 'Frame' },
                title: { zh: '窗框会重组景物关系', en: 'The frame reorganizes the scene' },
                description: {
                  zh: '此时树、水、建筑不再分散，而是被组织成一个完整画面。',
                  en: 'Trees, water, and buildings stop feeling separate and read as one composition.',
                },
                x: 38,
                y: 44,
              },
              {
                id: 'return-void',
                label: { zh: '留白', en: 'Void' },
                title: { zh: '留白让画面真正松开', en: 'The empty space lets the scene breathe' },
                description: {
                  zh: '拙政园的慢游感，常常就藏在这些看似空的地方。',
                  en: 'Much of the garden’s calm comes from these seemingly empty parts of the scene.',
                },
                x: 73,
                y: 58,
              },
            ],
          },
        ],
      },
    },
    immersive: {
      overview: {
        zh: '用 AR 把廊道、门洞和厅堂的关系叠加出来，再用 VR 顺着移步换景的节奏慢慢走一遍。',
        en: 'Use AR to highlight corridor and hall relations, then follow the sequence in a VR roaming view.',
      },
      ar: {
        headline: {
          zh: 'AR 廊道导览',
          en: 'AR Corridor Guide',
        },
        summary: {
          zh: '重点会叠加在长廊、门洞和厅堂连接处，帮助你看清留园最强的转折节奏。',
          en: 'Overlay notes onto the corridors, gateways, and halls that shape Lingering Garden\'s transitions.',
        },
        tip: {
          zh: '建议先跟着廊道走，再回头看门洞和厅堂是怎样重组画面的。',
          en: 'Follow the corridor first, then look back at how gateways and halls reshape the scene.',
        },
        hotspots: [
          {
            id: 'corridor-line',
            label: { zh: '长廊', en: 'Corridor' },
            title: { zh: '廊道先把游线串起来', en: 'The corridor stitches the route together' },
            description: {
              zh: '留园最迷人的地方不是单点，而是连贯空间如何一步步引导你前进。',
              en: 'Lingering Garden works through sequence rather than isolated moments.',
            },
            artifact: { zh: '廊道走势、转角、停点', en: 'Corridor line, turns, pause points' },
            x: 34,
            y: 61,
          },
          {
            id: 'gate-frame',
            label: { zh: '门洞', en: 'Gateway' },
            title: { zh: '门洞像一次次剪辑', en: 'Gateways work like repeated edits' },
            description: {
              zh: '每一次穿过门洞，前景和后景都会重新排列，这是留园的节奏核心。',
              en: 'Each gateway re-edits foreground and background into a new frame.',
            },
            artifact: { zh: '月洞门、漏窗、框景', en: 'Moon gate, lattice, framed view' },
            x: 59,
            y: 45,
          },
          {
            id: 'hall-volume',
            label: { zh: '厅堂', en: 'Hall' },
            title: { zh: '厅堂让节奏从窄转宽', en: 'The hall turns narrow sequence into volume' },
            description: {
              zh: '从廊到厅，空间会突然放大，前面的转折也因此更有力度。',
              en: 'Moving from corridor into hall expands the spatial volume and sharpens the transition.',
            },
            artifact: { zh: '厅堂尺度、厅外借景', en: 'Hall scale, views beyond the hall' },
            x: 74,
            y: 34,
          },
        ],
      },
      vr: {
        headline: {
          zh: 'VR 移步换景',
          en: 'VR Changing-View Tour',
        },
        summary: {
          zh: '按“廊道铺陈 - 门洞剪辑 - 厅堂展开”的顺序拖动画面，感受留园的层层推进。',
          en: 'Pan through corridor sequence, framed gateway edits, and expanded hall volume.',
        },
        tip: {
          zh: '每个场景都适合先看整体，再慢慢把视线收回到框景和细部。',
          en: 'Each scene reads best by starting wide and then returning to the framed details.',
        },
        scenes: [
          {
            id: 'corridor-sequence',
            title: { zh: '长廊铺陈', en: 'Corridor Sequence' },
            description: {
              zh: '先跟着廊道走一遍，不急着停下，空间的连续性会先被建立起来。',
              en: 'Walk the corridor first without stopping too early so the full sequence can register.',
            },
            image: resolveGardenGalleryImage(slug, 0, 'https://images.unsplash.com/photo-1771937820345-6aced121dba7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2200&dpr=2&auto=format'),
            initialPan: 38,
            panRange: 34,
            hotspots: [
              {
                id: 'corridor-depth',
                label: { zh: '廊深', en: 'Depth' },
                title: { zh: '廊深决定推进感', en: 'Depth drives the forward pull' },
                description: {
                  zh: '留园的连贯感，首先来自廊道把多个空间连成一句完整的话。',
                  en: 'The corridor makes multiple spaces read as one continuous sentence.',
                },
                x: 27,
                y: 57,
              },
              {
                id: 'corridor-turn',
                label: { zh: '转角', en: 'Turn' },
                title: { zh: '转角是下一层画面的开关', en: 'The turn unlocks the next composition' },
                description: {
                  zh: '每个转角都不是终点，而是为下一层画面预留节奏。',
                  en: 'Every turn is a setup for the next view rather than an endpoint.',
                },
                x: 63,
                y: 44,
              },
            ],
          },
          {
            id: 'gateways',
            title: { zh: '门洞剪辑', en: 'Gateway Framing' },
            description: {
              zh: '门洞和漏窗像连续剪辑，让同一片景在几步之间反复被重组。',
              en: 'Gateways and lattice windows repeatedly edit the same view into new frames.',
            },
            image: resolveGardenGalleryImage(slug, 1, 'https://images.unsplash.com/photo-1555217851-6141535bd771?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600&dpr=2&auto=format'),
            initialPan: 52,
            panRange: 24,
            hotspots: [
              {
                id: 'gateway-cut',
                label: { zh: '门洞剪辑', en: 'Cut' },
                title: { zh: '框景让同一景不断变化', en: 'Framing keeps changing the same scene' },
                description: {
                  zh: '你看到的不是新景物，而是旧景物被重新组织。',
                  en: 'The view changes not by new objects, but by new arrangements.',
                },
                x: 46,
                y: 38,
              },
              {
                id: 'lattice-detail',
                label: { zh: '漏窗', en: 'Lattice' },
                title: { zh: '细部把节奏压得更紧', en: 'Detail tightens the rhythm' },
                description: {
                  zh: '靠近细部以后，留园的层次感会一下子变得更密。',
                  en: 'Moving closer to detail makes the layering feel denser and sharper.',
                },
                x: 68,
                y: 55,
              },
            ],
          },
          {
            id: 'hall-release',
            title: { zh: '厅堂展开', en: 'Hall Release' },
            description: {
              zh: '从门洞进入厅堂时，画面会从压缩转向舒展，这是留园最舒服的展开方式。',
              en: 'Passing into the hall releases the compression and opens the space back out.',
            },
            image: resolveGardenGalleryImage(slug, 2, 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2200&dpr=2&auto=format'),
            initialPan: 44,
            panRange: 28,
            hotspots: [
              {
                id: 'hall-threshold',
                label: { zh: '门槛', en: 'Threshold' },
                title: { zh: '门槛就是节奏转换点', en: 'The threshold marks the rhythm change' },
                description: {
                  zh: '刚跨过去时，前面的所有转折都会突然显得更完整。',
                  en: 'Crossing the threshold makes the prior sequence feel newly complete.',
                },
                x: 34,
                y: 62,
              },
              {
                id: 'hall-borrowed',
                label: { zh: '厅外景', en: 'Outer View' },
                title: { zh: '厅堂会把外景重新纳进来', en: 'The hall gathers outside views back in' },
                description: {
                  zh: '厅堂不只是室内，它会把园外与园内重新接起来。',
                  en: 'The hall reconnects inside and outside into one reading.',
                },
                x: 72,
                y: 36,
              },
            ],
          },
        ],
      },
    },
    immersive: {
      overview: {
        zh: '把网师园的小尺度和深层次拆开来看：AR 用来找细部，VR 用来读静气与回望。',
        en: 'Use AR to inspect the details of Master of Nets Garden, then use VR to feel its scale and quiet depth.',
      },
      ar: {
        headline: {
          zh: 'AR 微尺度导览',
          en: 'AR Intimate-Scale Guide',
        },
        summary: {
          zh: '热点会落在门洞、漏窗和水边关系上，帮助你看清网师园“少而深”的空间表达。',
          en: 'Overlay notes onto the moon gate, lattice details, and waterside relation that define the garden.',
        },
        tip: {
          zh: '网师园更适合近距离读细节，建议多点几次不同热点再对比回看。',
          en: 'This garden rewards close reading, so compare several hotspots before moving on.',
        },
        hotspots: [
          {
            id: 'moon-gate',
            label: { zh: '门洞', en: 'Moon Gate' },
            title: { zh: '门洞把尺度压缩得刚刚好', en: 'The gate compresses the scale precisely' },
            description: {
              zh: '网师园的层次感并不靠大，而是靠门洞把视线压缩后再慢慢放开。',
              en: 'Its depth comes from compressing the view and then releasing it slowly.',
            },
            artifact: { zh: '门洞、前景、后景', en: 'Gate, foreground, background' },
            x: 30,
            y: 52,
          },
          {
            id: 'lattice-rhythm',
            label: { zh: '漏窗', en: 'Lattice' },
            title: { zh: '漏窗让细部先于大景被看见', en: 'The lattice lets detail arrive before the whole' },
            description: {
              zh: '靠近漏窗时，建筑细部会先抓住你，再把你带回整体空间。',
              en: 'Approaching the lattice makes detail speak before the larger space does.',
            },
            artifact: { zh: '窗棂、砖雕、边框', en: 'Lattice bars, brick carving, frame edges' },
            x: 62,
            y: 37,
          },
          {
            id: 'waterside-quiet',
            label: { zh: '水边', en: 'Waterside' },
            title: { zh: '水边是静气最深的一层', en: 'The waterside holds the deepest quiet' },
            description: {
              zh: '网师园的慢，不是停在原地，而是在小尺度里不断发现新的安静关系。',
              en: 'Its calm comes from repeatedly discovering new quiet relations within a compact scale.',
            },
            artifact: { zh: '水面、石岸、倒影', en: 'Water surface, stone edge, reflection' },
            x: 76,
            y: 66,
          },
        ],
      },
      vr: {
        headline: {
          zh: 'VR 静读网师园',
          en: 'VR Quiet Reading Tour',
        },
        summary: {
          zh: '按“压缩入口 - 靠近细部 - 回到水边”的顺序漫游，最容易看见网师园的气质。',
          en: 'Pan from compressed entry to close detail, then back out to the waterside quiet.',
        },
        tip: {
          zh: '这里不需要拖得太快，留一点停顿，场景层次会更明显。',
          en: 'Do not pan too quickly here. A little pause reveals the scene more clearly.',
        },
        scenes: [
          {
            id: 'compressed-entry',
            title: { zh: '压缩入口', en: 'Compressed Entry' },
            description: {
              zh: '从入口开始，空间先被收住，随后才慢慢把深度交给你。',
              en: 'The entry compresses the space first and only gradually gives depth back to you.',
            },
            image: resolveGardenGalleryImage(slug, 0, 'https://images.unsplash.com/photo-1697832245666-78c870b29813?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1800&dpr=2&auto=format'),
            initialPan: 40,
            panRange: 20,
            hotspots: [
              {
                id: 'entry-compression',
                label: { zh: '尺度', en: 'Scale' },
                title: { zh: '入口先收，再展开', en: 'The entry gathers before it opens' },
                description: {
                  zh: '正因为入口被压缩，后面每一点展开都更有分量。',
                  en: 'Because the entry is compressed, every later opening feels more meaningful.',
                },
                x: 33,
                y: 50,
              },
              {
                id: 'entry-corner',
                label: { zh: '角落', en: 'Corner' },
                title: { zh: '角落里已经藏着下一层画面', en: 'The corner already hides the next layer' },
                description: {
                  zh: '网师园常常在不起眼的角落里，把下一步节奏悄悄埋好。',
                  en: 'The next rhythm is often planted quietly inside an unassuming corner.',
                },
                x: 69,
                y: 57,
              },
            ],
          },
          {
            id: 'detail-reading',
            title: { zh: '靠近细部', en: 'Close Detail Reading' },
            description: {
              zh: '把视线收回到窗棂、栏杆和匾额，网师园的气质会更具体。',
              en: 'Return your eye to lattice, railing, and plaque to make the garden feel more tangible.',
            },
            image: resolveGardenGalleryImage(slug, 1, 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1500&dpr=2&auto=format'),
            initialPan: 47,
            panRange: 18,
            hotspots: [
              {
                id: 'detail-lattice',
                label: { zh: '窗棂', en: 'Lattice' },
                title: { zh: '细部会先于整体建立情绪', en: 'Detail establishes mood before the whole does' },
                description: {
                  zh: '这正是网师园最适合近看的原因。',
                  en: 'This is exactly why the garden rewards close viewing.',
                },
                x: 45,
                y: 33,
              },
              {
                id: 'detail-railing',
                label: { zh: '栏杆', en: 'Railing' },
                title: { zh: '栏杆让前后景关系更清楚', en: 'Railings clarify foreground and background' },
                description: {
                  zh: '近景一旦稳住，背后的安静层次会突然清晰。',
                  en: 'Once the foreground is anchored, the deeper quiet becomes clear.',
                },
                x: 72,
                y: 61,
              },
            ],
          },
          {
            id: 'waterside-return',
            title: { zh: '回到水边', en: 'Return to the Waterside' },
            description: {
              zh: '回到水边以后，前面的所有细部都会重新沉进更安静的整体气氛里。',
              en: 'Back at the water, all earlier details settle into a quieter whole.',
            },
            image: resolveGardenGalleryImage(slug, 2, 'https://images.unsplash.com/photo-1526481280695-3c687fd643ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2000&dpr=2&auto=format'),
            initialPan: 36,
            panRange: 24,
            hotspots: [
              {
                id: 'water-reflection',
                label: { zh: '倒影', en: 'Reflection' },
                title: { zh: '倒影让静气更深', en: 'Reflections deepen the quiet' },
                description: {
                  zh: '小水面并不喧哗，但它让整座园林的节奏慢下来。',
                  en: 'The modest water surface slows the entire rhythm of the garden.',
                },
                x: 29,
                y: 68,
              },
              {
                id: 'water-edge',
                label: { zh: '石岸', en: 'Stone Edge' },
                title: { zh: '石岸把近景和远景缝合起来', en: 'The stone edge stitches near and far together' },
                description: {
                  zh: '网师园的深度常常就藏在这些边缘关系里。',
                  en: 'Much of the garden’s depth is hidden in these edge conditions.',
                },
                x: 69,
                y: 49,
              },
            ],
          },
        ],
      },
    },
    relatedGardens: [
      { kicker: { zh: '下一站推荐', en: 'Suggested Next Stop', ja: '次にすすめたい庭', ko: '다음 추천 정원' }, label: { zh: '留园', en: 'Lingering Garden', ja: '留園', ko: '유원' }, description: { zh: '如果你想看更连续的廊道和更强的转折感，接着看留园会很顺。', en: 'If you want stronger turns and longer corridor sequences, Lingering Garden follows naturally.', ja: 'より連続する回廊と強い空間の折れを見たいなら、そのまま留園へつなぐのがよい。', ko: '더 긴 회랑과 강한 공간 전환을 보고 싶다면 유원으로 이어 가는 것이 좋다.' }, href: '/liu' },
      { kicker: { zh: '夜游气质', en: 'Quieter Evening Mood', ja: '夜に似合う気配', ko: '야경에 어울리는 분위기' }, label: { zh: '网师园', en: 'Master of Nets Garden', ja: '網師園', ko: '망사원' }, description: { zh: '想体验更静的尺度和更含蓄的空间气质，可以继续看网师园。', en: 'For a quieter scale and a more restrained atmosphere, continue to Master of Nets Garden.', ja: 'より静かな尺度と抑えた空気を味わいたいなら、次は網師園がよく似合う。', ko: '더 조용한 스케일과 절제된 분위기를 원한다면 망사원으로 이어 가면 된다.' }, href: '/wangshi' },
      { kicker: { zh: '回到首页', en: 'Back to the Main Page', ja: 'トップへ戻る', ko: '메인으로 돌아가기' }, label: { zh: '继续浏览主页面', en: 'Continue Browsing the Home Page', ja: 'トップページを続けて見る', ko: '메인 페이지 계속 보기' }, description: { zh: '返回首页后，你还可以查看推荐路线、园林札记与更多服务。', en: 'Back on the home page, you can continue with suggested routes, notes, and more tools.', ja: 'トップへ戻れば、おすすめルートや庭園ノート、ほかの機能も続けて見られる。', ko: '메인 페이지로 돌아가면 추천 루트와 정원 메모, 다른 기능도 계속 볼 수 있다.' }, href: '/' },
    ],
    nextGarden: {
      label: { zh: '留园', en: 'Lingering Garden', ja: '留園', ko: '유원' },
      href: '/liu',
    },
  };
}

function buildLiuyuan() {
  const slug = 'liuyuan';

  return {
    kicker: {
      zh: '框景层次代表',
      en: 'A Garden of Layered Framing',
      ja: 'フレーム景の名手',
      ko: '프레임 풍경의 대표 정원',
    },
    name: {
      zh: '留园',
      en: 'Lingering Garden',
      ja: '留園',
      ko: '유원',
    },
    englishName: 'The Lingering Garden',
    intro: {
      zh: '留园很适合喜欢“移步换景”的人。它最迷人的地方不是单个景点，而是你在廊、院、厅、石之间不断被引导前进，节奏很完整。',
      en: 'Lingering Garden is ideal for anyone who loves changing views while walking. Its charm is not one isolated scene but the way corridors, courts, halls, and rocks keep guiding you forward.',
      ja: '留園は「歩くたびに景色が変わる」感覚が好きな人に向いている。魅力は単独の名所ではなく、回廊や庭、広間、石組のあいだを連続的に導いていくリズムにある。',
      ko: '유원은 걸을 때마다 풍경이 바뀌는 감각을 좋아하는 사람에게 잘 맞는다. 매력은 하나의 명소가 아니라 회랑과 뜰, 전각과 괴석 사이를 연속적으로 이끄는 흐름에 있다.',
    },
    heroImage: resolveGardenHeroImage(
      slug,
      'https://images.unsplash.com/photo-1771937820345-6aced121dba7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600&dpr=2&auto=format',
    ),
    heroAlt: {
      zh: '留园园林景观',
      en: 'View of Lingering Garden',
      ja: '留園の景観',
      ko: '유원 풍경',
    },
    design: {
      variant: 'liuyuan',
      accent: '#6D4324',
      accentRgb: '109, 67, 36',
      secondary: '#A67448',
      secondaryRgb: '166, 116, 72',
      watermark: '境',
      heroImagePosition: 'center center',
      heroQuote: {
        zh: '不是一眼望尽，而是一转再转。',
        en: 'It is not seen in one glance, but through turn after turn.',
        ja: 'ひと目で尽きるのではなく、曲がるたびに深まっていく。',
        ko: '한눈에 끝나는 정원이 아니라, 돌 때마다 깊어지는 정원이다.',
      },
      heroCaption: {
        zh: '留园的节奏来自廊道、门洞与厅堂之间不断重组的框景。',
        en: 'Its rhythm comes from views constantly reframed by corridors, gateways, and halls.',
        ja: '留園のリズムは、回廊や門洞、広間のあいだで何度も組み替えられるフレーム景から生まれる。',
        ko: '유원의 리듬은 회랑과 문, 전각 사이에서 끊임없이 다시 짜이는 프레임 풍경에서 나온다.',
      },
      galleryTitle: {
        zh: '横向展开：一卷曲廊',
        en: 'Unfolded Sideways: A Scroll of Curving Corridors',
        ja: '横にひらく、曲廊の一巻',
        ko: '가로로 펼치는 곡선 회랑의 두루마리',
      },
      galleryIntro: {
        zh: '画卷里的卡片高低错落，像走在曲廊里，视线一会儿被抬起，一会儿被收进门洞。',
        en: 'The gallery rises and falls like walking through winding corridors, lifting the eye and then drawing it back into a gateway.',
        ja: '高低差のあるカードの並びは曲廊を歩く感覚に近く、視線が持ち上がったり門洞へ収められたりを繰り返す。',
        ko: '높낮이가 다른 카드 배열은 곡선 회랑을 걷는 감각과 비슷해서, 시선이 들어 올려졌다가 다시 문 안으로 수렴된다.',
      },
      highlightIntro: {
        zh: '在留园，精彩不是单点爆发，而是连续的“前后景关系”。',
        en: 'Here, the delight does not come from one single climax but from continuous relations between foreground and background.',
        ja: '留園のおもしろさは一点の見せ場ではなく、前景と後景が連続的に結ばれていくところにある。',
        ko: '유원의 재미는 한 장면의 절정이 아니라 전경과 후경이 계속 이어지는 관계 속에 있다.',
      },
      stepperIntro: {
        zh: '先顺着廊道建立叙事，再回头看每一处转折如何发生。',
        en: 'Follow the corridor first to build the story, then turn back to see how each transition works.',
        ja: 'まず回廊に沿って物語の流れをつかみ、そのあと振り返って曲がりごとの仕掛けを見る。',
        ko: '먼저 회랑을 따라 전체 서사를 잡고, 그다음 되돌아보며 각 전환이 어떻게 만들어지는지 본다.',
      },
      tipsIntro: {
        zh: '留园适合边走边回头。精彩画面，常常在转身之后才真正成立。',
        en: 'Lingering Garden rewards walking and looking back. The best compositions often appear only after you turn around.',
        ja: '留園は歩きながら振り返るのがよく似合う。美しい構図は、身をひるがえしたあとにようやく成立することが多い。',
        ko: '유원은 걸으며 뒤돌아보는 방식이 잘 맞는다. 가장 좋은 구도는 몸을 돌린 뒤에야 완성되는 경우가 많다.',
      },
    },
    backHref: '/',
    panoramaHref: '/liu/panorama',
    badges: [
      { zh: '长廊串联强', en: 'Strong corridor sequence', ja: '回廊の連続が見事', ko: '회랑 연결감이 강함' },
      { zh: '框景丰富', en: 'Rich framed views', ja: 'フレーム景が豊か', ko: '프레임 풍경이 풍부함' },
      { zh: '适合细看建筑', en: 'Great for close architectural reading', ja: '建築を細かく見るのに向く', ko: '건축 세부 관찰에 적합' },
    ],
    facts: [
      { label: { zh: '推荐停留', en: 'Suggested stay', ja: 'おすすめ滞在', ko: '추천 체류 시간' }, value: { zh: '2 小时左右', en: 'About 2 hours', ja: '約2時間', ko: '약 2시간' } },
      { label: { zh: '观看重点', en: 'Focus on', ja: '見るポイント', ko: '중점 감상' }, value: { zh: '长廊、厅堂、山石', en: 'Corridors, halls, rocks', ja: '回廊・広間・石組', ko: '회랑, 전각, 괴석' } },
      { label: { zh: '最佳节奏', en: 'Best rhythm', ja: 'おすすめの歩き方', ko: '가장 좋은 리듬' }, value: { zh: '跟着廊道慢慢转', en: 'Let the corridors set the pace', ja: '回廊に沿ってゆっくり回る', ko: '회랑을 따라 천천히 돌기' } },
      { label: { zh: '适合人群', en: 'Best for', ja: '向いている人', ko: '추천 대상' }, value: { zh: '喜欢层次和构图', en: 'People who love layers and composition', ja: '層と構図が好きな人', ko: '층위와 구도를 좋아하는 사람' } },
    ],
    highlights: [
      { title: { zh: '长廊把景串成连续叙事', en: 'Corridors turn scenes into a continuous story', ja: '回廊が景色を連続した物語にする', ko: '회랑이 풍경을 연속된 이야기로 묶는다' }, description: { zh: '你在留园中很少会突然被抛到一个孤立场景里，更多时候是廊道带着你一步一步进入下一层画面。', en: 'You are rarely dropped into an isolated view. More often, the corridor leads you step by step into the next composition.', ja: '孤立した一景へ放り出されることは少なく、むしろ回廊が次の画面へ一歩ずつ導いていく。', ko: '고립된 한 장면에 갑자기 던져지는 일은 드물고, 대개 회랑이 다음 구도로 한 걸음씩 이끈다.' } },
      { title: { zh: '厅堂与庭院关系非常完整', en: 'Halls and courtyards are tightly linked', ja: '広間と庭の関係がとても豊か', ko: '전각과 뜰의 관계가 매우 탄탄하다' }, description: { zh: '建筑内部与外部互相借景，站在不同位置回看，会发现门、窗、柱子本身也是景观的一部分。', en: 'Interior and exterior spaces borrow from each other. Doors, windows, and columns become part of the scenery itself.', ja: '内と外が互いに借景し合い、立つ位置を変えて見ると門や窓、柱そのものが景色の一部になっているとわかる。', ko: '내부와 외부가 서로 차경하며, 위치를 바꿔 바라보면 문과 창, 기둥 자체가 풍경의 일부라는 것이 보인다.' } },
      { title: { zh: '适合观察“转折”怎么发生', en: 'A great place to study how transitions happen', ja: '空間の折れがどう起きるかを見るのに向く', ko: '공간 전환이 어떻게 일어나는지 보기 좋다' }, description: { zh: '从开到收、从明到暗、从宽到窄，这些变化在留园里很清楚，是理解苏州园林空间节奏的好地方。', en: 'From open to enclosed, bright to dim, wide to narrow, the transitions here clearly reveal the rhythm of Suzhou garden space.', ja: 'ひらきから収まりへ、明るさから陰へ、広さから狭さへ。その変化がよく見え、蘇州庭園の空間リズムを理解しやすい。', ko: '열림에서 수렴으로, 밝음에서 어둠으로, 넓음에서 좁음으로 이어지는 변화를 선명하게 볼 수 있어 쑤저우 정원의 공간 리듬을 이해하기 좋다.' } },
    ],
    itinerary: [
      { title: { zh: '第一段：顺着廊道看整体连接', en: 'First: walk the corridor sequence', ja: '第一段階：回廊に沿って全体をつかむ', ko: '첫 단계: 회랑을 따라 전체 연결을 보기' }, description: { zh: '进入后先不要频繁停下，先把连续空间关系走一遍，感受“移步换景”怎么自然发生。', en: 'Do not stop too often at first. Walk the continuous sequence once to feel how the changing views arise naturally.', ja: '入ってすぐは頻繁に止まらず、まず連続する空間関係を一度たどって、景色の切り替わり方を感じる。', ko: '들어가자마자 자주 멈추지 말고 먼저 연속된 공간 관계를 한 번 따라가며 풍경이 어떻게 자연스럽게 바뀌는지 느낀다.' } },
      { title: { zh: '第二段：回头看门窗和框景', en: 'Second: look back through doors and windows', ja: '第二段階：門や窓を通して見返す', ko: '두 번째: 문과 창을 통해 뒤돌아보기' }, description: { zh: '第二遍再关注门框、漏窗和柱廊，你会发现同一个景被多次重新组织。', en: 'On the second pass, focus on frames, lattice windows, and columns. The same scene gets reorganized again and again.', ja: '二周目は門枠や漏窓、柱廊に注目すると、同じ景色が何度も組み替えられているのがわかる。', ko: '두 번째에는 문틀과 투창, 주랑에 집중하면 같은 풍경이 여러 번 다시 구성되는 것을 볼 수 있다.' } },
      { title: { zh: '第三段：停在庭院边缘看山石', en: 'Third: pause at the courtyard edge for the rocks', ja: '第三段階：庭の端で石組を見る', ko: '세 번째: 뜰 가장자리에서 괴석 보기' }, description: { zh: '不要只看中轴景点，侧边与角落往往更能看到山石、植物与建筑如何互相衬托。', en: 'Do not stay only on the main axis. Side spaces and corners show better how rock, planting, and architecture support each other.', ja: '中軸の見どころだけでなく、脇や角へ入ると石組や植栽、建築がどう引き立て合うかがよりよく見える。', ko: '중심 축만 보지 말고 옆 공간과 모서리로 가 보면 괴석과 식재, 건축이 서로를 어떻게 받쳐 주는지 더 잘 보인다.' } },
    ],
    tips: [
      { zh: '留园非常适合边走边回头看，很多精彩构图都在你转身时出现。', en: 'Lingering Garden rewards looking back while you walk. Many of its best compositions appear when you turn around.', ja: '留園は歩きながら振り返るのに向いていて、美しい構図の多くは振り向いた瞬間に現れる。', ko: '유원은 걸으며 뒤돌아보기에 좋고, 가장 좋은 구도는 몸을 돌린 순간에 자주 나타난다.' },
      { zh: '如果你喜欢拍照，建议多站在廊道与门洞交界处寻找层层递进的画面。', en: 'If you enjoy photography, stand where corridors and gateways meet to find deeper layered compositions.', ja: '写真が好きなら、回廊と門洞の境目に立って奥行きのある構図を探すのがおすすめだ。', ko: '사진을 좋아한다면 회랑과 문이 만나는 지점에 서서 층층이 이어지는 구도를 찾는 것이 좋다.' },
      { zh: '相比快速打卡，留园更适合两段式游览：先走一遍，再细看一遍。', en: 'More than a quick visit, this garden suits a two-pass rhythm: one walk for the whole, another for the details.', ja: '急いで回るよりも、一度全体を歩き、そのあと細部を見る二段階の見学がよく似合う。', ko: '빠르게 찍고 나오는 것보다 한 번은 전체를, 한 번은 세부를 보는 두 단계 관람이 잘 맞는다.' },
    ],
    gallery: [
      { ratio: 'landscape', title: { zh: '先看廊道串联', en: 'Begin with the corridor sequence', ja: 'まず回廊の連なりを見る', ko: '먼저 회랑의 연결을 본다' }, caption: { zh: '不要急着停，先让曲廊把空间关系连成一句完整的话。', en: 'Do not stop too soon. Let the winding corridor connect the spaces into one complete sentence.', ja: 'すぐに立ち止まらず、まずは曲廊に空間の関係を一続きの文としてつないでもらう。', ko: '너무 빨리 멈추지 말고, 먼저 굽은 회랑이 공간 관계를 하나의 문장처럼 이어 주게 한다.' }, src: resolveGardenGalleryImage(slug, 0, 'https://images.unsplash.com/photo-1771937820345-6aced121dba7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2200&dpr=2&auto=format') },
      { ratio: 'tall', title: { zh: '门洞像取景器', en: 'Gateways Work Like Viewfinders', ja: '門洞はファインダーのよう', ko: '문은 뷰파인더처럼 작동한다' }, caption: { zh: '月洞门与漏窗，是留园最会“裁切景色”的地方。', en: 'Moon gates and lattice windows are where the garden cuts and frames its scenes most precisely.', ja: '月洞門や漏窓は、留園がもっとも巧みに景色を切り取る場所だ。', ko: '원문과 투창은 유원이 가장 능숙하게 풍경을 잘라 내는 지점이다.' }, src: resolveGardenGalleryImage(slug, 1, 'https://images.unsplash.com/photo-1555217851-6141535bd771?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600&dpr=2&auto=format') },
      { ratio: 'panorama', title: { zh: '厅堂与庭院互借', en: 'Halls and Courtyards Borrow from Each Other', ja: '広間と庭が互いに借景する', ko: '전각과 뜰이 서로 차경한다' }, caption: { zh: '内外相看，柱子、窗棂和门框本身也成了景。', en: 'Inside and outside gaze at each other, and columns, lattice, and frames become scenery themselves.', ja: '内と外が互いに見合い、柱や窓棂、門枠そのものが景色になっていく。', ko: '안과 밖이 서로를 바라보며 기둥과 창살, 문틀 자체가 풍경이 된다.' }, src: resolveGardenGalleryImage(slug, 2, 'https://images.unsplash.com/photo-1530789253388-582c481c54b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2200&dpr=2&auto=format') },
      { ratio: 'portrait', title: { zh: '山石藏在转角', en: 'Rocks Hide Around the Turn', ja: '石組は曲がり角に潜む', ko: '괴석은 모퉁이에 숨어 있다' }, caption: { zh: '别只盯着中轴，侧边与角落往往更有味道。', en: 'Do not stare only at the main axis. Side spaces and corners often have more character.', ja: '中軸だけを追わず、脇や角へ入るほうが味わい深いことが多い。', ko: '중심 축만 보지 말고 옆 공간과 모서리로 가야 더 깊은 맛이 난다.' }, src: resolveGardenGalleryImage(slug, 3, 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1500&dpr=2&auto=format') },
    ],
    relatedGardens: [
      { kicker: { zh: '前一站', en: 'Previous Stop', ja: '前の一園', ko: '이전 정원' }, label: { zh: '拙政园', en: 'Humble Administrator\'s Garden', ja: '拙政園', ko: '졸정원' }, description: { zh: '如果想先从更开阔的水院视野入门，可以回看拙政园。', en: 'If you want to begin again from a broader water-court perspective, go back to Humble Administrator\'s Garden.', ja: 'よりひらけた水庭の視野から入りたいなら、拙政園へ戻るのがよい。', ko: '더 넓은 수원 시야에서 다시 시작하고 싶다면 졸정원으로 돌아가면 된다.' }, href: '/zhuozheng' },
      { kicker: { zh: '下一站', en: 'Next Stop', ja: '次の一園', ko: '다음 정원' }, label: { zh: '网师园', en: 'Master of Nets Garden', ja: '網師園', ko: '망사원' }, description: { zh: '想继续体验更小尺度、更安静的空间氛围，可以接着看网师园。', en: 'For a smaller scale and a quieter atmosphere, continue to Master of Nets Garden.', ja: 'より小さな尺度と静かな空気へ進みたいなら、次は網師園がよい。', ko: '더 작은 스케일과 조용한 분위기를 원한다면 망사원으로 이어 가면 된다.' }, href: '/wangshi' },
      { kicker: { zh: '回到首页', en: 'Back to the Main Page', ja: 'トップへ戻る', ko: '메인으로 돌아가기' }, label: { zh: '继续浏览主页面', en: 'Continue Browsing the Home Page', ja: 'トップページを続けて見る', ko: '메인 페이지 계속 보기' }, description: { zh: '返回首页查看更多路线、札记与服务功能。', en: 'Go back to the home page for more routes, notes, and tools.', ja: 'トップへ戻れば、ほかのルートやノート、機能も続けて見られる。', ko: '메인 페이지로 돌아가면 다른 루트와 메모, 기능도 계속 볼 수 있다.' }, href: '/' },
    ],
    nextGarden: {
      label: { zh: '网师园', en: 'Master of Nets Garden', ja: '網師園', ko: '망사원' },
      href: '/wangshi',
    },
  };
}

function buildWangshiyuan() {
  const slug = 'wangshiyuan';

  return {
    kicker: {
      zh: '小中见大的代表',
      en: 'Small in Scale, Vast in Feeling',
      ja: '小にして大を見せる庭',
      ko: '작지만 깊은 울림의 정원',
    },
    name: {
      zh: '网师园',
      en: 'Master of Nets Garden',
      ja: '網師園',
      ko: '망사원',
    },
    englishName: 'The Master of Nets Garden',
    intro: {
      zh: '网师园的尺度更亲近，也更安静。它适合在走完大园之后再来看，你会明显感受到“小中见大”的精妙，以及建筑细部带来的诗意。',
      en: 'Master of Nets Garden feels more intimate and more silent. It works best after the larger gardens, when you can appreciate how a compact scale still carries depth and poetry.',
      ja: '網師園はより親密で、より静かな庭だ。大きな庭を見たあとに来ると、小さな尺度の中でどう深さと詩情が生まれるかがはっきり感じられる。',
      ko: '망사원은 더 가까운 스케일과 더 조용한 분위기를 가진 정원이다. 큰 정원을 본 뒤에 오면 작은 공간 안에서 어떻게 깊이와 시성이 만들어지는지 더 분명하게 느낄 수 있다.',
    },
    heroImage: resolveGardenHeroImage(
      slug,
      'https://images.unsplash.com/photo-1697832245666-78c870b29813?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600&dpr=2&auto=format',
    ),
    heroAlt: {
      zh: '网师园园林景观',
      en: 'View of Master of Nets Garden',
      ja: '網師園の景観',
      ko: '망사원 풍경',
    },
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
      heroQuote: {
        zh: '小处更静，静处更深。',
        en: 'The smaller the place, the deeper the quiet.',
        ja: '小さな場所ほど静かで、静かな場所ほど深い。',
        ko: '작은 곳일수록 더 고요하고, 고요한 곳일수록 더 깊다.',
      },
      heroCaption: {
        zh: '把大园的喧闹放下，网师园会用更克制的尺度把你带回自己。',
        en: 'Set down the noise of the larger gardens and this restrained scale will bring you back to yourself.',
        ja: '大きな庭のにぎわいを手放すと、網師園はより抑えた尺度で自分自身の感覚へ戻してくれる。',
        ko: '큰 정원의 소란을 내려놓으면 망사원은 더 절제된 스케일로 당신을 자신에게 돌려보낸다.',
      },
      galleryTitle: {
        zh: '横向展开：夜游的余韵',
        en: 'Unfolded Sideways: The Aftertone of an Evening Visit',
        ja: '横にひらく、夜の余韻',
        ko: '가로로 펼치는 밤 산책의 여운',
      },
      galleryIntro: {
        zh: '这卷画更像低声讲述：不要滑得太快，让每张卡片之间留下呼吸的空隙。',
        en: 'This sequence feels like a quiet telling. Do not scroll too quickly; leave space to breathe between each scene.',
        ja: 'この画巻はささやくように進む。速く滑らず、カードとカードのあいだに呼吸の余白を残したい。',
        ko: '이 장면들은 낮은 목소리로 이어진다. 너무 빨리 넘기지 말고 카드 사이에 숨 쉴 틈을 남긴다.',
      },
      highlightIntro: {
        zh: '它的精彩不靠“多”，而靠每一次裁切都刚刚好。',
        en: 'Its richness does not come from abundance, but from every cut and frame landing at exactly the right moment.',
        ja: 'この庭の魅力は「多さ」ではなく、切り取りの一つひとつがちょうどよく決まることにある。',
        ko: '이 정원의 매력은 많음이 아니라, 매 순간의 프레이밍이 정확히 맞아떨어지는 데 있다.',
      },
      stepperIntro: {
        zh: '先建立整体比例，再贴近细部，最后找一个角落把时间放慢。',
        en: 'First read the overall proportion, then move close to the details, and finally find a corner where time can slow down.',
        ja: 'まず全体の比率を読み、そのあと細部へ寄り、最後に時間をゆるめるための隅を見つける。',
        ko: '먼저 전체 비례를 읽고, 그다음 세부에 가까이 다가간 뒤, 마지막에는 시간을 늦출 수 있는 구석을 찾는다.',
      },
      tipsTitle: {
        zh: '静读网师园',
        en: 'Reading Master of Nets in Quiet',
        ja: '静かに読む網師園',
        ko: '고요하게 읽는 망사원',
      },
      tipsIntro: {
        zh: '留白不是空，是把情绪留出来。把速度降下来，才会听见园林的声音。',
        en: 'Empty space is not emptiness. It leaves room for feeling. Only when you slow down can you hear the garden.',
        ja: '余白は空白ではなく、感情の居場所を残すことだ。速度を落としてこそ、庭の声が聞こえてくる。',
        ko: '여백은 비어 있음이 아니라 감정을 남겨 두는 방식이다. 속도를 늦춰야만 정원의 소리가 들린다.',
      },
    },
    backHref: '/',
    panoramaHref: '/wangshi/panorama',
    badges: [
      { zh: '尺度亲近', en: 'Intimate scale', ja: '親密な尺度', ko: '친밀한 스케일' },
      { zh: '适合安静慢看', en: 'Best for quiet looking', ja: '静かにゆっくり見るのに向く', ko: '조용히 천천히 보기 좋음' },
      { zh: '细部很有味道', en: 'Rich in small details', ja: '細部に味わいがある', ko: '세부가 특히 좋다' },
    ],
    facts: [
      { label: { zh: '推荐停留', en: 'Suggested stay', ja: 'おすすめ滞在', ko: '추천 체류 시간' }, value: { zh: '1.5 - 2 小时', en: '1.5-2 hours', ja: '1.5-2時間', ko: '1.5-2시간' } },
      { label: { zh: '观看重点', en: 'Focus on', ja: '見るポイント', ko: '중점 감상' }, value: { zh: '建筑细部、夜游氛围', en: 'Architectural details and evening atmosphere', ja: '建築の細部と夜の気配', ko: '건축 세부와 저녁 분위기' } },
      { label: { zh: '最佳节奏', en: 'Best rhythm', ja: 'おすすめの時間帯', ko: '가장 좋은 시간대' }, value: { zh: '午后或傍晚更舒服', en: 'Most comfortable in the afternoon or dusk', ja: '午後から夕方が心地よい', ko: '오후나 해질 무렵이 가장 좋다' } },
      { label: { zh: '适合人群', en: 'Best for', ja: '向いている人', ko: '추천 대상' }, value: { zh: '喜欢静谧与细节', en: 'People who love quiet and detail', ja: '静けさと細部が好きな人', ko: '고요함과 디테일을 좋아하는 사람' } },
    ],
    highlights: [
      { title: { zh: '尺度不大，但景深丰富', en: 'Small in size, rich in depth', ja: '小さいが奥行きが深い', ko: '규모는 작지만 깊이는 풍부하다' }, description: { zh: '网师园非常适合细看。它的精彩并不靠“大”，而是靠每一个视角都经过收放与裁切，层层往里递进。', en: 'This garden rewards close looking. Its power does not come from size but from carefully compressed and released viewpoints.', ja: '網師園は細かく見るほどおもしろい。大きさではなく、視点ごとの収まりとひらきが丁寧に調整されていることで奥行きが生まれている。', ko: '망사원은 자세히 볼수록 더 좋다. 크기보다 시점마다 조이고 푸는 조절이 정교해서 깊이가 생긴다.' } },
      { title: { zh: '建筑细部更容易被看见', en: 'Architectural details come into focus', ja: '建築の細部が見えやすい', ko: '건축 세부가 더 잘 보인다' }, description: { zh: '在较亲近的尺度里，砖雕、漏窗、匾额、栏杆与屋檐之间的关系会更清楚，也更容易进入情绪。', en: 'At this closer scale, brick carving, lattice openings, plaques, railings, and eaves become easier to read and easier to feel.', ja: 'より親密な尺度の中では、煉瓦彫刻や漏窓、額、手すり、軒の関係が見えやすく、感情も入り込みやすい。', ko: '더 가까운 스케일 안에서는 벽돌 조각과 투창, 편액, 난간, 처마의 관계가 더 선명해지고 감정도 쉽게 스며든다.' } },
      { title: { zh: '氛围含蓄，适合慢下来', en: 'Its atmosphere is restrained and asks you to slow down', ja: '空気が控えめで、ゆっくり見るのに向く', ko: '분위기가 절제되어 천천히 보기에 좋다' }, description: { zh: '如果你更喜欢安静的园林体验，网师园往往会留下很深印象，尤其适合在下午或夜色里停留。', en: 'If you prefer quieter garden experiences, this one often stays with you the longest, especially in the late afternoon or evening.', ja: '静かな庭園体験が好きなら、網師園は特に強い印象を残す。午後や夜の気配の中でいっそう魅力が深まる。', ko: '조용한 정원 경험을 좋아한다면 망사원은 특히 오래 남는 인상을 준다. 오후나 저녁의 공기 속에서 더 깊어진다.' } },
    ],
    itinerary: [
      { title: { zh: '第一段：先走主空间建立比例感', en: 'First: read the main space and its proportions', ja: '第一段階：主空間で比率をつかむ', ko: '첫 단계: 주공간에서 비례를 잡기' }, description: { zh: '先感受整体尺度，你会更快理解为什么这座园林能在有限空间里做出丰富层次。', en: 'Feel the overall scale first and you will quickly understand how this garden creates richness within a limited footprint.', ja: 'まず全体の尺度を感じると、この庭が限られた空間の中でどう層を生んでいるかが見えてくる。', ko: '먼저 전체 스케일을 느끼면 제한된 공간 안에서 어떻게 풍부한 층위를 만드는지 더 빨리 이해할 수 있다.' } },
      { title: { zh: '第二段：贴近建筑细部观察', en: 'Second: move close to the architectural details', ja: '第二段階：建築細部に寄る', ko: '두 번째: 건축 세부에 가까이 다가가기' }, description: { zh: '可以有意识地看窗棂、栏杆、匾额与檐口，它们是网师园气质的重要来源。', en: 'Look deliberately at lattice bars, railings, plaques, and eaves. They are essential to the garden\'s character.', ja: '窓棂や手すり、額、軒先を意識して見ると、網師園の気配がどこから生まれているかが見えてくる。', ko: '창살과 난간, 편액, 처마 끝을 의식해서 보면 망사원의 분위기가 어디서 오는지 보이기 시작한다.' } },
      { title: { zh: '第三段：找一个安静角落停留', en: 'Third: stay in a quiet corner', ja: '第三段階：静かな隅にとどまる', ko: '세 번째: 조용한 구석에 머무르기' }, description: { zh: '试着坐一会儿、站一会儿，不急着赶路，网师园的魅力常常在停顿中出现。', en: 'Sit for a while or simply stand still. Much of the garden\'s appeal appears only in the pause.', ja: '少し座るか、ただ立ち止まってみる。網師園の魅力は、急がずにとどまった時間の中で現れることが多い。', ko: '잠시 앉아 있거나 그냥 서 있어 보자. 망사원의 매력은 서두르지 않고 멈춘 시간 속에서 자주 드러난다.' } },
    ],
    tips: [
      { zh: '如果当天安排了多座园林，建议把网师园放在后半程，心会更静。', en: 'If you are visiting several gardens in one day, place Master of Nets later in the route for a calmer state of mind.', ja: '一日に複数の庭園を見るなら、網師園は後半に置くと心がより静まりやすい。', ko: '하루에 여러 정원을 본다면 망사원은 후반부에 두는 편이 마음이 더 차분해진다.' },
      { zh: '这里很适合观察“少即是多”的空间表达，不需要追求一次看完所有角落。', en: 'This is a good place to observe how less can mean more. There is no need to force every corner into one visit.', ja: 'ここでは「少ないこと」が「豊かさ」になる空間表現を見たい。一度で隅々まで見ようとしなくてよい。', ko: '이곳은 적음이 곧 풍부함이 되는 공간 표현을 보기 좋은 곳이다. 한 번에 모든 구석을 다 보려 하지 않아도 된다.' },
      { zh: '遇到人少的时候，尽量多停留片刻，体验空间氛围比匆匆拍照更值得。', en: 'When the crowd thins out, stay a little longer. Feeling the space is worth more than rushing through photos.', ja: '人が少ない時間に少し長くとどまるほうが、急いで写真を撮るよりずっと価値がある。', ko: '사람이 적을 때 조금 더 오래 머무는 편이 서둘러 사진만 찍는 것보다 훨씬 값지다.' },
    ],
    gallery: [
      { ratio: 'portrait', title: { zh: '一隅的光', en: 'Light in One Corner', ja: '一隅の光', ko: '한 구석의 빛' }, caption: { zh: '图片收在一角，留白让尺度变得更深。', en: 'The image gathers into one corner, and the empty space makes the scale feel deeper.', ja: '像が一隅に収まり、余白が尺度の深さを強めている。', ko: '이미지가 한쪽에 모이고 여백이 스케일의 깊이를 더한다.' }, src: resolveGardenGalleryImage(slug, 0, 'https://images.unsplash.com/photo-1697832245666-78c870b29813?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1800&dpr=2&auto=format') },
      { ratio: 'square', title: { zh: '窗棂的节奏', en: 'The Rhythm of Lattice and Frame', ja: '窓棂のリズム', ko: '창살의 리듬' }, caption: { zh: '靠近砖雕、漏窗和栏杆，气质会变得很具体。', en: 'Move closer to carving, lattice, and railing, and the character becomes tangible.', ja: '煉瓦彫刻や漏窓、手すりに寄ると、この庭の気配がとても具体的になる。', ko: '벽돌 조각과 투창, 난간에 가까이 가면 이 정원의 분위기가 아주 구체적으로 느껴진다.' }, src: resolveGardenGalleryImage(slug, 1, 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1500&dpr=2&auto=format') },
      { ratio: 'landscape', title: { zh: '水面低声', en: 'Low Water, Quiet Voice', ja: '水面の低い声', ko: '낮은 물소리' }, caption: { zh: '小水面不喧哗，但每一次倒影都在替你留住时间。', en: 'The smaller water surface is quiet, yet every reflection seems to hold time in place.', ja: '小さな水面は騒がしくないが、その反射のたびに時間を留めてくれる。', ko: '작은 수면은 소란스럽지 않지만, 반영 하나하나가 시간을 붙잡아 둔다.' }, src: resolveGardenGalleryImage(slug, 2, 'https://images.unsplash.com/photo-1526481280695-3c687fd643ed?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2000&dpr=2&auto=format') },
      { ratio: 'tall', title: { zh: '朱砂一点', en: 'A Touch of Cinnabar', ja: '朱砂の一点', ko: '한 점의 주사빛' }, caption: { zh: '极少量的红，让水墨更显安静。', en: 'A very small touch of red makes the ink-like quiet feel even deeper.', ja: 'ごく少ない赤があることで、水墨の静けさがいっそう際立つ。', ko: '아주 적은 붉은색이 오히려 수묵 같은 고요함을 더 깊게 만든다.' }, src: resolveGardenGalleryImage(slug, 3, 'https://images.unsplash.com/photo-1548013146-72479768bada?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1400&dpr=2&auto=format') },
    ],
    relatedGardens: [
      { kicker: { zh: '回看开阔视野', en: 'Back to a Wider View', ja: 'ひらけた視野へ戻る', ko: '넓은 시야로 돌아가기' }, label: { zh: '拙政园', en: 'Humble Administrator\'s Garden', ja: '拙政園', ko: '졸정원' }, description: { zh: '想重新回到更舒展的水院空间，可以切换到拙政园详情。', en: 'If you want to return to a broader water-court space, switch back to Humble Administrator\'s Garden.', ja: 'よりのびやかな水庭の空間へ戻りたいなら、拙政園の詳細へ切り替えるとよい。', ko: '더 넓고 시원한 수원 공간으로 돌아가고 싶다면 졸정원 상세로 이동하면 된다.' }, href: '/zhuozheng' },
      { kicker: { zh: '继续看层层框景', en: 'Continue with Layered Frames', ja: '層をなすフレーム景へ', ko: '겹겹의 프레임 풍경으로 이어 가기' }, label: { zh: '留园', en: 'Lingering Garden', ja: '留園', ko: '유원' }, description: { zh: '如果你更喜欢连续廊道与转折叙事，可以继续看留园。', en: 'If you prefer corridor sequences and richer transitions, continue to Lingering Garden.', ja: '連続する回廊と折れの物語が好きなら、次は留園がよく似合う。', ko: '연속적인 회랑과 더 강한 전환을 선호한다면 유원으로 이어 가면 좋다.' }, href: '/liu' },
      { kicker: { zh: '回到首页', en: 'Back to the Main Page', ja: 'トップへ戻る', ko: '메인으로 돌아가기' }, label: { zh: '继续浏览主页面', en: 'Continue Browsing the Home Page', ja: 'トップページを続けて見る', ko: '메인 페이지 계속 보기' }, description: { zh: '返回首页后，可以继续查看路线推荐和园林札记。', en: 'Back on the home page, you can continue with route suggestions and garden notes.', ja: 'トップへ戻れば、ルート提案や庭園ノートを続けて見られる。', ko: '메인 페이지로 돌아가면 추천 동선과 정원 메모를 계속 볼 수 있다.' }, href: '/' },
    ],
    nextGarden: {
      label: { zh: '拙政园', en: 'Humble Administrator\'s Garden', ja: '拙政園', ko: '졸정원' },
      href: '/zhuozheng',
    },
  };
}

export const gardenDetailsSource = {
  zhuozhengyuan: buildZhuozhengyuan(),
  liuyuan: buildLiuyuan(),
  wangshiyuan: buildWangshiyuan(),
};
