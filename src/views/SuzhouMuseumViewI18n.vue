<script setup>
import { computed } from 'vue';
import GardenDetailPage from '../components/GardenDetailPage.vue';
import { resolveGardenGalleryImage, resolveGardenHeroImage } from '../data/gardenImages';
import { resolveLocalized, useLanguage } from '../i18n';

const { language } = useLanguage();
const slug = 'suzhoumuseum';

const gardenSource = {
  mapSlug: slug,
  kicker: {
    zh: '园林之外的文博入口',
    en: 'A Museum Door Beyond the Gardens',
    ja: '庭園の外にある文化の入口',
    ko: '정원 밖으로 이어지는 박물관의 입구',
  },
  name: { zh: '苏州博物馆', en: 'Suzhou Museum', ja: '蘇州博物館', ko: '쑤저우 박물관' },
  englishName: 'Suzhou Museum',
  intro: {
    zh: '如果你想把苏州看得更完整，苏州博物馆很适合接在园林之后。它不只是室内替代，而是用建筑、庭院、展陈和光影把苏州的古典审美翻译成当代空间。',
    en: 'If you want a fuller picture of Suzhou, the museum belongs naturally after the gardens. Through architecture, courtyards, and light, it translates Suzhou\'s classical aesthetics into a contemporary space.',
    ja: '蘇州をもう少し立体的に見たいなら、庭園のあとに蘇州博物館を挟むのがよい。建築と庭院、展示と光で蘇州の古典美を現代の空間へ訳している。',
    ko: '쑤저우를 더 입체적으로 보고 싶다면 정원 뒤에 쑤저우 박물관을 넣는 것이 좋다. 건축과 중정, 전시와 빛으로 쑤저우의 고전 미감을 현대 공간으로 번역해 놓은 곳이다.',
  },
  heroImage: resolveGardenHeroImage(slug, 'https://commons.wikimedia.org/wiki/Special:FilePath/Suzhou%20Museum%20%281%29.jpg'),
  heroAlt: {
    zh: '苏州博物馆建筑外观',
    en: 'Exterior view of Suzhou Museum',
    ja: '蘇州博物館の外観',
    ko: '쑤저우 박물관 외관',
  },
  design: {
    variant: 'wangshiyuan',
    accent: '#2E3946',
    accentRgb: '46, 57, 70',
    secondary: '#A33B29',
    secondaryRgb: '163, 59, 41',
    watermark: { zh: '博', en: 'Museum', ja: '博', ko: '박' },
    heroImagePosition: 'center center',
    paper: 'rgba(255, 255, 255, 0.94)',
    paperStrong: 'rgba(255, 255, 255, 0.98)',
    muted: 'rgba(68, 64, 60, 0.84)',
    shadow: '0 36px 96px rgba(28, 25, 23, 0.14)',
    heroQuote: {
      zh: '先看建筑，再读展陈。',
      en: 'Read the building before the cases.',
      ja: 'まず建築を見て、そのあと展示を読む。',
      ko: '먼저 건축을 보고, 그다음 전시를 읽는다.',
    },
    heroCaption: {
      zh: '冬天尤其适合把苏州博物馆接进路线，让室内外的节奏自然切换。',
      en: 'The museum is especially useful in winter, when you want a natural shift between indoor and outdoor rhythm.',
      ja: '冬はとくに、屋内と屋外の歩調を自然に切り替える場としてよく機能する。',
      ko: '겨울에는 특히 실내외 리듬을 자연스럽게 바꿔 주는 지점으로 잘 작동한다.',
    },
    galleryTitle: {
      zh: '横向展开: 几何、庭院与器物',
      en: 'Unfolded Sideways: Geometry, Courtyards, and Objects',
      ja: '幾何と庭院、器物が横に開く',
      ko: '기하와 중정, 기물이 가로로 펼쳐진다',
    },
    galleryIntro: {
      zh: '这里不是一路热闹地推进，而是在建筑尺度与文物细节之间来回切换。',
      en: 'The experience here moves by switching back and forth between architectural scale and object detail.',
      ja: 'ここは一直線ににぎやかに進む場所ではなく、建築の尺度と器物の細部のあいだを往復する場所だ。',
      ko: '이곳은 한 방향으로 밀어붙이는 곳이 아니라 건축의 스케일과 유물의 세부 사이를 오가며 읽는 곳이다.',
    },
    highlightIntro: {
      zh: '苏州博物馆最值得看的，是它怎样被设计成“很苏州”，而不只是里面放了什么。',
      en: 'Its greatest value lies in how thoroughly it has been designed to feel like Suzhou, not only in what it contains.',
      ja: '何を展示しているか以上に、「どう蘇州らしく設計されているか」がここでは大切だ。',
      ko: '이곳에서 가장 중요한 것은 무엇을 전시하느냐보다 어떻게 “쑤저우답게” 설계되었는가이다.',
    },
    stepperIntro: {
      zh: '先从建筑和庭院读气质，再进入展厅，最后回到中庭收尾。',
      en: 'Start with the architecture and courtyards, then enter the galleries, and finish back at the central court.',
      ja: '建築と庭院から気配を読み、次に展示へ入り、最後は中庭へ戻って締める。',
      ko: '먼저 건축과 중정에서 분위기를 읽고, 다음에 전시장으로 들어가며, 마지막은 중정으로 돌아와 마무리한다.',
    },
    tipsTitle: {
      zh: '文博路线建议',
      en: 'Museum Route Notes',
      ja: '博物館ルートの提案',
      ko: '박물관 루트 메모',
    },
    tipsIntro: {
      zh: '不要只顾着进展厅。先把建筑看明白，后面的文物和空间关系才会更完整。',
      en: 'Do not head straight into the galleries. Once you understand the building, the objects and spaces start speaking more clearly.',
      ja: '展示室へ急がず、まず建築を読む。そうすると、そのあとの展示と空間の関係がずっとよく見えてくる。',
      ko: '전시실로 바로 들어가지 말고 먼저 건축을 읽어 두자. 그러면 뒤이어 만나는 유물과 공간의 관계가 훨씬 선명해진다.',
    },
  },
  backHref: '/',
  badges: [
    { zh: '四季皆宜', en: 'Works year-round', ja: '四季向き', ko: '사계절 모두 좋다' },
    { zh: '适合接园林路线', en: 'Pairs with garden routes', ja: '庭園ルートにつなぎやすい', ko: '정원 루트와 잘 잇는다' },
    { zh: '建筑本身就值得看', en: 'Architecture worth visiting', ja: '建築自体が見どころ', ko: '건축 자체가 목적지가 된다' },
  ],
  facts: [
    { label: { zh: '推荐停留', en: 'Suggested stay', ja: 'おすすめ滞在', ko: '추천 체류' }, value: { zh: '1.5 - 3 小时', en: '1.5-3 hours', ja: '1.5-3時間', ko: '1.5-3시간' } },
    { label: { zh: '核心看点', en: 'What to notice', ja: '見るポイント', ko: '핵심 포인트' }, value: { zh: '建筑、庭院、馆藏与光影', en: 'Architecture, courtyards, collections, and light', ja: '建築、庭院、館蔵、光', ko: '건축, 중정, 소장품, 빛' } },
    { label: { zh: '适合季节', en: 'Best season', ja: '向く季節', ko: '추천 계절' }, value: { zh: '四季都合适，冬天更舒服', en: 'Any season, especially winter', ja: '四季とも良いが冬が快い', ko: '사계절 좋지만 겨울이 특히 좋다' } },
    { label: { zh: '适合人群', en: 'Best for', ja: '向いている人', ko: '어울리는 사람' }, value: { zh: '想把园林和文博串起来的人', en: 'Anyone linking gardens with cultural history', ja: '庭園と文化をつなげて見たい人', ko: '정원과 문화사를 함께 보고 싶은 사람' } },
  ],
  highlights: [
    { title: { zh: '建筑本身就是苏州气质的翻译', en: 'The building itself translates Suzhou', ja: '建築そのものが蘇州を訳している', ko: '건물 자체가 쑤저우를 번역한다' }, description: { zh: '白墙、片石、几何屋面和庭院关系，让它既是现代建筑，也能与园林和古城气质自然接上。', en: 'White walls, stone, geometry, and courtyards allow the museum to feel contemporary without breaking from Suzhou\'s older visual language.', ja: '白壁、石、幾何の屋根、庭院の関係が、現代建築でありながら蘇州の古い美意識と自然につながっている。', ko: '흰 담장과 석재, 기하학적인 지붕, 중정의 관계가 이곳을 현대 건축이면서도 쑤저우의 오래된 미감과 자연스럽게 이어지게 만든다.' } },
    { title: { zh: '它很适合接在园林后面看', en: 'It pairs naturally after the gardens', ja: '庭園のあとに見るとよくつながる', ko: '정원 뒤에 보기에 자연스럽다' }, description: { zh: '看完留园或网师园之后来到这里，会更清楚地感觉到苏州审美并没有断开，只是换了一种语言。', en: 'After Liuyuan or Wangshiyuan, the museum makes it clear that Suzhou\'s aesthetics continue rather than stop.', ja: '留園や網師園のあとに来ると、蘇州の美意識が途切れたのではなく、別の言葉へ移っただけだと感じやすい。', ko: '유원이나 망사원 뒤에 오면 쑤저우의 미감이 끊긴 것이 아니라 다른 언어로 옮겨 왔다는 점이 훨씬 잘 느껴진다.' } },
    { title: { zh: '冬天尤其需要它', en: 'It becomes especially useful in winter', ja: '冬にはとくに効く', ko: '겨울에 특히 필요하다' }, description: { zh: '天气偏冷或不想一直在户外时，苏州博物馆既能稳住节奏，也不会破坏整条路线的气质。', en: 'On colder days, it keeps the route coherent while giving you a real indoor shift.', ja: '寒い日やずっと外にいたくない日に、流れを壊さずに屋内の余白をつくってくれる。', ko: '날씨가 차갑거나 하루 종일 밖에 있고 싶지 않을 때 이곳은 루트의 분위기를 깨지 않으면서 실내의 여백을 만들어 준다.' } },
  ],
  itinerary: [
    { title: { zh: '第一段: 先看入口和中庭关系', en: 'First: read the entrance and central court', ja: '第一段: 入口と中庭の関係を見る', ko: '1단계: 입구와 중정의 관계를 읽기' }, description: { zh: '刚到时先不要急着进展厅，先看建筑外部、院落、水面和屋面的组织方式。', en: 'Before the galleries, study how the exterior, courtyards, water, and rooflines are arranged.', ja: '展示室へ急がず、まず外部と庭院、水面、屋根の組み立て方を見る。', ko: '전시실로 바로 들어가지 말고 외부와 중정, 수면, 지붕선이 어떻게 조직되어 있는지 먼저 본다.' } },
    { title: { zh: '第二段: 再按兴趣进入展陈', en: 'Second: enter the collections by interest', ja: '第二段: 興味の順に展示へ', ko: '2단계: 관심사에 따라 전시로 들어가기' }, description: { zh: '先建立空间感之后，再去看书画、器物和工艺，理解会更完整。', en: 'Once the spatial sense is set, paintings, objects, and craft displays make more sense.', ja: '空間の感覚をつかんだあとで書画や器物、工芸を見ると、理解がずっと深まる。', ko: '공간 감각을 먼저 잡고 나서 서화와 기물, 공예를 보면 이해가 훨씬 깊어진다.' } },
    { title: { zh: '第三段: 最后回到庭院和过渡空间', en: 'Third: finish in the courtyards and thresholds', ja: '第三段: 最後に庭院と余白へ戻る', ko: '3단계: 마지막은 중정과 전이 공간으로' }, description: { zh: '离开前再站回中庭或连桥，会更清楚地理解它为什么适合和园林并置观看。', en: 'Returning to the courtyard before leaving clarifies why the museum sits so well beside the gardens.', ja: '出る前にもう一度中庭や渡りの空間へ戻ると、庭園と並べて見る意味がよりはっきりする。', ko: '나가기 전에 다시 중정이나 연결 공간으로 돌아오면 이 박물관이 왜 정원과 나란히 읽히는지 더 분명해진다.' } },
  ],
  tips: [
    { zh: '如果当天还安排了园林，建议一静一动搭配，不要把所有室内项目堆在一起。', en: 'If you also have gardens that day, balance the route instead of stacking all the indoor stops together.', ja: 'その日に庭園も入っているなら、室内を固めすぎず静と動の配分をつくるとよい。', ko: '그날 정원도 있다면 실내 일정만 몰아넣지 말고 흐름을 섞어 주는 편이 좋다.' },
    { zh: '进馆前先绕着建筑外侧和庭院看一圈，体验会明显更完整。', en: 'Walk the exterior and courtyards first for a fuller experience.', ja: 'まず外まわりと庭院を一周してから入ると、体験がずっとまとまりやすい。', ko: '먼저 외곽과 중정을 한 바퀴 돈 뒤 들어가면 경험이 훨씬 더 완성된다.' },
    { zh: '冬天或下雨天尤其适合把它作为路线中段，帮助节奏切换。', en: 'In winter or rain, it works especially well as a middle stop for resetting the pace.', ja: '冬や雨の日には、中盤の切り替え地点としてとても使いやすい。', ko: '겨울이나 비 오는 날에는 중간 지점으로 넣어 흐름을 바꾸기에 특히 좋다.' },
  ],
  gallery: [
    { ratio: 'panorama', title: { zh: '先读建筑轮廓', en: 'Start with the architectural outline', ja: 'まず建築の輪郭から', ko: '먼저 건축의 윤곽 읽기' }, caption: { zh: '先看建筑和庭院，后面的文物与展厅才会更容易接上苏州气质。', en: 'Reading the architecture first helps the collections connect back to Suzhou more clearly.', ja: '先に建築と庭院を読むことで、その後の展示が蘇州らしさへ自然につながる。', ko: '건축과 중정을 먼저 읽어야 그 뒤의 소장품도 쑤저우와 자연스럽게 이어진다.' }, src: resolveGardenGalleryImage(slug, 0, 'https://commons.wikimedia.org/wiki/Special:FilePath/Suzhou%20Museum%20%281%29.jpg') },
    { ratio: 'portrait', title: { zh: '几何与白墙', en: 'Geometry and White Walls', ja: '幾何と白壁', ko: '기하와 흰 담장' }, caption: { zh: '它的现代感并不是跳出来的，而是被苏州传统审美慢慢约束出来的。', en: 'Its modernity does not break from the city; it is shaped by Suzhou\'s older sense of restraint.', ja: 'この現代性は飛び出すのではなく、蘇州の伝統的な抑制のなかで整えられている。', ko: '이곳의 현대성은 튀어나오기보다 쑤저우 전통 미감의 절제 안에서 다듬어져 있다.' }, src: resolveGardenGalleryImage(slug, 1, 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1500&dpr=2&auto=format') },
    { ratio: 'landscape', title: { zh: '中庭让节奏慢下来', en: 'The central court slows the pace', ja: '中庭が歩調を落とす', ko: '중정이 리듬을 늦춘다' }, caption: { zh: '这里最好的地方之一，是它知道什么时候该把人从展柜前拉回空间里。', en: 'One of the museum\'s strengths is knowing when to pull you away from the cases and back into space itself.', ja: '展示だけでなく、空間へ意識を戻させるタイミングをこの建物はよく知っている。', ko: '이 박물관의 강점은 언제 전시장에서 시선을 떼고 공간으로 다시 돌려야 하는지를 잘 안다는 점이다.' }, src: resolveGardenGalleryImage(slug, 2, 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1800&dpr=2&auto=format') },
    { ratio: 'square', title: { zh: '适合接冬日路线', en: 'Fits a winter route naturally', ja: '冬のルートに馴染む', ko: '겨울 루트에 자연스럽게 스민다' }, caption: { zh: '在偏冷的天气里，它能自然接住园林路线的后半段。', en: 'On colder days, it naturally carries the second half of a route that began outdoors.', ja: '寒い日には、屋外から始まった流れの後半をとても自然に受け止めてくれる。', ko: '찬 날에는 바깥에서 시작된 루트의 후반부를 아주 자연스럽게 받아 준다.' }, src: resolveGardenGalleryImage(slug, 3, 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1500&dpr=2&auto=format') },
  ],
  relatedGardens: [
    { kicker: { zh: '先看园林', en: 'See a garden first', ja: '先に庭園へ', ko: '먼저 정원을 보기' }, label: { zh: '留园', en: 'Lingering Garden', ja: '留園', ko: '유원' }, description: { zh: '如果你想把园林和文博拼成一条更安静的线，留园很适合作为前一站。', en: 'If you want a quieter route linking garden and museum, Liuyuan makes an excellent first half.', ja: '庭園と博物館を静かな一本の線にしたいなら、留園を前半に置くのがよい。', ko: '정원과 박물관을 차분한 한 줄로 잇고 싶다면 유원을 앞부분에 두는 것이 좋다.' }, href: '/liu' },
    { kicker: { zh: '接回城市', en: 'Return to the city', ja: '街へ戻る', ko: '도시로 돌아가기' }, label: { zh: '平江路', en: 'Pingjiang Road', ja: '平江路', ko: '평강로' }, description: { zh: '如果你想把建筑与街巷继续串起来，可以从平江路慢慢把城市气质往外推开。', en: 'If you want to continue from architecture into the streets, Pingjiang Road extends that urban atmosphere outward.', ja: '建築から街路へつなぎたいなら、平江路が都市の気配をやわらかく引き継いでくれる。', ko: '건축에서 거리로 계속 이어가고 싶다면 평강로가 그 도시 분위기를 부드럽게 확장해 준다.' }, href: '/pingjiang-road' },
    { kicker: { zh: '回到首页', en: 'Back to Home', ja: 'ホームへ戻る', ko: '홈으로 돌아가기' }, label: { zh: '继续看四季首页', en: 'Return to Seasonal Home', ja: '四季ホームへ', ko: '사계절 홈으로' }, description: { zh: '回到首页后，可以继续按季节筛选更合适的路线。', en: 'Back on the home page, you can keep browsing routes by season.', ja: 'ホームに戻ると、季節別にもう少しルートを選び直せる。', ko: '홈으로 돌아가면 계절별로 더 잘 맞는 루트를 계속 고를 수 있다.' }, href: '/' },
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
