import { createApp } from 'vue';
import App from './App.vue';
import { Button, Field, CellGroup, NavBar } from 'vant';

const app = createApp(App);
app.use(Button).use(Field).use(CellGroup).use(NavBar);
app.mount('#app');