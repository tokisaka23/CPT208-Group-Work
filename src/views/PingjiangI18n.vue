<script setup>
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import InkCard from '../components/InkCard.vue';
import zhuozhengyuanHeroImage from '../assets/gardens/zhuozhengyuan.jpg';
import liuyuan1Image from '../assets/gardens/liuyuan1.jpg';
import pingjiangroadHeroImage from '../assets/gardens/pingjiangroad-hero.jpg';
import suzhoumuseumHeroImage from '../assets/gardens/suzhoumuseum-hero.jpg';
import tianpingshanHeroImage from '../assets/gardens/tianpingshan-hero.jpg';
import wangshiyuan1Image from '../assets/gardens/wangshiyuan1.jpg';
import suxianrouyuebingImage from '../assets/seasonal/suxianrouyuebing.jpg';
import sushilvdoutangImage from '../assets/seasonal/sushilvdoutang.jpg';
import xiefenxiaolongImage from '../assets/seasonal/xiefenxiaolong.jpg';
import cangshuyangrouImage from '../assets/seasonal/cangshuyangrou.jpg';
import { resolveLocalized, useLanguage } from '../i18n';

const { language } = useLanguage();
const activeSeasonKey = ref('autumn');

const seasonImageMap = {
  spring: { poster: zhuozhengyuanHeroImage, route: zhuozhengyuanHeroImage, street: pingjiangroadHeroImage, food: suxianrouyuebingImage },
  summer: { poster: wangshiyuan1Image, route: wangshiyuan1Image, street: pingjiangroadHeroImage, food: sushilvdoutangImage },
  autumn: { poster: tianpingshanHeroImage, route: tianpingshanHeroImage, street: pingjiangroadHeroImage, food: xiefenxiaolongImage },
  winter: { poster: suzhoumuseumHeroImage, route: liuyuan1Image, street: suzhoumuseumHeroImage, food: cangshuyangrouImage },
};

