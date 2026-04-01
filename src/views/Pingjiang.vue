<script setup>
import { computed, ref } from 'vue';
import { RouterLink } from 'vue-router';
import InkCard from '../components/InkCard.vue';
import { useSiteContent } from '../data/siteContent';
import zhuozhengyuanHeroImage from '../assets/gardens/zhuozhengyuan.jpg';
import zhuozhengyuan1Image from '../assets/gardens/zhuozhengyuan1.jpg';
import liuyuan1Image from '../assets/gardens/liuyuan1.jpg';
import liuyuan2Image from '../assets/gardens/liuyuan2.jpg';
import liuyuan3Image from '../assets/gardens/liuyuan3.jpg';
import pingjiangroadHeroImage from '../assets/gardens/pingjiangroad-hero.jpg';
import suzhoumuseumHeroImage from '../assets/gardens/suzhoumuseum-hero.jpg';
import tianpingshanHeroImage from '../assets/gardens/tianpingshan-hero.jpg';
import wangshiyuan1Image from '../assets/gardens/wangshiyuan1.jpg';
import wangshiyuan2Image from '../assets/gardens/wangshiyuan2.jpg';
import wangshiyuan3Image from '../assets/gardens/wangshiyuan3.jpg';
import suxianrouyuebingImage from '../assets/seasonal/suxianrouyuebing.jpg';
import jiuniangbingImage from '../assets/seasonal/jiuniangbing.jpg';
import biluoxiarenImage from '../assets/seasonal/biluoxiaren.jpg';
import sushilvdoutangImage from '../assets/seasonal/sushilvdoutang.jpg';
import fengzhendaroumianImage from '../assets/seasonal/fengzhendaroumian.jpg';
import jitoumitangshuiImage from '../assets/seasonal/jitoumitangshui.jpg';
import xiefenxiaolongImage from '../assets/seasonal/xiefenxiaolong.jpg';
import tangchaoliziImage from '../assets/seasonal/tangchaolizi.jpg';
import guihuatangouImage from '../assets/seasonal/guihuatangou.jpg';
import cangshuyangrouImage from '../assets/seasonal/cangshuyangrou.jpg';
import chidouxiaoyuanziImage from '../assets/seasonal/chidouxiaoyuanzi.jpg';
import shengjianTangbaoImage from '../assets/seasonal/shengjian-tangbao.jpg';

const { chapterCards, pingjiangRhythms } = useSiteContent();

