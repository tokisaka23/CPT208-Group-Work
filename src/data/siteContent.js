import { computed } from 'vue';
import { currentLanguage, resolveLocalized } from '../i18n';
import kunquMuseumImage from '../assets/kunqu-museum.jpg';
import { resolveGardenCardImage, resolveGardenGalleryImage } from './gardenImages';

const siteContentSource = {
  featuredGardens: [
    {
      slug: 'zhuozhengyuan',
      dynasty: {
        zh: '明代名园',
        en: 'Ming Dynasty Garden',
        ja: '明代の名園',
        ko: '명대의 대표 정원',
      },
      tag: {
        zh: '世界文化遗产',
        en: 'UNESCO Heritage',
        ja: '世界文化遺産',
        ko: '세계문화유산',
      },
      name: {
        zh: '拙政园',
        en: 'Humble Administrator\'s Garden',
        ja: '拙政園',
        ko: '졸정원',
      },
      location: {
        zh: '苏州 · 姑苏区',
        en: 'Suzhou · Gusu District',
        ja: '蘇州・姑蘇区',
        ko: '쑤저우 · 구쑤구',
      },
      distance: {
        zh: '📍 距主街 50米',
        en: '📍 50 m from the main street',
        ja: '📍 メインストリートから 50m',
        ko: '📍 메인 거리에서 50m',
      },
      rating: '4.9',
      description: {
        zh: '以水为脉、以亭为骨，园内形成“虽由人作，宛自天开”的经典空间秩序。',
        en: 'Water is the thread and pavilions are the structure, creating a layout that feels shaped by nature itself.',
        ja: '水を軸に亭を骨格として、人工でありながら自然に開けたような空間秩序をつくり出している。',
        ko: '물을 맥으로, 정자를 뼈대로 삼아 인공이지만 자연처럼 열린 공간 질서를 만든다.',
      },
      path: '/zhuozheng',
      image: resolveGardenCardImage(
        'zhuozhengyuan',
        'https://images.unsplash.com/photo-1611288618898-e2a93f848cf6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600&dpr=2&auto=format',
      ),
    },
    {
      slug: 'liuyuan',
      dynasty: {
        zh: '清代宅园',
        en: 'Qing Residence Garden',
        ja: '清代の邸宅庭園',
        ko: '청대 주거 정원',
      },
      tag: {
        zh: '空间曲折精巧',
        en: 'Layered Spatial Turns',
        ja: '曲折する巧みな空間',
        ko: '정교한 공간 전환',
      },
      name: {
        zh: '留园',
        en: 'Lingering Garden',
        ja: '留園',
        ko: '유원',
      },
      location: {
        zh: '苏州 · 姑苏区',
        en: 'Suzhou · Gusu District',
        ja: '蘇州・姑蘇区',
        ko: '쑤저우 · 구쑤구',
      },
      distance: {
        zh: '📍 距主街 900米',
        en: '📍 900 m from the main street',
        ja: '📍 メインストリートから 900m',
        ko: '📍 메인 거리에서 900m',
      },
      rating: '4.8',
      description: {
        zh: '长廊串联山水、厅堂与花木，节奏舒展，层次细腻，是“移步换景”的代表。',
        en: 'Long corridors link rockery, halls, and plantings into a refined sequence of changing views.',
        ja: '長い回廊が山水・広間・草木をつなぎ、歩くたびに景色が切り替わる繊細なリズムをつくる。',
        ko: '긴 회랑이 산수와 전각, 화목을 연결하며 걸을 때마다 풍경이 바뀌는 리듬을 만든다.',
      },
      path: '/liu',
      gallery: [0, 1, 2].map((index) => resolveGardenGalleryImage('liuyuan', index)),
      image: resolveGardenCardImage(
        'liuyuan',
        'https://images.unsplash.com/photo-1771937820345-6aced121dba7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600&dpr=2&auto=format',
      ),
    },
    {
      slug: 'wangshiyuan',
      dynasty: {
        zh: '宋韵遗意',
        en: 'Song-Era Elegance',
        ja: '宋の余韻',
        ko: '송풍의 여운',
      },
      tag: {
        zh: '小中见大',
        en: 'Small Yet Vast',
        ja: '小にして大を見せる',
        ko: '작지만 깊은 정원',
      },
      name: {
        zh: '网师园',
        en: 'Master of Nets Garden',
        ja: '網師園',
        ko: '망사원',
      },
      location: {
        zh: '苏州 · 姑苏区',
        en: 'Suzhou · Gusu District',
        ja: '蘇州・姑蘇区',
        ko: '쑤저우 · 구쑤구',
      },
      distance: {
        zh: '📍 距主街 650米',
        en: '📍 650 m from the main street',
        ja: '📍 メインストリートから 650m',
        ko: '📍 메인 거리에서 650m',
      },
      rating: '4.9',
      description: {
        zh: '以紧凑尺度营造出丰富景深，夜游时更显静谧含蓄，极具东方诗性。',
        en: 'Its compact scale creates surprising depth, and the garden feels especially poetic in the evening.',
        ja: '凝縮された尺度の中に深い景行きをつくり、夜にはより静かで詩的な表情を見せる。',
        ko: '압축된 규모 안에서 깊은 공간감을 만들고, 저녁에는 더욱 고요하고 시적인 분위기를 준다.',
      },
      path: '/wangshi',
      gallery: [0, 1, 2, 3].map((index) => resolveGardenGalleryImage('wangshiyuan', index)),
      image: resolveGardenCardImage(
        'wangshiyuan',
        'https://images.unsplash.com/photo-1697832245666-78c870b29813?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600&dpr=2&auto=format',
      ),
    },
  ],
  museumsData: [
    {
      name: {
        zh: '苏州博物馆',
        en: 'Suzhou Museum',
        ja: '蘇州博物館',
        ko: '쑤저우 박물관',
      },
      category: {
        zh: '建筑与文物',
        en: 'Architecture & Relics',
        ja: '建築と文物',
        ko: '건축과 유물',
      },
      distance: {
        zh: '📍 距平江路步行约 12 分钟',
        en: '📍 About 12 minutes on foot from Pingjiang Road',
        ja: '📍 平江路から徒歩約12分',
        ko: '📍 평강로에서 도보 약 12분',
      },
      objectPosition: '62% center',
      description: {
        zh: '从平江路转入东北街，贝聿铭以白墙、片石、水院和光影重构了现代语境下的苏州气质，适合与园林一并观看。',
        en: 'Turning off Pingjiang Road into Northeast Street, you enter a museum where I. M. Pei reinterprets Suzhou through white walls, water courts, and light.',
        ja: '平江路から東北街へ入ると、白壁・石・水庭・光によって現代の文脈で蘇州らしさを再構成した空間に出会う。',
        ko: '평강로에서 동북가로 접어들면, 백벽과 수원, 돌과 빛으로 현대적으로 재해석한 쑤저우의 분위기를 만날 수 있다.',
      },
      detail: {
        zh: '馆内既有吴地书画、瓷器、工艺等常设展陈，也有非常适合慢慢停留的庭院与连桥空间。它不是一座只看建筑外观的博物馆，而是把“现代设计语言”与“苏州传统审美”真正融合在了一起。',
        en: 'Beyond its architecture, the museum holds painting, ceramics, and craft collections, with courtyards and bridges that invite you to linger.',
        ja: '館内には書画・陶磁・工芸の展示があり、庭や回廊の余白も豊かで、建築と伝統美意識が自然に溶け合っている。',
        ko: '서화와 도자, 공예 전시뿐 아니라 천천히 머물기 좋은 중정과 연결 공간이 있어 건축과 전통 미감이 자연스럽게 이어진다.',
      },
      highlights: [
        {
          zh: '先看中庭与几何屋顶的明暗关系',
          en: 'Start with the atrium and the rhythm of the geometric roof',
          ja: 'まずは中庭と幾何学的な屋根の光と影を見る',
          ko: '먼저 중정과 기하학적 지붕의 빛과 그림자를 본다',
        },
        {
          zh: '再进馆读吴地文物，形成“街巷—园林—文博”的完整脉络',
          en: 'Then move into the galleries to connect street, garden, and museum',
          ja: 'その後展示へ進み、街路・庭園・博物館の流れをつなげる',
          ko: '그다음 전시실로 들어가 거리와 정원, 박물관의 흐름을 이어 본다',
        },
        {
          zh: '若时间充裕，可连同忠王府片区一起看，会更容易理解苏州城市文脉',
          en: 'If you have time, add the Zhongwangfu complex for more urban context',
          ja: '時間があれば忠王府エリアも合わせて見ると都市文脈がつかみやすい',
          ko: '시간이 여유롭다면 충왕부 구역까지 함께 보면 도시 맥락이 더 잘 보인다',
        },
      ],
      image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Suzhou%20Museum%20%281%29.jpg',
    },
    {
      name: {
        zh: '昆曲博物馆',
        en: 'Kunqu Museum',
        ja: '昆曲博物館',
        ko: '곤곡 박물관',
      },
      category: {
        zh: '戏曲与声腔',
        en: 'Opera & Voice',
        ja: '戯曲と声',
        ko: '희곡과 성음',
      },
      distance: {
        zh: '📍 距主街支巷即达',
        en: '📍 Just inside a side lane off the main street',
        ja: '📍 メインストリート脇の路地ですぐ',
        ko: '📍 메인 거리 옆 골목으로 바로 연결',
      },
      objectPosition: 'center 44%',
      description: {
        zh: '从平江路的水岸转入旧宅深处，展陈、戏台与曲谱共同把昆曲的身段、唱腔与江南生活连接起来。',
        en: 'From the canal edge you step into an old residence where stage, costume, and score unfold the world of Kunqu.',
        ja: '水辺から旧宅の奥へ入ると、展示・舞台・曲譜が昆曲の所作と声を江南の暮らしにつなげていく。',
        ko: '운하 옆에서 옛 저택 깊숙이 들어가면 전시와 무대, 악보가 곤곡의 몸짓과 창법을 강남의 생활과 연결해 준다.',
      },
      detail: {
        zh: '这座馆更适合带着“听”的心情去看：服饰、道具、唱词、乐器和舞台空间会一点点把昆曲的节奏展开。相比单纯打卡拍照，它更像是平江路声景体验的一次延伸。',
        en: 'This museum works best when you visit with your ears open. Costumes, props, lyrics, and instruments slowly reveal the rhythm of Kunqu.',
        ja: 'この館は「聴く」気分で歩くのが似合う。衣装や道具、詞章や楽器が少しずつ昆曲のテンポを立ち上げていく。',
        ko: '이곳은 듣는 마음으로 보는 편이 좋다. 의상과 소도구, 창사와 악기가 곤곡의 리듬을 천천히 펼쳐 준다.',
      },
      highlights: [
        {
          zh: '白天可看展陈与旧戏台空间',
          en: 'Visit by day for the exhibition and the old stage setting',
          ja: '昼は展示と旧舞台の空間を見る',
          ko: '낮에는 전시와 옛 무대 공간을 본다',
        },
        {
          zh: '留意戏服纹样、道具与唱本细节，会比匆匆走过更有意思',
          en: 'Slow down for costume patterns, props, and librettos',
          ja: '衣装の文様や道具、唱本の細部に注目すると面白い',
          ko: '의상 문양과 소도구, 대본의 세부를 천천히 보면 더 재미있다',
        },
        {
          zh: '夜晚可衔接评弹、昆曲演出，把街区声景听完整',
          en: 'At night, continue into live storytelling or Kunqu performances',
          ja: '夜は評弾や昆曲公演へつなげると街の音風景が完成する',
          ko: '밤에는 평탄이나 곤곡 공연으로 이어가면 거리의 소리 풍경이 완성된다',
        },
      ],
      image: kunquMuseumImage,
      fallbackImage: kunquMuseumImage,
    },
  ],
  heritageData: [
    {
      name: {
        zh: '苏式汤面',
        en: 'Suzhou-Style Noodles',
        ja: '蘇州式湯麺',
        ko: '쑤저우식 탕면',
      },
      category: {
        zh: '晨起一碗',
        en: 'A Morning Bowl',
        ja: '朝の一杯',
        ko: '아침 한 그릇',
      },
      distance: {
        zh: '距主街 30米',
        en: '30 m from the main street',
        ja: 'メインストリートから30m',
        ko: '메인 거리에서 30m',
      },
      description: {
        zh: '白汤清亮、细面利落，浇头和汤头各有讲究，是进入平江路日常节奏最快的方式。',
        en: 'Clear broth and fine noodles make this the quickest way to settle into Pingjiang Road\'s daily rhythm.',
        ja: '澄んだスープと細麺の一杯は、平江路の日常のテンポへ最短で入っていける朝の入口になる。',
        ko: '맑은 국물과 가는 면 한 그릇은 평강로의 일상 리듬으로 가장 빠르게 들어가는 방법이다.',
      },
      image:
        'https://images.unsplash.com/photo-1617093727343-374698b1b08d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900&dpr=2&auto=format',
    },
    {
      name: {
        zh: '评弹',
        en: 'Pingtan',
        ja: '評弾',
        ko: '평탄',
      },
      category: {
        zh: '吴侬软语',
        en: 'Soft Wu Voices',
        ja: 'やわらかな呉語',
        ko: '부드러운 오어',
      },
      distance: {
        zh: '距主街 80米',
        en: '80 m from the main street',
        ja: 'メインストリートから80m',
        ko: '메인 거리에서 80m',
      },
      description: {
        zh: '一桌一椅、一弦一拍，在书场里把平江路的水声、人声与故事声慢慢叠在一起。',
        en: 'In a small storytelling hall, strings, voices, and stories layer together with the sounds of the canal.',
        ja: '書場では一卓一椅、一弦一拍の中に水音・人声・物語が静かに重なっていく。',
        ko: '서장에서 한 줄의 현과 한 장단 위로 물소리와 사람 목소리, 이야기가 천천히 겹쳐진다.',
      },
      image:
        'https://images.unsplash.com/photo-1516280440614-37939bbacd81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900&dpr=2&auto=format',
    },
    {
      name: {
        zh: '宋锦',
        en: 'Song Brocade',
        ja: '宋錦',
        ko: '송금',
      },
      category: {
        zh: '织造非遗',
        en: 'Textile Heritage',
        ja: '織物の無形遺産',
        ko: '직조 무형유산',
      },
      distance: {
        zh: '距主街 120米',
        en: '120 m from the main street',
        ja: 'メインストリートから120m',
        ko: '메인 거리에서 120m',
      },
      description: {
        zh: '纹样细密、色阶温润，把江南审美织进衣料与器物，也让平江路的手作气息更具体可见。',
        en: 'Delicate patterns and gentle colors weave Jiangnan aesthetics into cloth and everyday objects.',
        ja: '緻密な文様とやわらかな色の重なりが、江南の美意識を布や器に織り込んでいる。',
        ko: '섬세한 문양과 부드러운 색층이 강남의 미감을 직물과 기물 속에 직조해 넣는다.',
      },
      image:
        'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900&dpr=2&auto=format',
    },
  ],
  chapterCards: [
    {
      title: {
        zh: '古典园林',
        en: 'Classical Gardens',
        ja: '古典庭園',
        ko: '고전 정원',
      },
      eyebrow: 'Garden Route',
      badge: {
        zh: '青瓷绿',
        en: 'Celadon Green',
        ja: '青磁の緑',
        ko: '청자빛 녹색',
      },
      subtitle: {
        zh: '在花窗与水院之间读懂苏州的静',
        en: 'Read Suzhou\'s quiet spirit through windows, corridors, and water courts.',
        ja: '花窓と水庭のあいだで蘇州の静けさを読み取る。',
        ko: '화창과 수원 사이에서 쑤저우의 고요함을 읽어낸다.',
      },
      meta: [
        { zh: '框景', en: 'Framed Views', ja: '借景のフレーム', ko: '프레임 풍경' },
        { zh: '回廊', en: 'Corridors', ja: '回廊', ko: '회랑' },
        { zh: '移步换景', en: 'Changing Views', ja: '移動するたびに変わる景', ko: '걸음마다 바뀌는 풍경' },
      ],
      description: {
        zh: '从拙政园、留园到网师园，建立一条由开阔到幽深、由大景到细部的观看路径。',
        en: 'Move from expansive water courts to tighter, deeper scenes through Suzhou\'s three signature gardens.',
        ja: '拙政園・留園・網師園へと進みながら、開放から幽深へ、大景から細部へと見る道筋をつくる。',
        ko: '졸정원에서 유원, 망사원으로 이어지며 넓은 풍경에서 깊은 세부로 들어가는 관람 흐름을 만든다.',
      },
      image: resolveGardenCardImage(
        'zhuozhengyuan',
        'https://images.unsplash.com/photo-1611288618898-e2a93f848cf6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600&dpr=2&auto=format',
      ),
      to: '/gardens',
      actionLabel: {
        zh: '步入园林',
        en: 'Enter the Gardens',
        ja: '庭園へ入る',
        ko: '정원으로 이동',
      },
    },
    {
      title: {
        zh: '文博殿堂',
        en: 'Museums',
        ja: '博物館と文化',
        ko: '박물관과 문화',
      },
      eyebrow: 'Museum Route',
      badge: {
        zh: '朱砂红',
        en: 'Cinnabar Red',
        ja: '朱砂の赤',
        ko: '주사빛 붉은색',
      },
      subtitle: {
        zh: '让建筑、器物与戏曲把城市讲得更厚重',
        en: 'Let architecture, objects, and opera tell the city with more depth.',
        ja: '建築・器物・戯曲が都市の厚みを語ってくれる。',
        ko: '건축과 유물, 희곡이 도시를 더 깊게 설명한다.',
      },
      meta: [
        { zh: '建筑', en: 'Architecture', ja: '建築', ko: '건축' },
        { zh: '文物', en: 'Relics', ja: '文物', ko: '유물' },
        { zh: '声景', en: 'Soundscape', ja: '音風景', ko: '소리 풍경' },
      ],
      description: {
        zh: '从现代水院到旧宅戏台，在展厅与庭院的收放之间，慢慢读出苏州的文化肌理。',
        en: 'From modern courtyards to old stages, read Suzhou\'s cultural layers through exhibition rooms and transitional spaces.',
        ja: '現代の水庭から旧宅の舞台へ、展示室と中庭のあいだを行き来しながら蘇州の文化の肌理を読む。',
        ko: '현대적인 수원에서 옛 저택의 무대로 이동하며 전시실과 중정 사이에서 쑤저우의 문화 결을 읽는다.',
      },
      image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Suzhou%20Museum%20%281%29.jpg',
      to: '/museums',
      actionLabel: {
        zh: '步入文博',
        en: 'Enter the Museums',
        ja: '博物館へ入る',
        ko: '박물관으로 이동',
      },
    },
    {
      title: {
        zh: '非遗市井',
        en: 'Living Heritage',
        ja: '暮らしの無形遺産',
        ko: '생활 유산',
      },
      eyebrow: 'Heritage Route',
      badge: {
        zh: '烟火气',
        en: 'Street Warmth',
        ja: '暮らしの熱気',
        ko: '생활의 온기',
      },
      subtitle: {
        zh: '从一碗面、一段评弹进入苏州的热闹生活面',
        en: 'Enter Suzhou\'s lively daily life through noodles, storytelling, and craft.',
        ja: '一杯の麺と一曲の評弾から蘇州のにぎわいへ入っていく。',
        ko: '한 그릇의 면과 한 대목의 평탄으로 쑤저우의 활기찬 생활 속으로 들어간다.',
      },
      meta: [
        { zh: '吃', en: 'Eat', ja: '食べる', ko: '먹기' },
        { zh: '听', en: 'Listen', ja: '聴く', ko: '듣기' },
        { zh: '买', en: 'Bring Home', ja: '持ち帰る', ko: '사기' },
      ],
      description: {
        zh: '把主街、河埠与支巷串起来，体会最真实的平江路日常节奏与人间烟火。',
        en: 'Link the main street, canal edge, and side lanes to feel Pingjiang Road at its most lived-in.',
        ja: '大通りと河岸、路地をつないで歩き、平江路のもっとも日常的な温度を感じる。',
        ko: '큰 거리와 하안, 골목을 연결해 걸으며 평강로의 가장 현실적인 일상 온도를 느낀다.',
      },
      image:
        'https://images.unsplash.com/photo-1617093727343-374698b1b08d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900&dpr=2&auto=format',
      to: '/heritage',
      actionLabel: {
        zh: '步入市井',
        en: 'Enter the Street',
        ja: '町へ入る',
        ko: '골목으로 이동',
      },
    },
  ],
  pingjiangRhythms: [
    {
      title: {
        zh: '晨起看河埠',
        en: 'Morning by the Canal',
        ja: '朝の河岸を見る',
        ko: '아침의 하안을 보다',
      },
      text: {
        zh: '早些到达，听见洗帚、开铺、行人轻语，平江路一天的节奏会从水边慢慢醒来。',
        en: 'Arrive early and you will hear sweeping, shop doors, and low voices as the street wakes up beside the water.',
        ja: '早めに着けば、掃く音や店を開ける音、人の小さな話し声とともに一日のリズムが水辺から立ち上がる。',
        ko: '조금 일찍 도착하면 빗질 소리와 가게 문 여는 소리, 낮은 대화 속에서 하루의 리듬이 물가에서 깨어난다.',
      },
    },
    {
      title: {
        zh: '午后入园',
        en: 'Gardens in the Afternoon',
        ja: '午後に庭園へ',
        ko: '오후에 정원으로',
      },
      text: {
        zh: '把园林放在日光变柔的时候，白墙、花窗与树影的层次会更耐看，停留也更从容。',
        en: 'Visit the gardens when the light softens and the white walls, lattice windows, and tree shadows become more layered.',
        ja: '光がやわらぐ時間に庭園へ入ると、白壁や花窓、木影の層がより豊かに見えてくる。',
        ko: '빛이 부드러워지는 시간에 정원으로 들어가면 백벽과 창살, 나무 그림자의 층위가 더 잘 드러난다.',
      },
    },
    {
      title: {
        zh: '夜色听曲',
        en: 'Evening and Music',
        ja: '夜に曲を聴く',
        ko: '밤에 곡을 듣다',
      },
      text: {
        zh: '等到灯火与水面互相映照，再回到书场与小馆，平江路的“声景”会比白天更完整。',
        en: 'When lanterns begin to reflect on the water, return to the halls and small venues to hear the street in full.',
        ja: '灯りが水面に映る頃に書場や小さな館へ戻ると、平江路の音風景が昼よりも完成して聞こえる。',
        ko: '등불이 수면에 비칠 무렵 서장과 작은 공간으로 돌아가면 평강로의 소리 풍경이 낮보다 더 완전해진다.',
      },
    },
  ],
  heritageSteps: [
    {
      zh: '先吃一碗热面，把身体速度放下来。',
      en: 'Start with a hot bowl of noodles and let your pace slow down.',
      ja: 'まず温かい麺を一杯食べて、体のテンポを落とす。',
      ko: '먼저 따뜻한 면 한 그릇으로 몸의 속도를 낮춘다.',
    },
    {
      zh: '再拐进支巷听评弹，让耳朵接管节奏。',
      en: 'Then turn into a side lane for Pingtan and let your ears take over.',
      ja: '次に路地へ入って評弾を聴き、耳にリズムを委ねる。',
      ko: '그다음 골목으로 들어가 평탄을 들으며 귀가 리듬을 맡게 한다.',
    },
    {
      zh: '最后看手作与市集，把热闹收进可带走的器物里。',
      en: 'Finish with handmade goods and market stalls, taking some of that liveliness home with you.',
      ja: '最後に手仕事や市を見て、そのにぎわいを持ち帰れるものの中へ収める。',
      ko: '마지막에는 수공예와 시장을 보며 그 활기를 가져갈 수 있는 물건 속에 담는다.',
    },
  ],
};