const pageSource = {
  seasonLabel: { zh: '四季切换', en: 'Season Picks', ja: '季節の切り替え', ko: '계절 선택' },
  routeEyebrow: { zh: '四季首页', en: 'Seasonal Home', ja: '四季ホーム', ko: '사계절 홈' },
  foodEyebrow: { zh: '时令小吃', en: 'Seasonal Food', ja: '季節の味', ko: '계절 음식' },
  chapterEyebrow: { zh: '慢游章节', en: 'Slow Travel Chapters', ja: 'ゆっくり巡る章', ko: '슬로우 트래블 챕터' },
  chapterTitle: { zh: '从首页出发，把苏州的园林、文博与市井分成几页慢慢看。', en: 'Start here, then move through gardens, museums, and street life one chapter at a time.', ja: 'トップページから始めて、庭園と博物館、街の暮らしを章ごとにゆっくり辿る。', ko: '홈페이지에서 출발해 정원, 박물관, 골목의 생활을 장마다 천천히 읽어본다.' },
  chapterLead: { zh: '首页先给你路线感和季节感，后面的独立页面再把每一种气质慢慢展开。', en: 'The home page gives you rhythm and season first. The independent pages then unfold each mood in more detail.', ja: 'ホームページでは季節と巡り方の手がかりをつかみ、各ページでその気配を詳しく読む。', ko: '홈페이지에서는 계절감과 동선을 먼저 잡고, 개별 페이지에서 각 분위기를 더 깊게 본다.' },
  rhythmEyebrow: { zh: '街巷节奏', en: 'Rhythm Of The Street', ja: '街路のリズム', ko: '거리의 리듬' },
  rhythmTitle: { zh: '一天之内，平江路的气息会沿着河岸慢慢换调。', en: 'Across a single day, Pingjiang Road changes tone slowly along the canal edge.', ja: '一日のなかで、平江路の空気は川沿いにゆっくり調子を変えていく。', ko: '하루 안에서도 평강로의 분위기는 물가를 따라 천천히 바뀐다.' },
  chapterCards: [
    { title: { zh: '古典园林', en: 'Classical Gardens', ja: '古典庭園', ko: '고전 정원' }, eyebrow: { zh: '借景与层次', en: 'Borrowed Views', ja: '借景と層', ko: '차경과 층위' }, badge: { zh: '慢下来最有收获', en: 'Best at a slower pace', ja: 'ゆっくり見るほどよい', ko: '천천히 볼수록 좋다' }, description: { zh: '从拙政园、留园和网师园开始，去看苏州园林怎样用回廊、水院和框景安排观看节奏。', en: 'Start with Zhuozhengyuan, Liuyuan, and Wangshiyuan to see how Suzhou gardens shape rhythm through corridors, water courts, and framed views.', ja: '拙政園、留園、網師園から入り、回廊、水庭、額景で視線の歩調をどう組むかを読む。', ko: '졸정원, 유원, 망사원에서 시작해 회랑, 수원, 프레임으로 시선의 리듬을 어떻게 짜는지 본다.' }, path: '/gardens', image: zhuozhengyuanHeroImage },
    { title: { zh: '文博殿堂', en: 'Museums', ja: '博物館', ko: '박물관' }, eyebrow: { zh: '建筑与记忆', en: 'Architecture & Memory', ja: '建築と記憶', ko: '건축과 기억' }, badge: { zh: '适合冬天与雨天', en: 'Perfect for winter', ja: '冬や雨の日に合う', ko: '겨울과 비 오는 날에 좋다' }, description: { zh: '苏州博物馆和昆曲博物馆把这座城市的审美、声音与建筑脉络接在了一起。', en: 'Suzhou Museum and the Kunqu Museum connect the city\'s architecture, soundscape, and cultural memory.', ja: '蘇州博物館と昆曲博物館は、この街の建築、美意識、音の記憶をつないでくれる。', ko: '쑤저우 박물관과 곤곡 박물관은 이 도시의 건축, 미감, 소리의 기억을 이어준다.' }, path: '/museums', image: suzhoumuseumHeroImage },
    { title: { zh: '非遗市井', en: 'Living Heritage', ja: '暮らしの遺産', ko: '생활 유산' }, eyebrow: { zh: '吃、听、走、带走', en: 'Eat, Hear, Wander', ja: '食べる、聴く、歩く', ko: '먹고 듣고 걷기' }, badge: { zh: '最接近日常苏州', en: 'Closest to daily Suzhou', ja: '日常の蘇州に近い', ko: '가장 일상적인 쑤저우' }, description: { zh: '街巷深处的评弹、面点、手作和小店，会把平江路真正的烟火气慢慢交给你。', en: 'Storytelling halls, noodles, handmade goods, and small shops slowly reveal the lived texture of Pingjiang Road.', ja: '路地の評弾、麺、手仕事、小さな店が、平江路の暮らしの温度を少しずつ手渡してくれる。', ko: '골목 안의 평탄, 면요리, 수공예, 작은 가게들이 평강로의 생활 온도를 천천히 건네준다.' }, path: '/heritage', image: pingjiangroadHeroImage },
  ],
  rhythms: [
    { title: { zh: '清晨', en: 'Morning', ja: '朝', ko: '아침' }, text: { zh: '店门刚开，河面安静，最适合先用脚步认方向。', en: 'When the shops first open and the canal is still quiet, it is easiest to orient yourself by walking.', ja: '店が開きはじめ、川面が静かな時間は、まず足で方向をつかむのに向いている。', ko: '가게 문이 막 열리고 수면이 고요한 시간은 먼저 걸으며 방향을 잡기 좋다.' } },
    { title: { zh: '午后', en: 'Afternoon', ja: '午後', ko: '오후' }, text: { zh: '人流会渐渐变密，这时更适合钻进支巷、茶馆和小店。', en: 'As the crowd thickens, it is a better time to slip into side lanes, tea houses, and smaller shops.', ja: '人が増えてきたら、支巷や茶館、小さな店へ入りこむほうが心地よい。', ko: '사람이 많아질수록 골목 안의 찻집과 작은 가게로 들어가는 편이 더 좋다.' } },
    { title: { zh: '傍晚', en: 'Dusk', ja: '夕方', ko: '해질녘' }, text: { zh: '灯影和水声会把节奏重新放慢，是最适合收尾的一段。', en: 'Light reflections and water sound slow everything down again, making dusk the best closing stretch.', ja: '灯りの影と水の音が歩調をもう一度ゆるめ、締めの時間として最もよく似合う。', ko: '불빛과 물소리가 리듬을 다시 늦춰 주기 때문에 해질녘이 가장 좋은 마무리 구간이 된다.' } },
  ],
  seasons: {
    spring: { key: 'spring', label: { zh: '春', en: 'Spring', ja: '春', ko: '봄' }, title: { zh: '先看园林新绿，再顺着水巷把苏州慢慢打开。', en: 'Begin with fresh green gardens, then let the canal lanes open Suzhou slowly.', ja: '庭園の若葉から始めて、水路の街並みへと蘇州をゆっくり開いていく。', ko: '정원의 새잎에서 시작해 수로 골목을 따라 쑤저우를 천천히 펼친다.' }, lead: { zh: '三四月适合把拙政园、留园和平江路串成一条轻一点、慢一点的春游线。', en: 'March and April are perfect for linking Zhuozhengyuan, Liuyuan, and Pingjiang Road into a gentle spring route.', ja: '3月から4月は、拙政園、留園、平江路を軽やかな春の流れとしてつなぐのに向いている。', ko: '3월과 4월은 졸정원, 유원, 평강로를 부드러운 봄 동선으로 잇기에 가장 좋다.' }, primary: { label: { zh: '去看春日园林', en: 'See Spring Gardens', ja: '春の庭園へ', ko: '봄 정원 보기' }, to: '/gardens' }, secondary: { label: { zh: '回到水巷散步', en: 'Walk the Canal Lanes', ja: '水巷へ戻る', ko: '수로 골목 걷기' }, to: '/pingjiang-road' }, routeTitle: { zh: '春天适合先入园，再回水巷收住节奏。', en: 'In spring, enter the gardens first, then gather the rhythm back along the canal.', ja: '春は先に庭へ入り、そのあと水巷へ戻ると歩調が整う。', ko: '봄에는 먼저 정원에 들어가고, 그다음 수로 골목으로 돌아오면 흐름이 자연스럽다.' }, routeLead: { zh: '把花木、白墙和水声放进同一条轻柔的线路里。', en: 'Let flowers, white walls, and water sounds share one gentle route.', ja: '花、白壁、水の音をひとつのやわらかな流れにまとめる。', ko: '꽃, 흰 담장, 물소리를 한 줄의 부드러운 동선에 담는다.' }, foodTitle: { zh: '边走边吃一点春天', en: 'Small spring bites on the way', ja: '歩きながら春を少し', ko: '걸으며 먹는 봄의 맛' }, foodText: { zh: '酥香月饼和轻一点的春味，很适合放在园林与水巷之间。', en: 'Flaky pastries and lighter spring flavors work beautifully between gardens and canals.', ja: '軽い春の味と香ばしい菓子は、庭園と水巷のあいだにちょうどよい。', ko: '가벼운 봄맛과 고소한 과자는 정원과 수로 사이에 잘 어울린다.' } },
    summer: { key: 'summer', label: { zh: '夏', en: 'Summer', ja: '夏', ko: '여름' }, title: { zh: '看荷风、水院与夜色，把清凉感放进夏天的路线里。', en: 'Read lotus breeze, water courts, and night scenes into your summer route.', ja: '蓮の風と水庭、夜の気配で夏の蘇州を涼しくたどる。', ko: '연꽃 바람과 수원, 야경으로 여름의 서늘함을 동선 안에 넣는다.' }, lead: { zh: '夏天更适合把路线缩短一些，把上午和傍晚留给最舒服的时段。', en: 'Summer works better with shorter routes and more deliberate timing around the cooler hours.', ja: '夏は行程を少し短くして、午前と夕方の心地よい時間を活かすほうがよい。', ko: '여름에는 동선을 조금 짧게 잡고 오전과 저녁의 편한 시간을 살리는 편이 좋다.' }, primary: { label: { zh: '去看夏日园林', en: 'See Summer Gardens', ja: '夏の庭園へ', ko: '여름 정원 보기' }, to: '/gardens' }, secondary: { label: { zh: '看夜色与市井', en: 'See Night Street Life', ja: '夜の街へ', ko: '야간 거리 보기' }, to: '/heritage' }, routeTitle: { zh: '白天看荷与水，晚上去看苏州的另一面。', en: 'See lotus and water by day, then switch to Suzhou\'s night mood.', ja: '昼は蓮と水を見て、夜は蘇州のもう一つの表情へ。', ko: '낮에는 연꽃과 물을 보고, 밤에는 쑤저우의 다른 얼굴로 넘어간다.' }, routeLead: { zh: '夏天更讲究时段，不必把体力都耗在正午。', en: 'In summer, timing matters more than distance. Do not spend all your energy at noon.', ja: '夏は距離より時間帯が大切で、真昼に力を使い切らないほうがよい。', ko: '여름에는 거리보다 시간대가 더 중요하다. 한낮에 힘을 다 쓰지 않는 편이 좋다.' }, foodTitle: { zh: '夏天需要一口清凉', en: 'A cooling bite for summer', ja: '夏に欲しいひと口の涼', ko: '여름에 필요한 한입의 시원함' }, foodText: { zh: '绿豆汤这种轻一点的补给，比重口味更适合接夜游。', en: 'Cooling bowls like mung bean soup fit evening wandering better than heavier meals.', ja: '緑豆湯のような軽い補給は、夜歩きへ切り替える前にちょうどよい。', ko: '녹두탕처럼 가벼운 보충이 밤 산책으로 넘어가기 전에 잘 맞는다.' } },
    autumn: { key: 'autumn', label: { zh: '秋', en: 'Autumn', ja: '秋', ko: '가을' }, title: { zh: '先去天平山看枫叶，再把园林和古街的秋意接起来。', en: 'Start with the maples of Tianping Mountain, then connect that autumn mood back to gardens and old streets.', ja: 'まず天平山の紅葉へ行き、その秋の気配を庭園と古い街路へつないでいく。', ko: '먼저 천평산의 단풍을 보고, 그 가을 분위기를 정원과 옛 거리로 이어간다.' }, lead: { zh: '秋天不必排太满，最完整的路线往往是“天平山 + 一处园林 + 一段古街”。', en: 'Autumn does not need a packed schedule. The most satisfying route is often Tianping Mountain plus one garden and one old street.', ja: '秋は詰め込みすぎないほうがよい。天平山に一つの庭園、一筋の古街を合わせるだけで十分にまとまる。', ko: '가을에는 일정을 너무 꽉 채울 필요가 없다. 천평산에 정원 하나, 옛 거리 한 구간이면 충분히 완성도가 높다.' }, primary: { label: { zh: '查看天平山', en: 'See Tianping', ja: '天平山へ', ko: '천평산 보기' }, to: '/tianping' }, secondary: { label: { zh: '回到平江路收尾', en: 'Finish on Pingjiang', ja: '平江路へ戻る', ko: '평강로로 마무리' }, to: '/pingjiang-road' }, routeTitle: { zh: '秋天的重点不是多，而是把最鲜明的季节感和更安静的空间接起来。', en: 'Autumn is less about quantity and more about connecting bold seasonal color with calmer spaces.', ja: '秋は数を回るより、強い季節感を静かな空間へつないでいくことが大切だ。', ko: '가을은 많이 보는 것보다 강한 계절감과 조용한 공간을 이어주는 것이 중요하다.' }, routeLead: { zh: '先去看山上的颜色，再把情绪收回到留园或平江路。', en: 'See the mountain color first, then gather the mood back in Liuyuan or Pingjiang Road.', ja: 'まず山の色を見て、そのあと留園や平江路へ戻る。', ko: '먼저 산의 색을 보고, 그다음 유원이나 평강로로 돌아온다.' }, foodTitle: { zh: '秋天适合热一点、鲜一点', en: 'Autumn wants warmth and richness', ja: '秋は少し熱く、少し濃く', ko: '가을에는 조금 더 뜨겁고 진하게' }, foodText: { zh: '蟹粉小笼这样的鲜味，和红叶路线会很搭。', en: 'Richer flavors like crab roe dumplings pair beautifully with an autumn day.', ja: '蟹粉小籠のような濃い旨みは、紅葉の一日によく似合う。', ko: '게알 샤오롱바오 같은 진한 맛은 단풍 코스와 잘 어울린다.' } },
    winter: { key: 'winter', label: { zh: '冬', en: 'Winter', ja: '冬', ko: '겨울' }, title: { zh: '看白墙、枯枝与安静水面，冬天会把空间骨相慢慢显出来。', en: 'White walls, bare branches, and still water reveal the bones of space in winter.', ja: '白壁と枯れ枝、静かな水面が、冬になると空間の骨格を浮かび上がらせる。', ko: '흰 담장, 마른 가지, 고요한 수면이 겨울에 공간의 뼈대를 드러낸다.' }, lead: { zh: '冬天不必追求热闹，更适合看结构、比例和室内外之间的切换。', en: 'Winter is less about bustle and more about structure, proportion, and transitions between indoors and out.', ja: '冬は賑わいより、構造や比率、内外の切り替わりを見るのに向いている。', ko: '겨울은 붐빔보다 구조와 비례, 실내외 전환을 보는 데 더 잘 맞는다.' }, primary: { label: { zh: '看冬日园林', en: 'See Winter Gardens', ja: '冬の庭園へ', ko: '겨울 정원 보기' }, to: '/gardens' }, secondary: { label: { zh: '接进博物馆路线', en: 'Add Museum Stops', ja: '博物館へつなぐ', ko: '박물관으로 잇기' }, to: '/suzhou-museum' }, routeTitle: { zh: '冬天最适合把园林和文博放在一起，走一条更安静的线。', en: 'Winter is ideal for pairing gardens with museums in a quieter route.', ja: '冬は庭園と博物館をひとつの静かな流れにまとめるのが似合う。', ko: '겨울에는 정원과 박물관을 한 줄의 조용한 동선으로 묶는 편이 좋다.' }, routeLead: { zh: '不用铺得太开，留园和苏州博物馆这样的点就已经足够。', en: 'You do not need many stops. Liuyuan and Suzhou Museum already form a complete winter rhythm.', ja: '広げすぎなくてよい。留園と蘇州博物館だけでも冬の流れは十分に整う。', ko: '너무 많이 펼칠 필요가 없다. 유원과 쑤저우 박물관만으로도 겨울의 흐름은 충분히 완성된다.' }, foodTitle: { zh: '冬天要把热气留住', en: 'Keep some warmth for winter', ja: '冬は熱を残したい', ko: '겨울에는 따뜻함을 남기기' }, foodText: { zh: '羊肉汤这种热气很足的收尾，最适合安静路线之后。', en: 'A warming lamb soup fits perfectly after a quieter winter route.', ja: '静かな冬の歩き方のあとには、羊肉湯のような熱い締めがよく合う。', ko: '차분한 겨울 동선 뒤에는 양고기탕 같은 따뜻한 마무리가 가장 잘 맞는다.' } },
  },
};