const seasonalScenes = {
  spring: {
    key: 'spring',
    label: '春',
    english: 'Spring',
    eyebrow: 'Spring In Suzhou',
    title: '春天先看园林新绿，再顺着水巷把苏州慢慢打开。',
    lead:
      '三四月的苏州最适合从拙政园、留园这样的古典园林开始，看花窗边的新叶、白墙前的海棠，再回到平江路听橹声和人声一起慢下来。',
    actionPrimary: { label: '去看春日园林', to: '/gardens' },
    actionSecondary: { label: '再逛苏州水巷', to: '/' },
    stats: [
      { value: '3-4 月', label: '最适合看花木与新柳' },
      { value: '拙政园', label: '春游首选园林' },
      { value: '平江路', label: '适合收尾散步' },
    ],
    poemLabel: '春日选景',
    poem: '小园新绿起，水巷正宜行。',
    briefTitle: '先从园林看春意，再回到河街收拢节奏。',
    briefText:
      '春天的苏州不需要赶路，适合把拙政园、留园和平江路串成一条轻一点、慢一点的线。',
    note:
      '春天适合把“看花”和“看园”放在一起：先入园林，再回水巷，层次最完整。',
    recommendations: [
      {
        name: '拙政园',
        tag: '花木最盛',
        description: '海棠、玉兰与水院一起进入状态，最能感受到苏州园林“春到院中来”的气息。',
        highlight: '适合第一次来苏州时作为春季首站。',
        route: '/zhuozheng',
        routeLabel: '查看拙政园',
      },
      {
        name: '留园',
        tag: '新绿与框景',
        description: '春天的留园层次更柔和，回廊、花窗和树影之间的关系特别清楚。',
        highlight: '更适合慢看细节，而不是只看大景。',
        route: '/liu',
        routeLabel: '查看留园',
      },
      {
        name: '平江路',
        tag: '水巷散步',
        description: '柳色刚起的时候，平江路最适合做春天的收尾路线，把园林的静延续到街巷里。',
        highlight: '傍晚沿河慢走，节奏会很舒服。',
        route: '/pingjiang-road',
        routeLabel: '留在首页',
      },
    ],
    foods: [
      {
        name: '苏式鲜肉月饼',
        tag: '春游带着走',
        description: '外皮酥松、肉馅带汁，适合边逛边吃，也很适合当春天园林路线里的轻食补给。',
      },
      {
        name: '酒酿饼',
        tag: '春季感最强',
        description: '苏州春天很有代表性的小点，米香和酒酿香都比较轻，适合配慢节奏的园林散步。',
      },
      {
        name: '碧螺虾仁',
        tag: '春鲜代表',
        description: '把苏州春茶和河鲜放在一起，味道清爽，和春季主页的整体气质很贴。',
      },
    ],
  },
  summer: {
    key: 'summer',
    label: '夏',
    english: 'Summer',
    eyebrow: 'Summer In Suzhou',
    title: '夏天看荷风、水院与夜色，苏州的清凉感藏在园林深处。',
    lead:
      '入夏以后，最适合去看拙政园的荷塘、网师园的夜花园，以及平江河面的晚风。路线不必长，但要留出午后和入夜的两个时段。',
    actionPrimary: { label: '去看夏日园林', to: '/gardens' },
    actionSecondary: { label: '看夜间市井', to: '/heritage' },
    stats: [
      { value: '6-8 月', label: '适合看荷、看夜园' },
      { value: '网师园', label: '夜游辨识度最高' },
      { value: '荷风', label: '夏季核心体验' },
    ],
    poemLabel: '夏日选景',
    poem: '荷风穿水院，灯影落人间。',
    briefTitle: '白天看荷与水，晚上去看苏州园林的另一面。',
    briefText:
      '夏天推荐把“白天园林 + 晚上街巷或夜园”搭配起来，避开最晒的时候，体验会比赶景点更完整。',
    note:
      '夏天推荐偏向有水、有荫和能夜游的地方，路线要比春秋更短、更讲究时间段。',
    recommendations: [
      {
        name: '拙政园',
        tag: '荷花与水面',
        description: '夏天的拙政园最有辨识度的就是荷塘，水面和亭榭一起把苏州的清润感撑起来。',
        highlight: '适合上午去，光线和温度都更友好。',
        route: '/zhuozheng',
        routeLabel: '查看拙政园',
      },
      {
        name: '网师园',
        tag: '夜花园',
        description: '网师园本来就适合看“小中见大”，到了夏夜更容易感受到园林被灯光和演出激活后的气氛。',
        highlight: '适合安排在傍晚之后。',
        route: '/wangshi',
        routeLabel: '查看网师园',
      },
      {
        name: '平江路',
        tag: '晚风与灯影',
        description: '夏天不一定要把体力都放在白天，平江路的河风和夜色更适合做第二段体验。',
        highlight: '建议把最慢的散步留到晚上。',
        route: '/pingjiang-road',
        routeLabel: '留在首页',
      },
    ],
    foods: [
      {
        name: '苏式绿豆汤',
        tag: '夏日解暑',
        description: '到夏天最实用的推荐就是一碗冰镇绿豆汤，清爽直接，也很适合穿插在夜游之前。',
      },
      {
        name: '枫镇大肉面',
        tag: '苏州夏面',
        description: '传统上很有季节感的一碗面，汤头和焖肉都很有辨识度，适合安排在上午或中午。',
      },
      {
        name: '鸡头米糖水',
        tag: '水乡甜口',
        description: '口感软糯清润，适合夏季路线后半段，和荷风、水面、晚风这些体验能接上。',
      },
    ],
  },
  autumn: {
    key: 'autumn',
    label: '秋',
    english: 'Autumn',
    eyebrow: 'Autumn In Suzhou',
    title: '秋天去天平山看枫叶，再把园林的澄明和城里的秋意连起来。',
    lead:
      '苏州的秋天层次很分明，最有代表性的当然是天平山红枫；如果还想看更雅致的秋意，可以把留园、虎丘或平江路一起接进路线里。',
    actionPrimary: { label: '先看园林秋色', to: '/gardens' },
    actionSecondary: { label: '再读苏州秋景', to: '/museums' },
    stats: [
      { value: '11 月', label: '枫叶进入最佳观赏期' },
      { value: '天平山', label: '秋季代表景点' },
      { value: '留园', label: '适合看澄净秋景' },
    ],
    poemLabel: '秋日选景',
    poem: '枫色上山径，秋声入小园。',
    briefTitle: '秋天的主页重点不是“多”，而是把红枫和园林气质接起来。',
    briefText:
      '先去天平山看最鲜明的季节性景观，再回到留园或平江路看更安静、更耐读的秋意，路线会更完整。',
    note:
      '秋季推荐以“天平山 + 一处园林 + 一段古街”为主，既有记忆点，也不会把一天排得过满。',
    recommendations: [
      {
        name: '天平山',
        tag: '看枫叶',
        description: '苏州秋天最直接的答案就是天平山。红枫一到位，城市里的其他秋景都像在给它做铺垫。',
        highlight: '适合作为秋季主题推荐的第一站。',
        route: '/tianping',
        routeLabel: '从园林页进入路线',
      },
      {
        name: '留园',
        tag: '秋意最静',
        description: '相比山景的鲜明，留园更像是在白墙、假山和树影里慢慢显出秋色，适合接在天平山之后。',
        highlight: '适合想把“热闹秋景”收回到安静空间的人。',
        route: '/liu',
        routeLabel: '查看留园',
      },
      {
        name: '平江路',
        tag: '适合傍晚收尾',
        description: '秋天的平江路不需要太多活动安排，只要在偏晚的时候沿河慢走，气氛就已经很完整。',
        highlight: '适合作为一天最后一段。',
        route: '/pingjiang-road',
        routeLabel: '留在首页',
      },
    ],
    foods: [
      {
        name: '蟹粉小笼',
        tag: '秋季主角',
        description: '苏州入秋以后最容易让人记住的味道之一就是蟹粉，适合作为秋日路线里的正餐代表。',
      },
      {
        name: '糖炒栗子',
        tag: '街头秋味',
        description: '天一凉下来，边走边吃栗子这件事本身就很秋天，和天平山、平江路都很搭。',
      },
      {
        name: '桂花糖藕',
        tag: '最像苏州秋天',
        description: '桂花香和糯米藕都偏温柔，很适合放在看完枫叶或古街散步之后收尾。',
      },
    ],
  },
  winter: {
    key: 'winter',
    label: '冬',
    english: 'Winter',
    eyebrow: 'Winter In Suzhou',
    title: '冬天看白墙、枯枝与安静水面，苏州最见骨相的时候到了。',
    lead:
      '冬季不是苏州最热闹的时间，却是最适合看空间和线条的季节。留园、网师园这种层次清楚的园林，会比花繁叶密的时候更显结构之美。',
    actionPrimary: { label: '去看冬日园林', to: '/gardens' },
    actionSecondary: { label: '再逛文博空间', to: '/museums' },
    stats: [
      { value: '12-2 月', label: '适合看空间骨相' },
      { value: '留园', label: '冬季更显线条' },
      { value: '苏博', label: '适合搭配室内路线' },
    ],
    poemLabel: '冬日选景',
    poem: '白墙收寒色，疏枝见园心。',
    briefTitle: '冬天适合把园林和文博放在一起，走一条更安静的线。',
    briefText:
      '冬季的路线不需要铺得太开，留园、网师园和苏州博物馆这种节奏安静、空间感强的点更适合当主角。',
    note:
      '冬天的推荐重点是“清”和“静”，更适合看建筑比例、借景关系和室内外的过渡。',
    recommendations: [
      {
        name: '留园',
        tag: '看空间骨相',
        description: '冬天枝叶退去以后，留园的回廊、洞门和假山关系会变得更清楚，也更耐看。',
        highlight: '适合认真看构图和园林层次。',
        route: '/liu',
        routeLabel: '查看留园',
      },
      {
        name: '网师园',
        tag: '小园更静',
        description: '冬季的网师园更显得精巧安静，少了旺季的喧闹，更容易进入“小园深处”的状态。',
        highlight: '适合时间不长但想认真看一座园的人。',
        route: '/wangshi',
        routeLabel: '查看网师园',
      },
      {
        name: '苏州博物馆',
        tag: '园林外的冬季补充',
        description: '如果冬天不想一直在户外，把苏州博物馆接进路线最合理，建筑、庭院和展陈都能接住苏州气质。',
        highlight: '适合和冬日园林拼成半日或一日线。',
        route: '/suzhou-museum',
        routeLabel: '查看文博殿堂',
      },
    ],
    foods: [
      {
        name: '藏书羊肉',
        tag: '冬季代表',
        description: '天气冷的时候，苏州很经典的一口热气就是羊肉汤，适合冬日路线结束后吃一顿热的。',
      },
      {
        name: '赤豆小圆子',
        tag: '热甜收尾',
        description: '冬天很适合来一碗热甜汤，把一天的节奏慢慢收住，和安静路线的气质也很合。',
      },
      {
        name: '生煎与汤包',
        tag: '冬天更稳妥',
        description: '冷天里更适合吃热腾腾、带汤汁的小吃，适合搭配博物馆或园林后的城市段。',
      },
    ],
  },
};