export function useSiteContent() {
  const localized = computed(() => resolveLocalized(siteContentSource, currentLanguage.value));

  const featuredGardens = computed(() => localized.value.featuredGardens);
  const museumsData = computed(() => localized.value.museumsData);
  const heritageData = computed(() => localized.value.heritageData);

  const gardenCards = computed(() =>
    featuredGardens.value.map((garden) => ({
      title: garden.name,
      eyebrow: garden.dynasty,
      badge: garden.tag,
      subtitle: garden.location,
      meta: [
        garden.distance,
        currentLanguage.value === 'zh'
          ? `评分 ${garden.rating}`
          : currentLanguage.value === 'ja'
            ? `評価 ${garden.rating}`
            : currentLanguage.value === 'ko'
              ? `평점 ${garden.rating}`
              : `Rating ${garden.rating}`,
      ],
      description: garden.description,
      path: garden.path,
      image: garden.image,
      slug: garden.slug,
      gallery: garden.gallery,
    })),
  );

  const museumCards = computed(() =>
    museumsData.value.map((museum) => ({
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
    })),
  );

  const heritageCards = computed(() =>
    heritageData.value.map((moment) => ({
      title: moment.name,
      eyebrow: moment.category,
      badge: moment.distance,
      subtitle: '',
      meta: [],
      description: moment.description,
      image: moment.image,
    })),
  );

  return {
    featuredGardens,
    museumsData,
    heritageData,
    gardenCards,
    museumCards,
    heritageCards,
    chapterCards: computed(() => localized.value.chapterCards),
    pingjiangRhythms: computed(() => localized.value.pingjiangRhythms),
    heritageSteps: computed(() => localized.value.heritageSteps),
  };
}
