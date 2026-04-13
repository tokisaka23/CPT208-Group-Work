<script setup>
import { computed } from 'vue';
import GardenDetailPage from '../components/GardenDetailPage.vue';
import { resolveGardenGalleryImage, resolveGardenHeroImage } from '../data/gardenImages';
import { resolveLocalized, useLanguage } from '../i18n';

const { language } = useLanguage();
const slug = 'pingjiangroad';

const gardenSource = {
  mapSlug: slug,
  kicker: {
    zh: '苏州城市慢游主线',
    en: 'Suzhou\'s Slow Urban Spine',
    ja: '蘇州の街歩きの主線',
    ko: '쑤저우 도심 슬로우 여행의 중심선',
  },
  name: { zh: '平江路', en: 'Pingjiang Road', ja: '平江路', ko: '평강로' },
  englishName: 'Pingjiang Road',
  intro: {
    zh: '平江路很适合承接一整天的节奏。它不像园林那样把空间收得很紧，而是用河道、桥影、白墙和小店把苏州的城市气质慢慢铺开。',
    en: 'Pingjiang Road is perfect for holding together the rhythm of a full day. Instead of enclosing space like a garden, it opens Suzhou through canals, bridges, white walls, and small storefronts.',
    ja: '平江路は一日の歩調を受け止めるのに向いている。庭園のように空間を締めるのではなく、水路や橋、白壁、小さな店で蘇州の都市の気配をゆっくり広げていく。',
    ko: '평강로는 하루의 흐름을 받아내기에 좋은 길이다. 정원처럼 공간을 조이지 않고 수로와 다리, 흰 담장과 작은 가게들로 쑤저우의 도시 분위기를 천천히 펼쳐 놓는다.',
  },
  heroImage: resolveGardenHeroImage(slug, 'https://commons.wikimedia.org/wiki/Special:FilePath/Suzhou%20Pingjiang%20Road.jpg'),
  heroAlt: {
    zh: '平江路临水街巷景色',
    en: 'Waterside view of Pingjiang Road',
    ja: '平江路の水辺の街並み',
    ko: '평강로 수변 거리 풍경',
  },
  design: {
    variant: 'zhuozheng',
    accent: '#5B7368',
    accentRgb: '91, 115, 104',
    secondary: '#C18A5A',
    secondaryRgb: '193, 138, 90',
    watermark: { zh: '河', en: 'Canal', ja: '川', ko: '강' },
    heroImagePosition: 'center 52%',
    heroQuote: {
      zh: '先沿河认方向，再向支巷慢慢散开。',
      en: 'Read the canal first, then drift into the side lanes.',
      ja: 'まず川沿いで方向をつかみ、そのあと支巷へゆっくり散っていく。',
      ko: '먼저 강을 따라 방향을 읽고, 그다음 옆 골목으로 천천히 퍼져 나간다.',
    },
    heroCaption: {
      zh: '平江路适合在四季里反复回来，看同一条河街如何换出不同的气质。',
      en: 'Pingjiang Road rewards return visits across the seasons, each time changing the mood of the same canal street.',
      ja: '平江路は季節を変えて何度も戻る価値があり、同じ河街が毎回違う表情を見せる。',
      ko: '평강로는 계절을 달리해 다시 올 가치가 있다. 같은 수로 거리도 매번 다른 분위기를 보여 준다.',
    },
    galleryTitle: {
      zh: '横向展开: 河街、桥影与慢节奏',
      en: 'Unfolded Sideways: Canal Street, Bridges, and Slow Rhythm',
      ja: '横に開く河街と橋の影',
      ko: '가로로 펼쳐지는 수로 거리와 다리 그림자',
    },
    galleryIntro: {
      zh: '这里的精彩不靠单一打卡点，而是靠连续步行把气质一点点积起来。',
      en: 'Its charm does not rely on one landmark. It builds through continuous walking and accumulated atmosphere.',
      ja: 'ここは一つの名所で決まる場所ではない。歩き続けるうちに気配が少しずつ積み上がっていく。',
      ko: '이 길의 매력은 한 지점에서 완성되지 않는다. 계속 걸을수록 분위기가 조금씩 쌓인다.',
    },
    highlightIntro: {
      zh: '平江路最值得看的不是“有没有打卡点”，而是苏州的城市感怎样在河边一点点展开。',
      en: 'What matters here is not whether there is a landmark to check off, but how Suzhou unfolds slowly along the water.',
      ja: '大切なのは「どこを打刻するか」ではなく、蘇州の都市感覚が水辺でどうほどけていくかだ。',
      ko: '여기서 중요한 것은 체크포인트가 아니라 쑤저우의 도시감이 물가에서 어떻게 서서히 펼쳐지는가이다.',
    },
    stepperIntro: {
      zh: '先顺着主河走，再拐进支巷，最后把停留留给桥边和傍晚。',
      en: 'Follow the main canal first, then enter the side lanes, and save your longest pause for the bridges near dusk.',
      ja: 'まず主河に沿って歩き、次に支巷へ入り、最後の滞在は橋のそばの夕方に残す。',
      ko: '먼저 주 운하를 따라 걷고, 다음에 옆 골목으로 들어가며, 가장 긴 머묾은 해질녘 다리 곁에 남겨 둔다.',
    },
    tipsTitle: {
      zh: '古街慢游',
      en: 'Slow Walk Through the Old Street',
      ja: '古街のゆっくり歩き',
      ko: '옛 거리 슬로우 워크',
    },
    tipsIntro: {
      zh: '平江路不需要塞得太满，桥、水声和傍晚本身就值得被留出时间。',
      en: 'Pingjiang Road does not need an overloaded itinerary. The bridges, water sounds, and evening light already deserve their own time.',
      ja: '平江路は予定を詰め込まなくてよい。橋と水音、夕方そのものに時間を残す価値がある。',
      ko: '평강로는 일정으로 꽉 채울 필요가 없다. 다리와 물소리, 저녁 그 자체에 시간을 남겨둘 가치가 있다.',
    },
  },
  backHref: '/',
  badges: [
    { zh: '四季都能走', en: 'Works in every season', ja: '四季とも歩ける', ko: '사계절 모두 좋다' },
    { zh: '适合做路线收尾', en: 'Ideal final stop', ja: '締めに向く', ko: '마무리로 좋다' },
    { zh: '白天夜晚气质不同', en: 'Changes from day to night', ja: '昼と夜で表情が変わる', ko: '낮과 밤의 분위기가 다르다' },
  ],
  facts: [
    { label: { zh: '推荐停留', en: 'Suggested stay', ja: 'おすすめ滞在', ko: '추천 체류' }, value: { zh: '1.5 - 3 小时', en: '1.5-3 hours', ja: '1.5-3時間', ko: '1.5-3시간' } },
    { label: { zh: '核心看点', en: 'What to notice', ja: '見るポイント', ko: '핵심 포인트' }, value: { zh: '河街、桥影、支巷与夜色', en: 'Canal street, bridge shadows, side lanes, evening light', ja: '河街、橋影、支巷、夜景', ko: '수로 거리, 다리 그림자, 골목, 야경' } },
    { label: { zh: '最佳时段', en: 'Best timing', ja: 'おすすめ時間', ko: '추천 시간대' }, value: { zh: '傍晚到入夜前后', en: 'Late afternoon into evening', ja: '夕方から夜の入り口', ko: '늦은 오후부터 초저녁' } },
    { label: { zh: '适合人群', en: 'Best for', ja: '向いている人', ko: '어울리는 사람' }, value: { zh: '喜欢慢走和城市气氛的人', en: 'Anyone who likes slower urban wandering', ja: 'ゆっくり街の気配を味わいたい人', ko: '천천히 도시 분위기를 걷고 싶은 사람' } },
  ],
  highlights: [
    { title: { zh: '它负责把苏州的整体气质打开', en: 'It opens Suzhou as a whole', ja: '蘇州全体の気配を開く', ko: '쑤저우 전체의 분위기를 연다' }, description: { zh: '如果园林像精读页，平江路更像目录页。先在这里建立对白墙、河街关系和城市节奏的感觉，后面再去园林会更顺。', en: 'If the gardens are the close reading, Pingjiang Road is the table of contents. It gives you the city\'s relationship between white walls, canals, and everyday rhythm before the deeper pages.', ja: '庭園が精読のページだとすれば、平江路は目次のような存在だ。白壁と河街、都市の歩調をここでつかむと、その後の庭園も読みやすくなる。', ko: '정원이 정독의 페이지라면 평강로는 목차에 가깝다. 흰 담장과 수로, 도시의 일상 리듬을 여기서 먼저 잡아 두면 이후의 정원도 훨씬 잘 읽힌다.' } },
    { title: { zh: '四季都有不同的停留理由', en: 'Every season offers a different reason to stay', ja: '季節ごとに立ち止まる理由がある', ko: '계절마다 머무를 이유가 다르다' }, description: { zh: '春天看柳，夏天看晚风和灯影，秋天看收束后的清爽，冬天看白墙和安静水面，所以它很适合作为固定路线节点。', en: 'Spring willow, summer breeze, autumn calm, and winter quiet water all make Pingjiang Road a dependable route anchor.', ja: '春の柳、夏の夕風、秋の収まり、冬の白壁と静かな水面。それぞれが平江路に違う立ち止まり方をくれる。', ko: '봄의 버들, 여름의 저녁 바람, 가을의 차분함, 겨울의 흰 담장과 고요한 수면이 평강로를 사계절 내내 믿을 수 있는 축으로 만든다.' } },
    { title: { zh: '它很适合做一天的最后一段', en: 'It makes an excellent final stretch', ja: '一日の最後に向く', ko: '하루의 마지막 구간으로 좋다' }, description: { zh: '很多景点看完之后，真正把一天收住的往往不是再赶下一个点，而是在平江路沿河慢慢走完最后一段。', en: 'After other sights, the real ending often comes not from one more stop, but from a slow final walk here.', ja: 'あちこち見終えたあと、一日を締めるのは次の名所ではなく、平江路での最後の川沿いの歩きだったりする。', ko: '여러 곳을 다 본 뒤 하루를 마무리하는 것은 또 다른 명소가 아니라, 평강로에서의 마지막 느린 강변 산책일 때가 많다.' } },
  ],
  itinerary: [
    { title: { zh: '第一段: 先沿主河走一遍', en: 'First: walk the main canal once', ja: '第一段: まず主河を一周', ko: '1단계: 먼저 주 운하를 따라 한 바퀴' }, description: { zh: '不要急着进店或拍照，先沿河走一遍，把方向和整体气质认下来。', en: 'Do not rush into shops or photos yet. Walk the canal once to read the direction and overall mood.', ja: '店や写真に急がず、まず川沿いを一度歩いて方向と全体の気配をつかむ。', ko: '가게나 사진에 서두르지 말고, 먼저 강가를 한 바퀴 걸으며 방향과 전체 분위기를 읽는다.' } },
    { title: { zh: '第二段: 再挑一两条支巷进去', en: 'Second: choose one or two side lanes', ja: '第二段: 支巷へ一本か二本', ko: '2단계: 골목 한두 곳으로 들어가기' }, description: { zh: '知道主线以后，再往支巷散开，平江路的层次才会变得更明显。', en: 'Once the main line is clear, the side lanes reveal how many quieter layers the district holds.', ja: '主線が見えたあとに支巷へ入ると、平江路の層の多さがよくわかる。', ko: '주 흐름을 파악한 뒤 골목으로 들어가야 평강로의 층위가 더 선명하게 드러난다.' } },
    { title: { zh: '第三段: 把最慢的时间留给桥边', en: 'Third: save your slowest time for the bridges', ja: '第三段: 一番ゆっくりした時間を橋のそばに', ko: '3단계: 가장 느린 시간을 다리 곁에 남기기' }, description: { zh: '到了傍晚，桥影、灯色和水面会一起接上，特别适合做收尾。', en: 'At dusk, bridge shadows, lights, and water connect all at once, making the ending feel complete.', ja: '夕方になると橋影と灯り、水面がひとつにつながり、締めとしてとてもきれいにまとまる。', ko: '해질녘이 되면 다리 그림자와 불빛, 수면이 한 번에 이어지며 하루의 끝을 완성해 준다.' } },
  ],
  tips: [
    { zh: '如果当天已经安排了园林或博物馆，可以把平江路放在前后任意一端做节奏转换。', en: 'If you already have a garden or museum that day, Pingjiang Road works well before or after it as a rhythm shift.', ja: 'その日に庭園や博物館が入っているなら、平江路は前後どちらに置いても歩調の切り替えとして機能する。', ko: '그날 정원이나 박물관 일정이 있다면 평강로는 앞이나 뒤 어느 쪽에 두어도 리듬 전환 구간으로 잘 작동한다.' },
    { zh: '这里更适合边走边看，不适合把所有时间都花在一间店里。', en: 'This street rewards movement more than staying too long in any single shop.', ja: 'ここは一軒に長く留まるより、歩きながら気配を拾っていくほうが合っている。', ko: '이 거리는 한 가게에 오래 머무르기보다 걸으며 분위기를 모아 가는 편이 더 잘 맞는다.' },
    { zh: '想拍照的话，桥边、转角和靠水的白墙往往比最热闹的位置更耐看。', en: 'For photos, bridges, corners, and white walls by the water are often stronger than the busiest spots.', ja: '写真を撮るなら、人の多い場所より橋のそばや曲がり角、水辺の白壁のほうが長く見返せる。', ko: '사진은 가장 붐비는 곳보다 다리 옆, 모퉁이, 물가의 흰 담장이 더 오래 남는다.' },
  ],
  gallery: [
    { ratio: 'panorama', title: { zh: '先沿河看整体', en: 'Take in the whole canal first', ja: 'まず河沿いで全体を見る', ko: '먼저 강을 따라 전체를 보기' }, caption: { zh: '平江路最先给人的不是细节，而是一整条临水旧街的气质。', en: 'Before the details arrive, you feel the full character of a long old street by the water.', ja: '細部より先に、水辺の古い街並み全体の気配が届いてくる。', ko: '세부보다 먼저 물가의 긴 옛 거리 전체의 분위기가 다가온다.' }, src: resolveGardenGalleryImage(slug, 0, 'https://commons.wikimedia.org/wiki/Special:FilePath/Suzhou%20Pingjiang%20Road.jpg') },
    { ratio: 'portrait', title: { zh: '桥边最适合停顿', en: 'Bridges are made for pauses', ja: '橋のそばで立ち止まる', ko: '다리 곁에서 멈추기' }, caption: { zh: '真正适合停下来的位置，往往在桥边和转角，而不是人最多的正中。', en: 'The best pause points are often at bridges and corners rather than in the middle of the crowd.', ja: '立ち止まりたくなる場所は、人の流れの中心より橋のそばや曲がり角に多い。', ko: '정말 멈추고 싶은 지점은 사람들 한가운데보다 다리 곁과 모퉁이에 더 많다.' }, src: resolveGardenGalleryImage(slug, 1, 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1400&dpr=2&auto=format') },
    { ratio: 'landscape', title: { zh: '傍晚灯影慢慢接上', en: 'Evening light gathers slowly', ja: '夕方の灯りがゆっくりつながる', ko: '저녁 불빛이 천천히 이어진다' }, caption: { zh: '到了偏晚的时候，平江路才会把最完整的一层氛围给出来。', en: 'Late in the day, Pingjiang Road reveals its fullest atmosphere.', ja: '日が傾くころ、平江路はようやく一番整った空気を見せてくれる。', ko: '날이 기울 무렵이 되어서야 평강로는 가장 완성된 분위기를 내어 준다.' }, src: resolveGardenGalleryImage(slug, 2, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1800&dpr=2&auto=format') },
    { ratio: 'square', title: { zh: '白墙水面最见苏州', en: 'White wall and water make Suzhou visible', ja: '白壁と水面に蘇州が見える', ko: '흰 담장과 수면에서 쑤저우가 보인다' }, caption: { zh: '就算什么都不做，只是沿河慢慢走过，苏州的城市气质也已经很完整。', en: 'Even if you do nothing but keep walking, the city already feels fully present.', ja: '何かをしなくても、川沿いを歩くだけで蘇州の街の気配は十分に伝わってくる。', ko: '무언가를 하지 않아도 강을 따라 걷기만 하면 쑤저우의 도시감이 충분히 전해진다.' }, src: resolveGardenGalleryImage(slug, 3, 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1500&dpr=2&auto=format') },
  ],
  relatedGardens: [
    { kicker: { zh: '先看园林', en: 'Begin with a garden', ja: 'まず庭園へ', ko: '먼저 정원으로' }, label: { zh: '拙政园', en: 'Humble Administrator\'s Garden', ja: '拙政園', ko: '졸정원' }, description: { zh: '如果你想从水巷转入更典型的苏州园林，拙政园是很顺的一站。', en: 'If you want to move from canal lanes into a classic Suzhou garden, Zhuozhengyuan is the smoothest next step.', ja: '水巷から典型的な蘇州庭園へ移るなら、拙政園が最も自然につながる。', ko: '수로 골목에서 전형적인 쑤저우 정원으로 넘어가고 싶다면 졸정원이 가장 자연스럽다.' }, href: '/zhuozheng' },
    { kicker: { zh: '秋日收束', en: 'Autumn follow-up', ja: '秋の次の一歩', ko: '가을 이어가기' }, label: { zh: '天平山', en: 'Tianping Mountain', ja: '天平山', ko: '천평산' }, description: { zh: '如果你在秋天安排路线，可以先去看枫叶，再回平江路收尾。', en: 'In autumn, try Tianping Mountain first and return here to close the day.', ja: '秋なら天平山で紅葉を見て、そのあと平江路へ戻る流れがきれいだ。', ko: '가을이라면 천평산에서 단풍을 보고 이곳으로 돌아와 마무리하는 흐름이 좋다.' }, href: '/tianping' },
    { kicker: { zh: '回到首页', en: 'Back to Home', ja: 'ホームへ戻る', ko: '홈으로 돌아가기' }, label: { zh: '继续看四季首页', en: 'Return to Seasonal Home', ja: '四季ホームへ', ko: '사계절 홈으로' }, description: { zh: '回到首页后，可以继续按季节挑选更适合你的苏州路线。', en: 'Back on the home page, you can keep browsing routes by season.', ja: 'ホームに戻ると、季節ごとのルートをもう少し選び直せる。', ko: '홈으로 돌아가면 계절별로 더 어울리는 루트를 다시 고를 수 있다.' }, href: '/' },
  ],
  nextGarden: {
    label: { zh: '苏州博物馆', en: 'Suzhou Museum', ja: '蘇州博物館', ko: '쑤저우 박물관' },
    href: '/suzhou-museum',
  },
};

const garden = computed(() => resolveLocalized(gardenSource, language.value));
</script>

<template>
  <GardenDetailPage :garden="garden" />
</template>
