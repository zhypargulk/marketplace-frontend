import { createApp } from 'vue';
import './styles/global.css';
import App from './app/App.vue';
import { router } from './app/providers/router';

const app = createApp(App);
app.use(router);
app.mount('#app');