const seasonOrder = ['spring', 'summer', 'autumn', 'winter'];
const activeSeasonKey = ref('autumn');

const seasonTabs = seasonOrder.map((key) => ({
  key,
  label: seasonalScenes[key].label,
  english: seasonalScenes[key].english,
}));

const seasonPosterImageMap = {
  spring: zhuozhengyuanHeroImage,
  summer: wangshiyuan1Image,
  autumn: tianpingshanHeroImage,
  winter: suzhoumuseumHeroImage,
};

const seasonRecommendationImageMap = {
  spring: [
    zhuozhengyuanHeroImage,
    liuyuan1Image,
    pingjiangroadHeroImage,
  ],
  summer: [
    zhuozhengyuan1Image,
    wangshiyuan2Image,
    pingjiangroadHeroImage,
  ],
  autumn: [
    tianpingshanHeroImage,
    liuyuan2Image,
    pingjiangroadHeroImage,
  ],
  winter: [
    liuyuan3Image,
    wangshiyuan3Image,
    suzhoumuseumHeroImage,
  ],
};

const seasonFoodImageMap = {
  spring: [suxianrouyuebingImage, jiuniangbingImage, biluoxiarenImage],
  summer: [sushilvdoutangImage, fengzhendaroumianImage, jitoumitangshuiImage],
  autumn: [xiefenxiaolongImage, tangchaoliziImage, guihuatangouImage],
  winter: [cangshuyangrouImage, chidouxiaoyuanziImage, shengjianTangbaoImage],
};

