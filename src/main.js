import { createApp } from 'vue';
import router from './router';
import 'vant/lib/index.css';
import './styles/global.css';
// 默认入口使用主站壳子（包含园林页面 + AI 伴游 + 好友功能弹层）
import App from './App.vue';

createApp(App).use(router).mount('#app');
