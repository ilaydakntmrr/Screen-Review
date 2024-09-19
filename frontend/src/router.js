import { createRouter, createWebHistory } from 'vue-router';
import LoginPage from './components/LoginPage.vue';
import SigninPage from './components/SignupPage.vue';
import HomePage from './components/HomePage.vue';
import AccountSettings from './components/AccountSettings.vue';
import MoviesPage from './components/MoviesPage.vue';
import SeriesPage from './components/SeriesPage.vue';
import MovieDetail from './components/MovieDetail.vue';
import SupportPage from './components/SupportPage.vue';
import FavoritePage from './components/FavoritePage.vue';
import SeriesDetail from './components/SeriesDetail.vue';
import ResetPassword from './components/ResetPassword.vue';
import WatchlistPage from './components/WatchlistPage.vue';
import AddPage from './components/AddPage.vue';

const routes = [
  {
    path: '/',
    name: 'HomePage',
    component: HomePage
  },
  {
    path: '/signup',
    name: 'SignupPage',
    component: SigninPage
  },
  {
    path: '/login',
    name: 'LoginPage',
    component: LoginPage
  },
  {
    path: '/resetpassword',
    name: 'ResetPassword',
    component: ResetPassword
  },
  {
    path: '/account-settings',
    name: 'AccountSettings',
    component: AccountSettings
  },
  {
    path: '/movies',
    name: 'MoviesPage',
    component: MoviesPage
  },
  {
    path: '/series',
    name: 'SeriesPage',
    component: SeriesPage
  },
  {
    path: '/movie/:id',
    name: 'MovieDetail',
    component: MovieDetail
  },
  {
    path: '/series/:id',
    name: 'SeriesDetail',
    component: SeriesDetail
  },
  {
    path: '/supportform',
    name: 'SupportPage',
    component: SupportPage
  },
  {
    path: '/favorites',
    name: 'FavoritePage',
    component: FavoritePage
  },
  {
    path: '/watchlist',
    name: 'WatchlistPage',
    component: WatchlistPage
  },
  {
    path: '/add',
    name: 'AddPage',
    component: AddPage
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = sessionStorage.getItem('isAuthenticated');

  // Kategorileri ve sıralama düzenini sıfırlayın
  if (to.name !== from.name) {
    sessionStorage.removeItem('selectedCategory');
    sessionStorage.removeItem('sortOrder');
  }

  if (isAuthenticated === 'true' && (to.name === 'LoginPage' || to.name === 'SignupPage')) {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('userId');
    next('/'); // Anasayfaya yönlendir
  } else {
    next(); // Route'a geçişe devam et
  }
});


export default router;