const activeSeason = computed(() => {
  const season = seasonalScenes[activeSeasonKey.value] || seasonalScenes.autumn;
  const recommendationImages = seasonRecommendationImageMap[season.key] || [];
  const foodImages = seasonFoodImageMap[season.key] || [];

  return {
    ...season,
    posterImage: seasonPosterImageMap[season.key] || '',
    recommendations: (season.recommendations || []).map((item, index) => ({
      ...item,
      image: recommendationImages[index] || seasonPosterImageMap[season.key] || '',
    })),
    foods: (season.foods || []).map((item, index) => ({
      ...item,
      image: foodImages[index] || '',
    })),
  };
});
</script>

<template>
  <div class="page-shell pingjiang-page">
    <section class="page-hero pingjiang-hero" :class="`is-${activeSeason.key}`">
      <div class="pingjiang-hero__photo" :style="{ backgroundImage: `url(${activeSeason.posterImage})` }" />
      <div class="pingjiang-hero__backdrop" />
      <div class="pingjiang-hero__veil" />

      <div class="pingjiang-hero__content">
        <div class="pingjiang-hero__copy">
          <p class="eyebrow">{{ activeSeason.eyebrow }}</p>
          <h1 class="hero-title">{{ activeSeason.title }}</h1>
          <p class="hero-lead">{{ activeSeason.lead }}</p>

          <div class="hero-actions">
            <RouterLink :to="activeSeason.actionPrimary.to" class="button-primary">
              {{ activeSeason.actionPrimary.label }}
            </RouterLink>
            <RouterLink :to="activeSeason.actionSecondary.to" class="button-ghost">
              {{ activeSeason.actionSecondary.label }}
            </RouterLink>
          </div>

          <div class="hero-stat-row">
            <div v-for="item in activeSeason.stats" :key="item.label">
              <strong>{{ item.value }}</strong>
              <span>{{ item.label }}</span>
            </div>
          </div>
        </div>

        <aside class="pingjiang-hero__aside">
          <div class="season-switcher">
            <p class="season-switcher__label">Season Picks</p>
            <div class="season-switcher__list">
              <button
                v-for="tab in seasonTabs"
                :key="tab.key"
                type="button"
                class="season-switcher__button"
                :class="{ 'is-active': tab.key === activeSeason.key }"
                @click="activeSeasonKey = tab.key"
              >
                <strong>{{ tab.label }}</strong>
                <span>{{ tab.english }}</span>
              </button>
            </div>
          </div>

          <div class="poem-panel">
            <p class="poem-panel__label">{{ activeSeason.poemLabel }}</p>
            <p class="poem-vertical">{{ activeSeason.poem }}</p>
          </div>

          <div class="floating-brief">
            <span>{{ activeSeason.english }}</span>
            <h2>{{ activeSeason.briefTitle }}</h2>
            <p>{{ activeSeason.briefText }}</p>
          </div>
        </aside>
      </div>
    </section>

    <section class="section-block section-block--dense season-panel">
      <div class="section-header season-panel__header">
        <div>
          <p class="eyebrow">Seasonal Home</p>
          <h2 class="section-title">当前是 {{ activeSeason.english }} 季主推路线</h2>
          <p class="section-lead">{{ activeSeason.note }}</p>
        </div>
      </div>

      <div class="season-recommend-grid">
        <article
          v-for="item in activeSeason.recommendations"
          :key="`${activeSeason.key}-${item.name}`"
          class="season-card"
        >
          <div class="season-card__media">
            <img :src="item.image" :alt="item.name" class="season-card__image" />
          </div>
          <div class="season-card__head">
            <span>{{ item.tag }}</span>
            <h3>{{ item.name }}</h3>
          </div>
          <p>{{ item.description }}</p>
          <strong>{{ item.highlight }}</strong>
          <RouterLink :to="item.route" class="season-card__link">{{ item.routeLabel }}</RouterLink>
        </article>
      </div>

      <div class="season-food-block">
        <div class="section-header section-header--compact season-food-block__header">
          <div>
            <p class="eyebrow">Seasonal Food</p>
            <h3 class="section-title section-title--sub">这一季也适合顺路吃这三样</h3>
          </div>
        </div>

        <div class="season-food-grid">
          <article
            v-for="item in activeSeason.foods"
            :key="`${activeSeason.key}-${item.name}`"
            class="season-card season-card--food"
          >
            <div class="season-card__media season-card__media--food">
              <img :src="item.image" :alt="item.name" class="season-card__image" />
            </div>
            <div class="season-card__head">
              <span>{{ item.tag }}</span>
              <h3>{{ item.name }}</h3>
            </div>
            <p>{{ item.description }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section-block">
      <div class="section-header">
        <div>
          <p class="eyebrow">Four Independent Pages</p>
          <h2 class="section-title">从苏州慢游主页出发，把整座城市拆成四页，各自成章。</h2>
          <p class="section-lead">
            首页负责打开整体气质，其余三页分别承接园林、文博与非遗市井，让浏览路线更清楚，视觉语言也更聚焦。
          </p>
        </div>
        <div class="section-note serif-copy">
          这不是信息堆叠，而是一种像翻册页一样的观看方式：一页一景，一页一气息。
        </div>
      </div>

      <div class="cards-grid cards-grid--3">
        <InkCard
          v-for="(chapter, index) in chapterCards"
          :key="chapter.title"
          :item="chapter"
          :tone="index === 0 ? 'celadon' : index === 1 ? 'cinnabar' : 'ink'"
        />
      </div>
    </section>

    <section class="section-block section-block--dense">
      <div class="section-header section-header--compact">
        <div>
          <p class="eyebrow">Rhythm Of The Street</p>
          <h2 class="section-title">一日之间，平江路的气息会沿着河岸轻轻换调。</h2>
        </div>
      </div>

      <div class="rhythm-grid">
        <article v-for="item in pingjiangRhythms" :key="item.title" class="rhythm-note">
          <span class="rhythm-index">{{ item.title }}</span>
          <p>{{ item.text }}</p>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.pingjiang-hero {
  min-height: 76vh;
}

.pingjiang-hero__backdrop,
.pingjiang-hero__photo,
.pingjiang-hero__veil {
  position: absolute;
  inset: 0;
}

.pingjiang-hero__photo {
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  opacity: 0.28;
  transform: scale(1.04);
  filter: saturate(0.95);
}

.pingjiang-hero__backdrop {
  background:
    linear-gradient(120deg, rgba(21, 20, 18, 0.62), rgba(21, 20, 18, 0.16)),
    linear-gradient(135deg, rgba(146, 176, 122, 0.46), rgba(180, 136, 108, 0.18)),
    radial-gradient(circle at 18% 28%, rgba(221, 235, 214, 0.26), transparent 28%),
    radial-gradient(circle at 80% 22%, rgba(255, 218, 185, 0.18), transparent 24%),
    linear-gradient(180deg, rgba(93, 124, 110, 0.42), rgba(42, 45, 40, 0.5));
  transform: scale(1.02);
  animation: hero-breath 18s cubic-bezier(0.33, 1, 0.68, 1) infinite alternate;
}

.pingjiang-hero.is-summer .pingjiang-hero__backdrop {
  background:
    linear-gradient(120deg, rgba(18, 26, 29, 0.6), rgba(18, 26, 29, 0.2)),
    linear-gradient(135deg, rgba(85, 138, 124, 0.48), rgba(42, 93, 125, 0.22)),
    radial-gradient(circle at 22% 24%, rgba(211, 246, 221, 0.24), transparent 24%),
    radial-gradient(circle at 76% 16%, rgba(185, 229, 255, 0.18), transparent 20%),
    linear-gradient(180deg, rgba(57, 93, 94, 0.44), rgba(26, 35, 34, 0.5));
}

.pingjiang-hero.is-summer .pingjiang-hero__photo {
  opacity: 0.36;
  filter: saturate(1.02) brightness(1.02);
}

.pingjiang-hero.is-autumn .pingjiang-hero__backdrop {
  background:
    linear-gradient(120deg, rgba(31, 21, 17, 0.64), rgba(31, 21, 17, 0.18)),
    linear-gradient(135deg, rgba(176, 94, 52, 0.46), rgba(118, 70, 38, 0.22)),
    radial-gradient(circle at 18% 30%, rgba(255, 208, 158, 0.24), transparent 24%),
    radial-gradient(circle at 82% 20%, rgba(196, 61, 33, 0.2), transparent 18%),
    linear-gradient(180deg, rgba(118, 80, 58, 0.44), rgba(36, 30, 26, 0.52));
}

.pingjiang-hero.is-winter .pingjiang-hero__backdrop {
  background:
    linear-gradient(120deg, rgba(25, 28, 33, 0.66), rgba(25, 28, 33, 0.18)),
    linear-gradient(135deg, rgba(136, 151, 164, 0.42), rgba(82, 97, 116, 0.18)),
    radial-gradient(circle at 20% 26%, rgba(239, 244, 250, 0.24), transparent 24%),
    radial-gradient(circle at 80% 18%, rgba(208, 220, 232, 0.16), transparent 20%),
    linear-gradient(180deg, rgba(108, 120, 133, 0.4), rgba(34, 37, 42, 0.52));
}

.pingjiang-hero__veil {
  background:
    radial-gradient(circle at 24% 24%, rgba(255, 255, 255, 0.12), transparent 30%),
    linear-gradient(180deg, rgba(250, 250, 249, 0.05) 0%, rgba(250, 250, 249, 0.12) 100%);
}

.pingjiang-hero__content {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(260px, 0.9fr);
  gap: 2rem;
  align-items: end;
  min-height: 76vh;
  padding: clamp(2rem, 4vw, 3rem);
  color: rgba(250, 250, 249, 0.96);
}

.hero-title,
.hero-lead,
.poem-vertical,
.floating-brief h2 {
  color: rgba(250, 250, 249, 0.98);
}

.hero-title {
  max-width: 12ch;
  margin: 0;
  font-size: clamp(2.6rem, 6vw, 4.9rem);
  line-height: 1.08;
}

.hero-lead {
  max-width: 40rem;
  margin: 1.1rem 0 0;
  color: rgba(250, 250, 249, 0.78);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.9rem;
  margin-top: 1.8rem;
}

.button-primary,
.button-ghost {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.9rem;
  padding: 0.78rem 1.2rem;
  border-radius: 999px;
  border: 1px solid rgba(250, 250, 249, 0.28);
  letter-spacing: 0.08em;
  transition:
    transform 0.35s ease,
    background-color 0.35s ease,
    border-color 0.35s ease;
}

.button-primary {
  background: rgba(250, 250, 249, 0.92);
  color: var(--ink-900);
}

.button-ghost {
  background: rgba(250, 250, 249, 0.08);
  backdrop-filter: blur(12px);
}

.button-primary:hover,
.button-ghost:hover {
  transform: translateY(-1px);
}

.button-ghost:hover {
  background: rgba(250, 250, 249, 0.16);
}

.hero-stat-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
  margin-top: 2.2rem;
}

