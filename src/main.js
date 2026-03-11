import { createApp } from 'vue';
import 'vant/lib/index.css';

// 默认回到登录入口；如需单独预览好友页原型，可改为 ./AppFriends.vue
import App from './AppUsernameAuth.vue';

createApp(App).mount('#app');
