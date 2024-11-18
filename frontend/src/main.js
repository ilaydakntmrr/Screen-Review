import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import axios from 'axios';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import './assets/carousel.css';
import 'bootstrap';


axios.defaults.withCredentials = true;

library.add(fas);

const app = createApp(App);

app.component('font-awesome-icon', FontAwesomeIcon);

app.use(router);

app.config.globalProperties.$http = axios;

app.mount('#app');