.hero-stat-row div {
  padding: 1rem 1.1rem;
  border: 1px solid rgba(250, 250, 249, 0.16);
  border-radius: 20px;
  background: rgba(250, 250, 249, 0.06);
  backdrop-filter: blur(16px);
}

.hero-stat-row strong {
  display: block;
  font-family: var(--font-serif);
  font-size: 1.45rem;
}

.hero-stat-row span {
  color: rgba(250, 250, 249, 0.76);
  font-size: 0.92rem;
}

.pingjiang-hero__aside {
  display: grid;
  justify-items: end;
  gap: 1rem;
}

.season-switcher,
.poem-panel,
.floating-brief {
  width: min(100%, 320px);
  border: 1px solid rgba(250, 250, 249, 0.16);
  border-radius: 26px;
  background: rgba(250, 250, 249, 0.08);
  backdrop-filter: blur(18px);
}

.season-switcher {
  padding: 1.15rem;
  display: grid;
  gap: 0.85rem;
}

.season-switcher__label,
.poem-panel__label {
  margin: 0;
  font-size: 0.78rem;
  letter-spacing: 0.24em;
  color: rgba(250, 250, 249, 0.65);
}

.season-switcher__list {
  display: grid;
  gap: 0.65rem;
}

.season-switcher__button {
  width: 100%;
  text-align: left;
  padding: 0.85rem 0.95rem;
  border-radius: 18px;
  border: 1px solid rgba(250, 250, 249, 0.14);
  background: rgba(250, 250, 249, 0.04);
  color: rgba(250, 250, 249, 0.94);
  display: grid;
  gap: 0.18rem;
  transition:
    transform 0.3s ease,
    background-color 0.3s ease,
    border-color 0.3s ease;
}

