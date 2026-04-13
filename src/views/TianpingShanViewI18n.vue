<script setup>
import { computed } from 'vue';
import GardenDetailPage from '../components/GardenDetailPage.vue';
import { resolveGardenGalleryImage, resolveGardenHeroImage } from '../data/gardenImages';
import { resolveLocalized, useLanguage } from '../i18n';

const { language } = useLanguage();
const slug = 'tianpingshan';

const gardenSource = {
  mapSlug: slug,
  kicker: {
    zh: '苏州秋色代表',
    en: 'Suzhou\'s Signature Autumn Color',
    ja: '蘇州の秋を代表する山景',
    ko: '쑤저우 가을을 대표하는 산빛',
  },
  name: { zh: '天平山', en: 'Tianping Mountain', ja: '天平山', ko: '천평산' },
  englishName: 'Tianping Mountain',
  intro: {
    zh: '如果想给苏州的秋天找一个最直接的答案，通常就是天平山。这里最适合在红枫进入状态的时候来，看山径、古枫、寺院与远景怎样一起把秋意推到最满。',
    en: 'If you want the clearest answer to Suzhou in autumn, it is usually Tianping Mountain. Come when the maples are turning and watch mountain paths, old trees, temples, and distant views gather the season into one place.',
    ja: '蘇州の秋をもっとも直接に感じたいなら、たいてい答えは天平山になる。紅葉が色づくころに来れば、山道や古い楓、寺院と遠景が一緒になって秋を最も濃く見せてくれる。',
    ko: '쑤저우의 가을을 가장 직접적으로 느끼고 싶다면 보통 답은 천평산이다. 단풍이 무르익을 즈음 오면 산길과 고목, 절, 원경이 한데 모여 계절감을 가장 진하게 보여 준다.',
  },
  heroImage: resolveGardenHeroImage(slug, 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1800&dpr=2&auto=format'),
  heroAlt: {
    zh: '天平山秋日红枫景色',
    en: 'Autumn maple view at Tianping Mountain',
    ja: '天平山の秋の紅葉景',
    ko: '천평산 가을 단풍 풍경',
  },
  design: {
    variant: 'liuyuan',
    accent: '#A44A2B',
    accentRgb: '164, 74, 43',
    secondary: '#D08B45',
    secondaryRgb: '208, 139, 69',
    watermark: { zh: '枫', en: 'Maple', ja: '楓', ko: '단풍' },
    heroImagePosition: 'center 48%',
    heroQuote: {
      zh: '先看山上的红，再回城里读秋。',
      en: 'See the red on the mountain first, then return to the city to read autumn more quietly.',
      ja: 'まず山の赤を見て、そのあと街へ戻って秋を読む。',
      ko: '먼저 산의 붉음을 보고, 그다음 도심으로 돌아와 가을을 읽는다.',
    },
    heroCaption: {
      zh: '天平山很适合做秋季路线的第一站，把最鲜明的季节感先收进眼里。',
      en: 'Tianping Mountain works beautifully as the first stop on an autumn route, giving you the strongest seasonal note right away.',
      ja: '秋のルートの最初に置くと、最も鮮やかな季節感を先に受け取ることができる。',
      ko: '가을 루트의 첫 정거장으로 두면 가장 선명한 계절감을 먼저 받아들일 수 있다.',
    },
    galleryTitle: {
      zh: '横向展开: 山径、枫色与远景',
      en: 'Unfolded Sideways: Mountain Paths, Maple Color, and Distance',
      ja: '山道と紅葉、遠景が横に開く',
      ko: '산길과 단풍, 원경이 가로로 펼쳐진다',
    },
    galleryIntro: {
      zh: '这里的节奏和园林不同，先上山看开阔视野，再回到树下看颜色和层次。',
      en: 'The rhythm here differs from the gardens: begin with the broad mountain view, then return to the trees and their closer layers.',
      ja: 'ここは庭園と異なり、まず山で視界を開き、そのあと樹下で色と層を読む。',
      ko: '이곳의 리듬은 정원과 다르다. 먼저 산 위에서 시야를 열고, 그다음 나무 아래로 돌아와 색과 층을 읽는다.',
    },
    highlightIntro: {
      zh: '秋天的天平山不只是“看枫叶”，更是在看山路、古寺和苏州秋色怎样叠在一起。',
      en: 'Tianping Mountain is not just about maple leaves. It is about how paths, temples, and autumn color layer together.',
      ja: '天平山は単に紅葉を見る場所ではなく、山道や古寺、蘇州の秋色がどう重なるかを見る場所だ。',
      ko: '천평산은 단순히 단풍만 보는 곳이 아니라 산길과 절, 쑤저우의 가을빛이 어떻게 겹쳐지는지 읽는 곳이다.',
    },
    stepperIntro: {
      zh: '先抓整体色调，再看局部枝叶，最后把傍晚留给回城后的古街或园林。',
      en: 'Take in the overall color first, then move to branches and details, and save dusk for the city on the way back.',
      ja: 'まず全体の色調をつかみ、そのあと枝葉へ近づき、夕方は街へ戻って古街や庭園へつなぐ。',
      ko: '먼저 전체 색조를 보고, 그다음 가지와 세부를 읽고, 저녁은 다시 도심의 옛 거리나 정원에 남겨 둔다.',
    },
    tipsTitle: {
      zh: '秋游建议',
      en: 'Autumn Route Notes',
      ja: '秋の歩き方',
      ko: '가을 산행 메모',
    },
    tipsIntro: {
      zh: '天平山最怕只顾着打卡不顾节奏。把时间留给停顿，景色会比照片更完整。',
      en: 'The one mistake here is rushing from viewpoint to viewpoint. Give the mountain time and the experience becomes fuller than the photo.',
      ja: 'ここで一番惜しいのは急ぎすぎること。立ち止まる時間を残せば、景色は写真以上に深く残る。',
      ko: '이곳에서 가장 아쉬운 건 급하게 포인트만 찍고 지나가는 것이다. 멈출 시간을 남기면 풍경은 사진보다 더 깊게 남는다.',
    },
  },
  backHref: '/',
  badges: [
    { zh: '秋季主推', en: 'Autumn highlight', ja: '秋の主役', ko: '가을 대표' },
    { zh: '红枫辨识度很高', en: 'Maples are unmistakable', ja: '紅葉の印象が強い', ko: '단풍 존재감이 크다' },
    { zh: '适合接古街收尾', en: 'Pairs well with old streets', ja: '古街へつなぎやすい', ko: '옛 거리와 잘 이어진다' },
  ],
  facts: [
    { label: { zh: '推荐季节', en: 'Best season', ja: 'おすすめの季節', ko: '추천 계절' }, value: { zh: '11 月中下旬', en: 'Mid to late November', ja: '11月中旬から下旬', ko: '11월 중하순' } },
    { label: { zh: '核心看点', en: 'What to notice', ja: '見るポイント', ko: '핵심 포인트' }, value: { zh: '红枫、山径、古寺与远景', en: 'Maples, mountain paths, temples, and distant views', ja: '紅葉、山道、古寺、遠景', ko: '단풍, 산길, 절, 원경' } },
    { label: { zh: '推荐停留', en: 'Suggested stay', ja: 'おすすめ滞在', ko: '추천 체류' }, value: { zh: '2 - 4 小时', en: '2-4 hours', ja: '2-4時間', ko: '2-4시간' } },
    { label: { zh: '适合人群', en: 'Best for', ja: '向いている人', ko: '어울리는 사람' }, value: { zh: '第一次来苏州看秋景的人', en: 'Anyone looking for Suzhou\'s clearest autumn mood', ja: '蘇州で秋を一番わかりやすく感じたい人', ko: '쑤저우의 가을을 가장 분명히 느끼고 싶은 사람' } },
  ],
  highlights: [
    { title: { zh: '红枫是最明确的秋季记忆点', en: 'The maples create an immediate autumn memory', ja: '紅楓が秋の記憶点になる', ko: '단풍이 가을의 기억점을 만든다' }, description: { zh: '苏州很多地方都能感到秋意，但天平山把季节性景观推得最鲜明，一到位就会让整条路线有了主题。', en: 'Many parts of Suzhou feel autumnal, but Tianping Mountain states the season most clearly and gives the whole route a theme.', ja: '蘇州の秋は各所で感じられるが、天平山はその季節性をもっとも鮮明に見せてくれる。', ko: '쑤저우의 많은 곳에서 가을을 느낄 수 있지만 천평산은 그 계절성을 가장 선명하게 드러낸다.' } },
    { title: { zh: '山景和城景形成反差', en: 'The mountain changes how the city feels later', ja: '山景が街景との対比をつくる', ko: '산 풍경이 도시 풍경과의 대비를 만든다' }, description: { zh: '它和园林的观看逻辑不同，不是一直在小空间里细读，而是先用山路和高差把视野打开，再回到树下看细节。', en: 'Unlike the gardens, the mountain begins with wide views and elevation before bringing you back to detail under the trees.', ja: '庭園のように小さな空間で読み進めるのではなく、まず高低差と山道で視界を開き、そのあと枝葉へ近づいていく。', ko: '정원처럼 작은 공간을 계속 읽는 것이 아니라, 먼저 높이 차와 산길로 시야를 열고 그다음 나무 아래의 세부로 돌아오게 만든다.' } },
    { title: { zh: '很适合接园林或古街做第二段', en: 'It pairs well with a quieter second stop', ja: '静かな第二段へつなぎやすい', ko: '조용한 두 번째 구간과 잘 이어진다' }, description: { zh: '看完最热烈的山色之后，再去留园或平江路，会很容易把情绪从鲜明收回到更安静的空间里。', en: 'After the strongest color on the mountain, Liuyuan or Pingjiang Road give the day a calmer and more layered finish.', ja: '山で最も鮮やかな色を見たあとに、留園や平江路へ向かうと、気持ちが自然に静かな層へ戻っていく。', ko: '산에서 가장 강한 색을 본 뒤 유원이나 평강로로 넘어가면 감정이 자연스럽게 더 조용한 공간으로 수습된다.' } },
  ],
  itinerary: [
    { title: { zh: '第一段: 先从山径建立整体色调', en: 'First: let the mountain path set the overall color', ja: '第一段: 山道で全体の色をつかむ', ko: '1단계: 산길에서 전체 색조를 잡기' }, description: { zh: '刚到时不要急着贴近树叶拍照，先看山路、坡度和大片枫色怎样把视线往上引。', en: 'Resist the close-up photo at first and let the paths, slope, and broad color fields pull your view upward.', ja: '最初は葉に寄りすぎず、山道と斜面、大きな色面が視線をどう上へ導くかを見る。', ko: '처음에는 잎사귀를 가까이 찍기보다 산길과 경사, 넓은 색면이 시선을 어떻게 위로 끌어올리는지 본다.' } },
    { title: { zh: '第二段: 再回到树下看枝叶层次', en: 'Second: return beneath the trees for detail', ja: '第二段: 樹下で枝葉を見る', ko: '2단계: 나무 아래에서 가지와 잎을 보기' }, description: { zh: '知道整座山的颜色关系之后，再看古枫树干、枝叶层次和石阶，会更有节奏感。', en: 'Once you understand the mountain\'s color structure, the trunks, branches, and steps begin to feel more intentional.', ja: '山全体の色関係が見えたあとで枝や幹、石段を見ると、細部の歩調がずっと生きてくる。', ko: '산 전체의 색 관계를 본 뒤에야 고목의 줄기와 가지, 돌계단의 리듬이 더 살아난다.' } },
    { title: { zh: '第三段: 下午回城接一段古街或园林', en: 'Third: return to the city for an evening follow-up', ja: '第三段: 午後は街へ戻る', ko: '3단계: 오후에는 도심으로 돌아오기' }, description: { zh: '把最显眼的秋景放在前半段，后半段回到城里看更安静的秋意，会比整天都停在山里更耐读。', en: 'Place the vivid mountain color in the first half, then spend the second half with a calmer urban autumn.', ja: '鮮やかな山の秋を前半に置き、後半は街の静かな秋へ戻るほうが、読み味のある一日になる。', ko: '강렬한 산의 가을을 전반부에 두고, 후반부는 도심의 조용한 가을로 돌아오는 편이 더 오래 남는 하루가 된다.' } },
  ],
  tips: [
    { zh: '如果是专门看枫叶，尽量提前确认红叶期，再决定日期。', en: 'If maples are the main goal, check the color season before choosing your day.', ja: '紅葉を目的にするなら、見頃を先に確かめてから日程を決めたい。', ko: '단풍이 목적이라면 먼저 절정 시기를 확인하고 날짜를 정하는 편이 좋다.' },
    { zh: '天气晴朗但不过分刺眼的时候，山上的色彩层次通常最明显。', en: 'Clear but not harsh light often gives the best color layers on the mountain.', ja: '晴れていても光が強すぎない日が、色の層を最も見やすくしてくれる。', ko: '맑지만 빛이 너무 강하지 않은 날이 산의 색층을 가장 잘 보여 준다.' },
    { zh: '建议把天平山安排在秋季路线前半段，后半段转去留园或平江路更顺。', en: 'Place Tianping Mountain in the first half of an autumn day and shift to Liuyuan or Pingjiang Road later.', ja: '秋の日の前半に天平山を置き、後半を留園や平江路へつなぐと流れがよい。', ko: '가을 일정의 전반부에 천평산을 두고, 후반부는 유원이나 평강로로 넘기면 흐름이 좋다.' },
  ],
  gallery: [
    { ratio: 'panorama', title: { zh: '先看整面秋山', en: 'Take in the whole autumn mountain', ja: 'まず秋山全体を見る', ko: '먼저 가을 산 전체를 보기' }, caption: { zh: '先确认整座山的颜色关系，再决定从哪里慢慢停下来。', en: 'Understand the mountain\'s color field before choosing where to slow down.', ja: 'まず山全体の色の関係をつかみ、そのあとどこで立ち止まるかを決める。', ko: '먼저 산 전체의 색 관계를 보고, 그다음 어디서 멈출지 정한다.' }, src: resolveGardenGalleryImage(slug, 0, 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=2200&dpr=2&auto=format') },
    { ratio: 'portrait', title: { zh: '树下看古枫枝干', en: 'Look at the older trunks beneath the canopy', ja: '樹下で古い幹を見る', ko: '나무 아래에서 오래된 줄기 보기' }, caption: { zh: '贴近之后，真正耐看的往往是树干、石阶和叶色之间的关系。', en: 'Up close, the lasting beauty often lies in the relation between trunks, steps, and leaves.', ja: '近づいてみると、長く見返したくなるのは幹と石段、葉色の関係だったりする。', ko: '가까이 가서 보면 오래 남는 것은 줄기와 돌계단, 잎색의 관계일 때가 많다.' }, src: resolveGardenGalleryImage(slug, 1, 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600&dpr=2&auto=format') },
    { ratio: 'landscape', title: { zh: '石阶把节奏带出来', en: 'The steps make the pace visible', ja: '石段が歩調を見せる', ko: '돌계단이 리듬을 드러낸다' }, caption: { zh: '天平山的好看不只在颜色，也在上山这件事本身的节奏。', en: 'Tianping Mountain is not just about color; it is also about the bodily pace of going uphill.', ja: '天平山の魅力は色だけでなく、登っていく身体の歩調そのものにもある。', ko: '천평산의 아름다움은 색만이 아니라 올라가는 몸의 리듬에도 있다.' }, src: resolveGardenGalleryImage(slug, 2, 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1800&dpr=2&auto=format') },
    { ratio: 'square', title: { zh: '把秋色收回城里', en: 'Carry the autumn mood back into the city', ja: '秋色を街へ持ち帰る', ko: '가을빛을 도심으로 가져오기' }, caption: { zh: '看完山景之后再回到古街或园林，秋意会更沉下来。', en: 'Returning to the city after the mountain lets the autumn feeling settle more deeply.', ja: '山の景色を見たあとに古街や庭園へ戻ると、秋の気配がさらに深く残る。', ko: '산 풍경 뒤에 옛 거리나 정원으로 돌아오면 가을의 기운이 더 깊게 가라앉는다.' }, src: resolveGardenGalleryImage(slug, 3, 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1500&dpr=2&auto=format') },
  ],
  relatedGardens: [
    { kicker: { zh: '秋意收束', en: 'A quieter autumn follow-up', ja: '静かな秋へ', ko: '차분한 가을로' }, label: { zh: '留园', en: 'Lingering Garden', ja: '留園', ko: '유원' }, description: { zh: '看完天平山后，如果想把热烈的秋色收回到更安静的空间，可以接着去留园。', en: 'After the mountain, Liuyuan helps gather that autumn intensity into a quieter space.', ja: '天平山のあとに秋の強さを静かな空間へ受け直したいなら、留園がよく合う。', ko: '천평산 뒤에 강한 가을빛을 조용한 공간으로 받아내고 싶다면 유원이 잘 맞는다.' }, href: '/liu' },
    { kicker: { zh: '傍晚收尾', en: 'Dusk finish', ja: '夕方の締め', ko: '저녁 마무리' }, label: { zh: '平江路', en: 'Pingjiang Road', ja: '平江路', ko: '평강로' }, description: { zh: '如果想把最后一段留给城市里的秋意，平江路会比继续赶景点更合适。', en: 'If you want the final stretch of the day to stay in the city, Pingjiang Road is a better finish than another mountain stop.', ja: '最後の時間を街の秋に残したいなら、次の景点へ急ぐより平江路が似合う。', ko: '하루의 마지막을 도시 안의 가을로 남기고 싶다면 또 다른 명소보다 평강로가 더 잘 어울린다.' }, href: '/pingjiang-road' },
    { kicker: { zh: '回到首页', en: 'Back to Home', ja: 'ホームへ戻る', ko: '홈으로 돌아가기' }, label: { zh: '继续看四季首页', en: 'Return to Seasonal Home', ja: '四季ホームへ', ko: '사계절 홈으로' }, description: { zh: '回到首页后，可以继续看春夏秋冬不同的慢游建议。', en: 'Back on the home page, you can keep browsing slow-travel suggestions for every season.', ja: 'ホームに戻ると、四季それぞれのゆっくりした巡り方を続けて見られる。', ko: '홈으로 돌아가면 사계절별 슬로우 여행 제안을 계속 볼 수 있다.' }, href: '/' },
  ],
  nextGarden: {
    label: { zh: '平江路', en: 'Pingjiang Road', ja: '平江路', ko: '평강로' },
    href: '/pingjiang-road',
  },
};

const garden = computed(() => resolveLocalized(gardenSource, language.value));
</script>

<template>
  <GardenDetailPage :garden="garden" />
</template>
