import { createRouter, createWebHistory } from 'vue-router';

import { getDocumentTitle } from '../i18n';

const routes = [
  {
    path: '/',
    name: 'pingjiang',
    component: () => import('../views/Pingjiang.vue'),
    meta: { titleKey: 'pingjiang' },
  },
  {
    path: '/gardens',
    name: 'gardens',
    component: () => import('../views/Gardens.vue'),
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
    component: () => import('../views/TianpingShanView.vue'),
    meta: { titleKey: 'gardens', title: '天平山' },
  },
  {
    path: '/pingjiang-road',
    name: 'pingjiangroad',
    component: () => import('../views/PingjiangRoadView.vue'),
    meta: { titleKey: 'pingjiang', title: '平江路' },
  },
  {
    path: '/suzhou-museum',
    name: 'suzhoumuseum',
    component: () => import('../views/SuzhouMuseumView.vue'),
    meta: { titleKey: 'museums', title: '苏州博物馆' },
  },
  {
    path: '/museums',
    name: 'museums',
    component: () => import('../views/Museums.vue'),
    meta: { titleKey: 'museums' },
  },
  {
    path: '/heritage',
    name: 'heritage',
    component: () => import('../views/Heritage.vue'),
    meta: { titleKey: 'heritage' },
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: () => import('../views/FavoritesView.vue'),
    meta: { titleKey: 'pingjiang', title: '收藏夹' },
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
    document.title = to.meta.title || getDocumentTitle(to.meta.titleKey || 'pingjiang');
  }
});

export default router;