.season-switcher__button strong {
  font-size: 1rem;
}

.season-switcher__button span {
  color: rgba(250, 250, 249, 0.66);
  font-size: 0.8rem;
  letter-spacing: 0.08em;
}

.season-switcher__button:hover,
.season-switcher__button.is-active {
  transform: translateY(-1px);
  background: rgba(250, 250, 249, 0.14);
  border-color: rgba(250, 250, 249, 0.28);
}

.poem-panel {
  display: grid;
  justify-items: end;
  padding: 1.3rem 1.3rem 1.5rem;
}

.poem-vertical {
  margin: 0;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  letter-spacing: 0.42em;
  font-size: clamp(1.2rem, 2.8vw, 1.8rem);
  line-height: 1.9;
}

.floating-brief {
  padding: 1.25rem 1.3rem;
}

.floating-brief span {
  display: inline-flex;
  margin-bottom: 0.55rem;
  color: rgba(250, 250, 249, 0.64);
  font-size: 0.78rem;
  letter-spacing: 0.22em;
}

.floating-brief h2 {
  margin: 0;
  font-size: 1.3rem;
  line-height: 1.4;
}

.floating-brief p {
  margin: 0.75rem 0 0;
  color: rgba(250, 250, 249, 0.74);
}

.season-panel {
  padding-top: 1.2rem;
}