const pageText = computed(() => resolveLocalized(pageSource, language.value));
const seasonTabs = computed(() => Object.values(pageText.value.seasons).map((season) => ({ key: season.key, label: season.label })));
const activeSeason = computed(() => {
  const season = pageText.value.seasons[activeSeasonKey.value] || pageText.value.seasons.autumn;
  return {
    ...season,
    posterImage: seasonImageMap[season.key].poster,
    routeImage: seasonImageMap[season.key].route,
    streetImage: seasonImageMap[season.key].street,
    foodImage: seasonImageMap[season.key].food,
  };
});
const chapterCards = computed(() => pageText.value.chapterCards);
</script>

<template>
  <div class="page-shell pingjiang-page">
    <section class="pingjiang-hero" :style="{ '--hero-image': `url(${activeSeason.posterImage})` }">
      <div class="pingjiang-hero__content">
        <div class="pingjiang-hero__main">
          <p class="eyebrow">{{ activeSeason.label }}</p>
          <h1>{{ activeSeason.title }}</h1>
          <p class="hero-lead">{{ activeSeason.lead }}</p>
          <div class="hero-actions">
            <RouterLink :to="activeSeason.primary.to" class="button-primary">{{ activeSeason.primary.label }}</RouterLink>
            <RouterLink :to="activeSeason.secondary.to" class="button-ghost">{{ activeSeason.secondary.label }}</RouterLink>
          </div>
        </div>
        <aside class="season-switcher">
          <p>{{ pageText.seasonLabel }}</p>
          <button v-for="item in seasonTabs" :key="item.key" type="button" :class="{ active: activeSeasonKey === item.key }" @click="activeSeasonKey = item.key">{{ item.label }}</button>
        </aside>
      </div>
    </section>

    <section class="section-block route-panel">
      <div class="section-header section-header--compact">
        <div>
          <p class="eyebrow">{{ pageText.routeEyebrow }}</p>
          <h2 class="section-title">{{ activeSeason.routeTitle }}</h2>
          <p class="section-lead">{{ activeSeason.routeLead }}</p>
        </div>
      </div>
      <div class="season-grid">
        <article class="season-card">
          <img :src="activeSeason.routeImage" :alt="activeSeason.label" />
          <div>
            <strong>{{ activeSeason.primary.label }}</strong>
            <p>{{ activeSeason.lead }}</p>
          </div>
        </article>
        <article class="season-card">
          <img :src="activeSeason.streetImage" :alt="activeSeason.secondary.label" />
          <div>
            <strong>{{ activeSeason.secondary.label }}</strong>
            <p>{{ activeSeason.routeTitle }}</p>
          </div>
        </article>
        <article class="season-card">
          <img :src="activeSeason.foodImage" :alt="pageText.foodEyebrow" />
          <div>
            <strong>{{ activeSeason.foodTitle }}</strong>
            <p>{{ activeSeason.foodText }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="section-block">
      <div class="section-header">
        <div>
          <p class="eyebrow">{{ pageText.chapterEyebrow }}</p>
          <h2 class="section-title">{{ pageText.chapterTitle }}</h2>
          <p class="section-lead">{{ pageText.chapterLead }}</p>
        </div>
      </div>
      <div class="cards-grid cards-grid--3">
        <InkCard v-for="(card, index) in chapterCards" :key="card.title" :item="card" :tone="index === 0 ? 'celadon' : index === 1 ? 'cinnabar' : 'ink'" />
      </div>
    </section>

    <section class="section-block section-block--dense">
      <div class="section-header section-header--compact">
        <div>
          <p class="eyebrow">{{ pageText.rhythmEyebrow }}</p>
          <h2 class="section-title">{{ pageText.rhythmTitle }}</h2>
        </div>
      </div>
      <div class="rhythm-grid">
        <article v-for="item in pageText.rhythms" :key="item.title" class="rhythm-card">
          <strong>{{ item.title }}</strong>
          <p>{{ item.text }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.pingjiang-hero {
  position: relative;
  min-height: 68vh;
  border-radius: 32px;
  overflow: hidden;
  background:
    linear-gradient(120deg, rgba(20, 18, 16, 0.7), rgba(20, 18, 16, 0.22)),
    linear-gradient(135deg, rgba(158, 102, 73, 0.36), rgba(88, 116, 104, 0.38)),
    var(--hero-image) center/cover no-repeat;
}

.pingjiang-hero__content {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(220px, 0.7fr);
  gap: 1.5rem;
  min-height: 68vh;
  align-items: end;
  padding: clamp(1.5rem, 4vw, 3rem);
  color: rgba(250, 250, 249, 0.96);
}

.pingjiang-hero__main h1 {
  margin: 0;
  font-size: clamp(2.6rem, 6vw, 4.8rem);
  line-height: 1.08;
  max-width: 11ch;
}

.hero-lead {
  max-width: 40rem;
  margin: 1rem 0 0;
  color: rgba(250, 250, 249, 0.8);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  margin-top: 1.4rem;
}

.button-primary,
.button-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.8rem;
  padding: 0.72rem 1.1rem;
  border-radius: 999px;
  border: 1px solid rgba(250, 250, 249, 0.28);
}

.button-primary {
  background: rgba(250, 250, 249, 0.94);
  color: var(--ink-900);
}

.button-ghost {
  background: rgba(250, 250, 249, 0.08);
  color: rgba(250, 250, 249, 0.96);
  backdrop-filter: blur(14px);
}

.season-switcher {
  display: grid;
  gap: 0.65rem;
  padding: 1.1rem;
  border-radius: 24px;
  border: 1px solid rgba(250, 250, 249, 0.16);
  background: rgba(250, 250, 249, 0.08);
  backdrop-filter: blur(18px);
}

.season-switcher p {
  margin: 0 0 0.2rem;
  font-size: 0.82rem;
  letter-spacing: 0.18em;
  color: rgba(250, 250, 249, 0.72);
}

.season-switcher button {
  padding: 0.8rem 0.95rem;
  border: 1px solid rgba(250, 250, 249, 0.14);
  border-radius: 18px;
  background: rgba(250, 250, 249, 0.04);
  color: rgba(250, 250, 249, 0.94);
  text-align: left;
}

.season-switcher button.active {
  background: rgba(250, 250, 249, 0.16);
}

.route-panel {
  padding-top: 1.2rem;
}

.season-grid,
.rhythm-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.season-card,
.rhythm-card {
  padding: 1rem;
  border-radius: 24px;
  border: 1px solid rgba(61, 55, 51, 0.08);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 18px 38px rgba(28, 25, 23, 0.06);
}

.season-card img {
  width: 100%;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  display: block;
  border-radius: 18px;
  margin-bottom: 0.85rem;
}

.season-card strong,
.rhythm-card strong {
  display: block;
  color: var(--ink-900);
}

.season-card p,
.rhythm-card p {
  margin: 0.65rem 0 0;
  color: var(--ink-700);
}

@media (max-width: 980px) {
  .pingjiang-hero__content,
  .season-grid,
  .rhythm-grid {
    grid-template-columns: 1fr;
  }
}
</style>
