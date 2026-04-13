import { createRouter, createWebHistory } from 'vue-router';

import { currentLanguage, resolveLocalized } from '../i18n';

const routeTitleSource = {
  pingjiang: { zh: '平江古街', en: 'Pingjiang', ja: '平江古街', ko: '평강고가' },
  gardens: { zh: '古典园林', en: 'Classical Gardens', ja: '古典庭園', ko: '고전 정원' },
  zhuozhengyuan: { zh: '拙政园', en: 'Humble Administrator\'s Garden', ja: '拙政園', ko: '졸정원' },
  liuyuan: { zh: '留园', en: 'Lingering Garden', ja: '留園', ko: '유원' },
  wangshiyuan: { zh: '网师园', en: 'Master of Nets Garden', ja: '網師園', ko: '망사원' },
  museums: { zh: '文博殿堂', en: 'Museums', ja: '博物館', ko: '박물관' },
  heritage: { zh: '非遗市井', en: 'Living Heritage', ja: '暮らしの遺産', ko: '생활 유산' },
};

const appTitleSource = {
  zh: '平江慢游',
  en: 'Pingjiang Slow Travel',
  ja: '平江スロートラベル',
  ko: '평강 슬로우 트래블',
};

const routes = [
  {
    path: '/',
    name: 'pingjiang',
    component: () => import('../views/PingjiangI18n.vue'),
    meta: { titleKey: 'pingjiang' },
  },
  {
    path: '/gardens',
    name: 'gardens',
    component: () => import('../views/GardensI18n.vue'),
    meta: { titleKey: 'gardens' },
  },
  {
    path: '/zhuozheng',
    name: 'zhuozhengyuan',
    component: () => import('../views/ZhuozhengyuanView.vue'),
    meta: { titleKey: 'zhuozhengyuan' },
  },
  {
    path: '/zhuozheng/panorama',
    name: 'zhuozheng-panorama',
    component: () => import('../views/ZhuozhengPanoramaLandingView.vue'),
    meta: { titleKey: 'zhuozhengyuan' },
  },
  {
    path: '/zhuozheng/panorama/viewer',
    name: 'zhuozheng-panorama-viewer',
    component: () => import('../views/ZhuozhengPanoramaRoamView.vue'),
    meta: { titleKey: 'zhuozhengyuan' },
  },
  {
    path: '/liu',
    name: 'liuyuan',
    component: () => import('../views/LiuyuanView.vue'),
    meta: { titleKey: 'liuyuan' },
  },
  {
    path: '/liu/panorama',
    name: 'liuyuan-panorama',
    component: () => import('../views/LiuyuanPanoramaLandingView.vue'),
    meta: { titleKey: 'liuyuan' },
  },
  {
    path: '/liu/panorama/viewer',
    name: 'liuyuan-panorama-viewer',
    component: () => import('../views/LiuyuanPanoramaRoamView.vue'),
    meta: { titleKey: 'liuyuan' },
  },
  {
    path: '/wangshi',
    name: 'wangshiyuan',
    component: () => import('../views/WangshiyuanView.vue'),
    meta: { titleKey: 'wangshiyuan' },
  },
  {
    path: '/wangshi/panorama',
    name: 'wangshiyuan-panorama',
    component: () => import('../views/WangshiyuanPanoramaLandingView.vue'),
    meta: { titleKey: 'wangshiyuan' },
  },
  {
    path: '/wangshi/panorama/viewer',
    name: 'wangshiyuan-panorama-viewer',
    component: () => import('../views/WangshiyuanPanoramaRoamView.vue'),
    meta: { titleKey: 'wangshiyuan' },
  },
  {
    path: '/tianping',
    name: 'tianpingshan',
    component: () => import('../views/TianpingShanViewI18n.vue'),
    meta: {
      titleKey: 'gardens',
      localizedTitle: {
        zh: '天平山',
        en: 'Tianping Mountain',
        ja: '天平山',
        ko: '천평산',
      },
    },
  },
  {
    path: '/pingjiang-road',
    name: 'pingjiangroad',
    component: () => import('../views/PingjiangRoadViewI18n.vue'),
    meta: {
      titleKey: 'pingjiang',
      localizedTitle: {
        zh: '平江路',
        en: 'Pingjiang Road',
        ja: '平江路',
        ko: '평강로',
      },
    },
  },
  {
    path: '/suzhou-museum',
    name: 'suzhoumuseum',
    component: () => import('../views/SuzhouMuseumViewI18n.vue'),
    meta: {
      titleKey: 'museums',
      localizedTitle: {
        zh: '苏州博物馆',
        en: 'Suzhou Museum',
        ja: '蘇州博物館',
        ko: '쑤저우 박물관',
      },
    },
  },
  {
    path: '/museums',
    name: 'museums',
    component: () => import('../views/MuseumsI18n.vue'),
    meta: { titleKey: 'museums' },
  },
  {
    path: '/heritage',
    name: 'heritage',
    component: () => import('../views/HeritageI18n.vue'),
    meta: { titleKey: 'heritage' },
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: () => import('../views/FavoritesViewI18n.vue'),
    meta: {
      titleKey: 'pingjiang',
      localizedTitle: {
        zh: '收藏夹',
        en: 'Favorites',
        ja: 'お気に入り',
        ko: '즐겨찾기',
      },
    },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0, left: 0, behavior: 'smooth' };
  },
});

router.afterEach((to) => {
  if (typeof document !== 'undefined') {
    const localizedTitle = to.meta.localizedTitle
      ? resolveLocalized(to.meta.localizedTitle, currentLanguage.value)
      : '';
    const routeTitle = to.meta.titleKey
      ? resolveLocalized(routeTitleSource[to.meta.titleKey] || routeTitleSource.pingjiang, currentLanguage.value)
      : resolveLocalized(routeTitleSource.pingjiang, currentLanguage.value);
    const appName = resolveLocalized(appTitleSource, currentLanguage.value);
    document.title = localizedTitle
      ? `${localizedTitle} · ${appName}`
      : `${routeTitle} · ${appName}`;
  }
});

export default router;
