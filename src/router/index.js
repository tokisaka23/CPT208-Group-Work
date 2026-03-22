import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'pingjiang',
    component: () => import('../views/Pingjiang.vue'),
    meta: { title: '平江古街' },
  },
  {
    path: '/gardens',
    name: 'gardens',
    component: () => import('../views/Gardens.vue'),
    meta: { title: '古典园林' },
  },
  {
    path: '/zhuozheng',
    name: 'zhuozhengyuan',
    component: () => import('../views/ZhuozhengyuanView.vue'),
    meta: { title: '拙政园' },
  },
  {
    path: '/liu',
    name: 'liuyuan',
    component: () => import('../views/LiuyuanView.vue'),
    meta: { title: '留园' },
  },
  {
    path: '/wangshi',
    name: 'wangshiyuan',
    component: () => import('../views/WangshiyuanView.vue'),
    meta: { title: '网师园' },
  },
  {
    path: '/museums',
    name: 'museums',
    component: () => import('../views/Museums.vue'),
    meta: { title: '文博殿堂' },
  },
  {
    path: '/heritage',
    name: 'heritage',
    component: () => import('../views/Heritage.vue'),
    meta: { title: '非遗市井' },
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
    document.title = `${to.meta.title || '江南慢游'} · Jiangnan`;
  }
});

export default router;