.season-panel__header {
  margin-bottom: 1.2rem;
}

.section-title--sub {
  font-size: clamp(1.5rem, 2.4vw, 2rem);
}

.section-note {
  max-width: 28rem;
}

.season-recommend-grid,
.season-food-grid,
.rhythm-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.season-food-block {
  margin-top: 1.4rem;
}

.season-food-block__header {
  margin-bottom: 1rem;
}

.season-card--food {
  background: linear-gradient(180deg, rgba(250, 248, 244, 0.96), rgba(255, 255, 255, 0.92));
}

.season-card {
  padding: 1.2rem 1.2rem 1.25rem;
  border-radius: 24px;
  border: 1px solid rgba(61, 55, 51, 0.08);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(247, 245, 241, 0.88));
  box-shadow: 0 18px 38px rgba(28, 25, 23, 0.06);
  display: grid;
  gap: 0.8rem;
}

.season-card__media {
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  aspect-ratio: 16 / 10;
}

.season-card__media--food {
  aspect-ratio: 5 / 4;
}

.season-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.season-card__head {
  display: grid;
  gap: 0.28rem;
}

.season-card__head span {
  color: var(--ink-500);
  font-size: 0.76rem;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.season-card__head h3,
.season-card p,
.season-card strong {
  margin: 0;
}

.season-card__head h3 {
  font-size: 1.25rem;
  color: var(--ink-900);
}

.season-card p {
  color: var(--ink-700);
}

.season-card strong {
  color: var(--celadon-700);
  font-weight: 600;
}

.season-card__link {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-height: 2.55rem;
  padding: 0.65rem 1rem;
  border-radius: 999px;
  border: 1px solid rgba(61, 55, 51, 0.12);
  color: var(--ink-900);
  background: rgba(255, 255, 255, 0.84);
  transition:
    transform 0.3s ease,
    background-color 0.3s ease,
    border-color 0.3s ease;
}

.season-card__link:hover {
  transform: translateY(-1px);
  background: rgba(95, 127, 114, 0.1);
  border-color: rgba(95, 127, 114, 0.28);
}

.rhythm-note {
  padding: 1.15rem 1.2rem;
  border: 1px solid rgba(61, 55, 51, 0.08);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.7);
}

.rhythm-index {
  display: inline-flex;
  margin-bottom: 0.7rem;
  font-family: var(--font-serif);
  font-size: 1.08rem;
}

.rhythm-note p {
  margin: 0;
  color: var(--ink-700);
}

@keyframes hero-breath {
  0% {
    transform: scale(1.01) translate3d(0, 0, 0);
  }

  50% {
    transform: scale(1.05) translate3d(-0.6%, -0.4%, 0);
  }

  100% {
    transform: scale(1.03) translate3d(0.4%, 0.5%, 0);
  }
}

@media (max-width: 980px) {
  .pingjiang-hero__content,
  .season-recommend-grid,
  .season-food-grid,
  .rhythm-grid {
    grid-template-columns: 1fr;
  }

  .pingjiang-hero__aside,
  .poem-panel,
  .season-switcher {
    justify-items: start;
  }

  .hero-title {
    max-width: none;
  }
}

@media (max-width: 640px) {
  .hero-stat-row {
    grid-template-columns: 1fr;
  }

  .poem-vertical {
    writing-mode: horizontal-tb;
    letter-spacing: 0.12em;
  }
}
</style>
