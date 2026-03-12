import { createApp } from 'vue';
import 'vant/lib/index.css';

// 默认使用邮箱 + 密码的 Supabase Auth 入口；如需单独预览好友页原型，可改为 ./AppFriends.vue
import App from './AppUsernameAuth.vue';

createApp(App).mount('#app');
