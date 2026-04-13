import { computed } from 'vue';
import { currentLanguage, resolveLocalized } from '../i18n/index.js';
import kunquMuseumImage from '../assets/kunqu-museum.jpg';
import { resolveGardenCardImage } from './gardenImages';

const siteContentSource = {
  gardenCards: [
    {
      title: {
        zh: '拙政园',
        en: "Humble Administrator's Garden",
        ja: '拙政園',
        ko: '졸정원',
      },
      eyebrow: {
        zh: '明代园林',
        en: 'Ming garden',
        ja: '明代庭園',
        ko: '명대 정원',
      },
      badge: {
        zh: '世界文化遗产',
        en: 'UNESCO Heritage',
        ja: '世界文化遺産',
        ko: '유네스코 유산',
      },
      subtitle: {
        zh: '苏州 · 姑苏区',
        en: 'Suzhou · Gusu District',
        ja: '蘇州・姑蘇区',
        ko: '쑤저우 · 고소구',
      },
      meta: [
        {
          zh: '距主街约 50 米',
          en: 'About 50 m from the main street',
          ja: 'メインストリートから約50m',
          ko: '메인 거리에서 약 50m',
        },
        {
          zh: '评分 4.9',
          en: 'Rating 4.9',
          ja: '評価 4.9',
          ko: '평점 4.9',
        },
      ],
      description: {
        zh: '以水为脉、以亭为骨，慢慢走时最能看出它如何把开阔水面和细密借景组织在一起。',
        en: 'Water and pavilions hold the whole composition together, especially when you let the larger courts and quieter framed views unfold slowly.',
        ja: '水面と亭が庭全体の骨格をつくり、ゆっくり歩くほど広い水庭と繊細な借景の関係が見えてきます。',
        ko: '물과 정자가 전체 구성을 잡아 주기 때문에 천천히 걸을수록 넓은 수면과 섬세한 차경의 관계가 더 잘 보입니다.',
      },
      to: '/zhuozheng',
      actionLabel: {
        zh: '进入园林',
        en: 'Open Garden Detail',
        ja: '庭園を見る',
        ko: '정원 보기',
      },
      image: resolveGardenCardImage(
        'zhuozhengyuan',
        'https://images.unsplash.com/photo-1611288618898-e2a93f848cf6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600&dpr=2&auto=format',
      ),
    },
    {
      title: {
        zh: '留园',
        en: 'Lingering Garden',
        ja: '留園',
        ko: '유원',
      },
      eyebrow: {
        zh: '层层转景',
        en: 'Layered framing',
        ja: '重なり合う景',
        ko: '겹쳐지는 장면',
      },
      badge: {
        zh: '移步换景',
        en: 'Step by step views',
        ja: '歩くたびに変わる景色',
        ko: '걸을수록 바뀌는 풍경',
      },
      subtitle: {
        zh: '苏州 · 姑苏区',
        en: 'Suzhou · Gusu District',
        ja: '蘇州・姑蘇区',
        ko: '쑤저우 · 고소구',
      },
      meta: [
        {
          zh: '距主街约 900 米',
          en: 'About 900 m from the main street',
          ja: 'メインストリートから約900m',
          ko: '메인 거리에서 약 900m',
        },
        {
          zh: '评分 4.8',
          en: 'Rating 4.8',
          ja: '評価 4.8',
          ko: '평점 4.8',
        },
      ],
      description: {
        zh: '长廊、洞门、庭院和山石一层层把视线往里带，是最适合练习“慢一点再看一次”的园林。',
        en: 'Corridors, moon gates, courts, and rockeries pull your sight inward in layers, making it ideal for a second, slower read.',
        ja: '長い廊下や洞門、庭、山石が視線を何度も内側へ導くので、二度目のゆっくりした見方に向いた庭園です。',
        ko: '긴 회랑과 동문, 뜰, 암석이 시선을 안쪽으로 여러 번 끌어당겨서 한 번 더 천천히 보는 데 가장 잘 맞는 정원입니다.',
      },
      to: '/liu',
      actionLabel: {
        zh: '进入园林',
        en: 'Open Garden Detail',
        ja: '庭園を見る',
        ko: '정원 보기',
      },
      image: resolveGardenCardImage(
        'liuyuan',
        'https://images.unsplash.com/photo-1771937820345-6aced121dba7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600&dpr=2&auto=format',
      ),
    },
    {
      title: {
        zh: '网师园',
        en: 'Master of Nets Garden',
        ja: '網師園',
        ko: '망사원',
      },
      eyebrow: {
        zh: '小中见大',
        en: 'Small yet vast',
        ja: '小さくても深い',
        ko: '작지만 깊은 공간',
      },
      badge: {
        zh: '夜色尤其动人',
        en: 'Especially vivid at dusk',
        ja: '夕方により美しい',
        ko: '해질 무렵 특히 좋음',
      },
      subtitle: {
        zh: '苏州 · 姑苏区',
        en: 'Suzhou · Gusu District',
        ja: '蘇州・姑蘇区',
        ko: '쑤저우 · 고소구',
      },
      meta: [
        {
          zh: '距主街约 650 米',
          en: 'About 650 m from the main street',
          ja: 'メインストリートから約650m',
          ko: '메인 거리에서 약 650m',
        },
        {
          zh: '评分 4.9',
          en: 'Rating 4.9',
          ja: '評価 4.9',
          ko: '평점 4.9',
        },
      ],
      description: {
        zh: '尺度不大，却能把水、亭、树影和夜色压缩成很有诗意的一层层空间。',
        en: 'Its compact scale condenses water, pavilions, tree shadows, and evening light into a remarkably poetic sequence.',
        ja: '大きすぎない尺度の中に、水面や亭、木影、夕景が凝縮されていて、とても詩的に感じられます。',
        ko: '크지 않은 규모 안에 물과 정자, 나무 그림자, 저녁빛이 응축되어 있어 아주 시적인 분위기를 만듭니다.',
      },
      to: '/wangshi',
      actionLabel: {
        zh: '进入园林',
        en: 'Open Garden Detail',
        ja: '庭園を見る',
        ko: '정원 보기',
      },
      image: resolveGardenCardImage(
        'wangshiyuan',
        'https://images.unsplash.com/photo-1697832245666-78c870b29813?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600&dpr=2&auto=format',
      ),
    },
  ],
  museumCards: [
    {
      title: {
        zh: '苏州博物馆',
        en: 'Suzhou Museum',
        ja: '蘇州博物館',
        ko: '쑤저우 박물관',
      },
      eyebrow: {
        zh: '建筑与展陈',
        en: 'Architecture & collections',
        ja: '建築と展示',
        ko: '건축과 전시',
      },
      badge: {
        zh: '距平江路步行约 12 分钟',
        en: 'About 12 minutes on foot from Pingjiang Road',
        ja: '平江路から徒歩約12分',
        ko: '평강로에서 도보 약 12분',
      },
      subtitle: {
        zh: '白墙、片石和水院把苏州气质翻译成了现代空间。',
        en: 'White walls, stone, and water courts translate Suzhou into a modern museum language.',
        ja: '白壁、石、水庭が蘇州らしさを現代的な美術館言語に置き換えています。',
        ko: '흰 벽과 돌, 수원이 쑤저우의 분위기를 현대적인 박물관 언어로 풀어냅니다.',
      },
      description: {
        zh: '先看建筑，再进展厅，会更容易看清这座城市的审美并没有中断，只是换了一种表达方式。',
        en: 'Read the building before the galleries and it becomes easier to see how Suzhou\'s older aesthetics continue in a contemporary form.',
        ja: '展示室へ急がず建物から読み始めると、蘇州の美意識が今も別の形で続いていることがよく分かります。',
        ko: '전시장으로 바로 들어가기보다 건물부터 읽으면 쑤저우의 미감이 다른 형태로 계속 이어지고 있다는 점이 더 분명해집니다.',
      },
      highlights: [
        {
          zh: '先看中庭和几何屋面的关系',
          en: 'Start with the central court and geometric roofline',
          ja: 'まず中庭と幾何学的な屋根の関係を見る',
          ko: '먼저 중정과 기하학적 지붕의 관계를 본다',
        },
        {
          zh: '再进展厅读书画、器物与工艺',
          en: 'Then move into the galleries for painting, objects, and craft',
          ja: 'その後に書画、器物、工芸の展示へ進む',
          ko: '그다음 서화와 기물, 공예 전시로 들어간다',
        },
        {
          zh: '冬天或雨天尤其适合放进路线里',
          en: 'It fits especially well into winter or rainy-day routes',
          ja: '冬や雨の日のルートに特によく合う',
          ko: '겨울이나 비 오는 날 동선에 특히 잘 맞는다',
        },
      ],
      objectPosition: '62% center',
      image: 'https://commons.wikimedia.org/wiki/Special:FilePath/Suzhou%20Museum%20%281%29.jpg',
      to: '/suzhou-museum',
      actionLabel: {
        zh: '查看馆页',
        en: 'Open Museum Story',
        ja: '詳細を見る',
        ko: '상세 보기',
      },
    },
    {
      title: {
        zh: '昆曲博物馆',
        en: 'Kunqu Museum',
        ja: '昆曲博物館',
        ko: '곤곡 박물관',
      },
      eyebrow: {
        zh: '戏曲与声景',
        en: 'Opera & soundscape',
        ja: '戯曲と音の風景',
        ko: '희곡과 사운드스케이프',
      },
      badge: {
        zh: '主街支巷内可达',
        en: 'Tucked inside a side lane off the main street',
        ja: 'メインストリート脇の路地にある',
        ko: '메인 거리 옆 골목 안쪽',
      },
      subtitle: {
        zh: '从水边转进旧宅，唱腔、服饰和道具会把平江路的声音层层打开。',
        en: 'Turn in from the canal and the old residence opens into costumes, scores, and the voice of Kunqu.',
        ja: '水辺から旧宅へ入ると、衣装や譜面、昆曲の声が平江路の音の層を開いていきます。',
        ko: '물가에서 옛집으로 들어서면 의상과 악보, 곤곡의 목소리가 평강로의 소리 층을 펼쳐 줍니다.',
      },
      description: {
        zh: '这座馆更适合带着“听”的心情去看，慢一点，戏服、唱词和舞台空间会自己连成一条线。',
        en: 'This museum rewards listening as much as looking. Slow down and costumes, lyrics, and stage space begin to connect naturally.',
        ja: 'この館は「見る」だけでなく「聴く」気分で歩くと良い場所です。ゆっくり見れば衣装、詞、舞台空間が自然につながります。',
        ko: '이곳은 보는 것만큼 듣는 마음으로 둘러보면 더 좋은 장소입니다. 천천히 보면 의상과 창사, 무대 공간이 자연스럽게 이어집니다.',
      },
      highlights: [
        {
          zh: '白天先看展陈和旧戏台',
          en: 'Visit by day for the exhibition and old stage',
          ja: '昼間に展示と旧舞台を見る',
          ko: '낮에는 전시와 옛 무대를 본다',
        },
        {
          zh: '留意戏服纹样、道具和唱本',
          en: 'Look closely at costume patterns, props, and librettos',
          ja: '衣装の文様や小道具、台本に注目する',
          ko: '의상 무늬와 소도구, 대본을 자세히 본다',
        },
        {
          zh: '晚一点再回到街巷听真实声景',
          en: 'Return to the lanes afterward to hear the live soundscape',
          ja: 'その後に路地へ戻って実際の街の音を聞く',
          ko: '그 뒤 골목으로 돌아가 실제 거리의 소리를 듣는다',
        },
      ],
      objectPosition: 'center 44%',
      image: kunquMuseumImage,
      fallbackImage: kunquMuseumImage,
    },
  ],
  heritageCards: [
    {
      title: {
        zh: '苏式汤面',
        en: 'Suzhou-style noodles',
        ja: '蘇州式湯麺',
        ko: '쑤저우식 탕면',
      },
      eyebrow: {
        zh: '热汤慢晨',
        en: 'A warm morning bowl',
        ja: '朝の温かい一杯',
        ko: '따뜻한 아침 한 그릇',
      },
      badge: {
        zh: '距主街约 30 米',
        en: 'About 30 m from the main street',
        ja: 'メインストリートから約30m',
        ko: '메인 거리에서 약 30m',
      },
      subtitle: {
        zh: '一碗热面，通常就是走进平江日常最顺的起点。',
        en: 'A bowl of noodles is often the smoothest way into Pingjiang\'s daily rhythm.',
        ja: '一杯の湯麺は、平江の日常へ入っていく一番自然な入口です。',
        ko: '따뜻한 국수 한 그릇이 평강의 일상 리듬으로 들어가는 가장 자연스러운 시작점이 됩니다.',
      },
      description: {
        zh: '清汤、细面和浇头之间的分寸感，是苏州人把“讲究”放进日常的一种方式。',
        en: 'Clear broth, fine noodles, and careful toppings show how everyday food in Suzhou still carries a sense of precision.',
        ja: '澄んだスープと細麺、具材の加減に、蘇州の「丁寧さ」が日常の中で生きていることが表れます。',
        ko: '맑은 국물과 가는 면, 절제된 고명은 쑤저우의 세심함이 일상 음식 안에도 살아 있다는 것을 보여 줍니다.',
      },
      image:
        'https://images.unsplash.com/photo-1617093727343-374698b1b08d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900&dpr=2&auto=format',
    },
    {
      title: {
        zh: '评弹',
        en: 'Pingtan',
        ja: '評彈',
        ko: '평탄',
      },
      eyebrow: {
        zh: '吴语声景',
        en: 'Wu voices',
        ja: '呉語の声景',
        ko: '오어의 소리 풍경',
      },
      badge: {
        zh: '距主街约 80 米',
        en: 'About 80 m from the main street',
        ja: 'メインストリートから約80m',
        ko: '메인 거리에서 약 80m',
      },
      subtitle: {
        zh: '一桌一椅、一弦一拍，就能把水声、人声和故事声叠在一起。',
        en: 'A table, a chair, a string, and a voice are enough to layer water, speech, and story together.',
        ja: '小さな舞台でも、水の音、人の声、物語の声が重なって街の空気をつくります。',
        ko: '작은 무대 하나만 있어도 물소리와 사람 목소리, 이야기 소리가 겹쳐지며 거리의 공기를 만듭니다.',
      },
      description: {
        zh: '在平江路，评弹不是单独的节目，而是和街巷生活连在一起的声音背景。',
        en: 'On Pingjiang Road, Pingtan feels less like a separate show and more like a sound layer woven into the street.',
        ja: '平江路では評彈は独立した演目というより、路地の暮らしに溶け込んだ音の背景として響きます。',
        ko: '평강로에서 평탄은 별도의 공연이라기보다 골목의 생활 속에 섞여 있는 배경음처럼 들립니다.',
      },
      image:
        'https://images.unsplash.com/photo-1516280440614-37939bbacd81?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900&dpr=2&auto=format',
    },
    {
      title: {
        zh: '宋锦与手作',
        en: 'Song brocade & craft',
        ja: '宋錦と手仕事',
        ko: '송금과 수공예',
      },
      eyebrow: {
        zh: '能带走的苏州',
        en: 'Take-home Suzhou',
        ja: '持ち帰れる蘇州',
        ko: '가져갈 수 있는 쑤저우',
      },
      badge: {
        zh: '支巷和小店里更容易遇见',
        en: 'Best found in side lanes and smaller shops',
        ja: '路地や小さな店で出会いやすい',
        ko: '골목과 작은 가게에서 더 잘 만난다',
      },
      subtitle: {
        zh: '真正值得带走的，不只是纪念品，而是工艺背后的时间感。',
        en: 'What matters is not only the souvenir itself, but the time and care hidden inside the craft.',
        ja: '持ち帰る価値があるのは品物そのものだけでなく、その手仕事に積み重なった時間です。',
        ko: '가져갈 가치가 있는 것은 물건 자체만이 아니라 그 수공예 안에 쌓인 시간감입니다.',
      },
      description: {
        zh: '从丝线、纹样到纸品和香器，这些小东西会让平江路的人间烟火变得可以被留住。',
        en: 'Threads, patterns, paper goods, and incense ware help the warmth of Pingjiang Road stay with you after you leave.',
        ja: '糸や文様、紙もの、香器などの小さな品が、平江路の温度を帰った後まで残してくれます。',
        ko: '실과 무늬, 종이 제품, 향도구 같은 작은 물건들이 평강로의 온기를 돌아간 뒤에도 오래 남겨 줍니다.',
      },
      image:
        'https://images.unsplash.com/photo-1517705008128-361805f42e86?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900&dpr=2&auto=format',
    },
  ],
  heritageSteps: [
    {
      zh: '先吃一碗热面，把脚步和胃口都慢下来。',
      en: 'Begin with a hot bowl of noodles and let both your pace and appetite slow down.',
      ja: 'まず温かい麺を食べて、歩く速さも気持ちもゆるめていきます。',
      ko: '먼저 따뜻한 국수 한 그릇으로 걸음과 기분을 함께 느리게 만듭니다.',
    },
    {
      zh: '再拐进支巷听评弹，让耳朵接管节奏。',
      en: 'Then turn into a side lane for Pingtan and let your ears take over the rhythm.',
      ja: '次に路地へ入って評彈を聴き、耳で街のテンポを受け取ります。',
      ko: '그다음 골목으로 들어가 평탄을 들으며 귀로 거리의 리듬을 받습니다.',
    },
    {
      zh: '最后看手作和小店，把热闹装进可以带走的东西里。',
      en: 'Finish with handmade goods and small shops, carrying some of the street\'s warmth home.',
      ja: '最後に手仕事や小さな店を見て、街のにぎわいを持ち帰れる形にします。',
      ko: '마지막으로 수공예와 작은 가게를 보며 거리의 활기를 가져갈 수 있는 형태로 남깁니다.',
    },
  ],
};

export function useSiteContentI18n() {
  const localized = computed(() => resolveLocalized(siteContentSource, currentLanguage.value));

  return {
    gardenCards: computed(() => localized.value.gardenCards),
    museumCards: computed(() => localized.value.museumCards),
    heritageCards: computed(() => localized.value.heritageCards),
    heritageSteps: computed(() => localized.value.heritageSteps),
  };
}
