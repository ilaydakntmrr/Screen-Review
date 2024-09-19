<template>
  <div class="container">
    <Header :onLogout="handleLogout" />
    <div class="content">
      <div class="search-dropdown-container">
        <div class="search-bar-wrapper">
          <font-awesome-icon icon="search" class="search-icon" />
          <input type="text" v-model="searchQuery" @input="filterMovies" placeholder="Film ara..." class="search-bar" />
        </div>
        <div class="dropdown-container">
          <select class="dropdown" v-model="selectedCategory" @change="filterMovies">
            <option disabled selected>Kategoriler</option>
            <option value="">Tüm Kategoriler</option>
            <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
          </select>
          <select class="dropdown" v-model="sortOrder" @change="filterMovies">
            <option value="">Sırala</option>
            <option value="imdb-desc">IMDB Yüksekten Düşüğe</option>
            <option value="imdb-asc">IMDB Düşükten Yükseğe</option>
            <option value="most-rated">En Çok Değerlendirilen</option>
          </select>
        </div>
      </div>
      <div class="media-grid">
        <div v-for="movie in filteredMovies" :key="movie._id" class="media-item">
          <font-awesome-icon :icon="['fas', 'heart']" class="heart-icon" @click.stop="handleHeartClick(movie)"
            :class="{ 'active': isFavorite(movie) }" />
          <router-link :to="`/movie/${movie.movieid}`">
            <img :src="movie.img" alt="Movie Poster" />
            <h3>{{ movie.name }}</h3>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from '@/components/HeaderPage.vue';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

export default {
  name: 'MoviesPage',
  components: {
    Header,
    FontAwesomeIcon,
  },
  data() {
    return {
      movies: [],
      filteredMovies: [],
      searchQuery: '',
      selectedCategory: '',
      sortOrder: '',
      categories: [
        'Aksiyon', 'Komedi', 'Dram', 'Korku', 'Romantik', 'Bilim Kurgu',
        'Fantastik', 'Gerilim', 'Polisiye', 'Belgesel', 'Animasyon', 'Macera',
        'Tarihi', 'Western', 'Psikolojik Gerilim', 'Aile', 'Savaş', 'Müzik', 'Gizem'
      ],
      favorites: [],
    };
  },
  methods: {
    async fetchMovies() {
      try {
        const response = await axios.get('http://localhost:5000/home');
        console.log('Gelen Veriler:', response.data.movies);
        response.data.movies.forEach(movie => {
          console.log('Film Adı:', movie.name);
          console.log('Film Kategorisi:', Array.isArray(movie.category) ? movie.category : 'Kategori yok veya array değil');
        });

        this.movies = response.data.movies;
        this.filterMovies();
        this.fetchFavorites();
      } catch (error) {
        console.error('Filmler alınamadı:', error);
      }
    },

    async fetchFavorites() {
      const userId = sessionStorage.getItem('userId');
      if (!userId) return;

      try {
        const response = await axios.get(`http://localhost:5000/favorites/${userId}`);
        this.favorites = response.data.map(fav => ({
          ...fav,
          itemId: Number(fav.itemId)
        }));
        console.log('Favoriler:', this.favorites);
      } catch (error) {
        console.error('Favoriler alınamadı:', error);
      }
    },
    async handleHeartClick(movie) {
      const userId = sessionStorage.getItem('userId');
      if (!userId) {
        alert('Lütfen giriş yapın');
        return;
      }

      if (this.isFavorite(movie)) {
        try {
          await axios.delete('http://localhost:5000/favorites', {
            data: {
              userId: Number(userId),
              itemId: movie.movieid,
              itemType: 'movie'
            }
          });
          this.removeFromFavorites(movie);
        } catch (error) {
          console.error('Favorilerden çıkarılırken bir hata oluştu:', error);
        }
      } else {
        try {
          await axios.post('http://localhost:5000/favorites', {
            userId: Number(userId),
            itemId: movie.movieid,
            itemType: 'movie'
          });
          this.addToFavorites(movie);
        } catch (error) {
          console.error('Favoriye eklenirken bir hata oluştu:', error);
        }
      }
    },
    addToFavorites(movie) {
      if (this.isFavorite(movie)) {
        return;
      }

      this.favorites.push({
        itemId: movie.movieid,
        itemType: 'movie'
      });
    },
    removeFromFavorites(movie) {
      this.favorites = this.favorites.filter(fav => fav.itemId !== movie.movieid);
    },
    isFavorite(movie) {
      const isFav = this.favorites.some(fav => fav.itemId === movie.movieid && fav.itemType === 'movie');
      console.log(`Film ID: ${movie.movieid} Favori mi? ${isFav}`);
      return isFav;
    },
    filterMovies() {
      let movies = this.movies.filter(movie =>
        movie.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );

      if (this.selectedCategory) {
        movies = movies.filter(movie =>
          movie.category.includes(this.selectedCategory)
        );
      }

      if (this.sortOrder === 'imdb-desc') {
        movies.sort((a, b) => b.imdb - a.imdb);
      } else if (this.sortOrder === 'imdb-asc') {
        movies.sort((a, b) => a.imdb - b.imdb);
      } else if (this.sortOrder === 'most-rated') {
        movies.sort((a, b) => b.averageRating - a.averageRating);
      }

      this.filteredMovies = movies;
    },
    handleLogout() {
      console.log('Kullanıcı çıkış yaptı');
      sessionStorage.removeItem('userId');
    },
    saveFilters() {
      sessionStorage.setItem('selectedCategory', this.selectedCategory);
      sessionStorage.setItem('sortOrder', this.sortOrder);
    },
    loadFilters() {
      this.selectedCategory = sessionStorage.getItem('selectedCategory') || '';
      this.sortOrder = sessionStorage.getItem('sortOrder') || '';
    },
  },
  watch: {
    selectedCategory() {
      this.saveFilters();
      this.filterMovies();
    },
    sortOrder() {
      this.saveFilters();
      this.filterMovies();
    },
  },
  mounted() {
    this.fetchMovies();
    this.loadFilters();
  },
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #171717;
  color: #f5f5f5;
}

.search-dropdown-container {
  display: flex;
  align-items: center;
  margin: 20px 0;
}

.search-bar-wrapper {
  position: relative;
  width: 63%;
}

.search-icon {
  position: absolute;
  top: 50%;
  left: 15px;
  transform: translateY(-50%);
  color: #aaa;
  font-size: 18px;
}

.search-bar {
  width: 100%;
  padding: 10px 15px 10px 40px;
  border: 1px solid #444;
  border-radius: 15px;
  background-color: #222;
  color: #f5f5f5;
  font-size: 16px;
  outline: none;
  transition: all 0.3s ease;
}

.search-bar::placeholder {
  color: #aaa;
}

.search-bar:focus {
  border-color: #888;
  background-color: #333;
}

.dropdown-container {
  display: flex;
  width: 40%;
  margin-left: 30%;
}

.dropdown {
  flex: 1;
  margin-left: 5%;
  padding: 10px;
  border: 1px solid #444;
  border-radius: 5px;
  background-color: #222;
  color: #f5f5f5;
  font-size: 16px;
  overflow: hidden !important;
}

.dropdown:first-of-type {
  margin-left: 0;
}

.content {
  margin: 1% 10% 1% 10%;
  padding: 2% 5% 2% 5%;
  max-width: 70%;
  border-radius: 25px;
  background-color: #1c1c1c;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.media-item {
  position: relative;
  background-color: #2c2c2c;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  text-decoration: none;
}

.media-item:hover {
  transform: scale(1.05);
  box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.4);
}

.media-item img {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-bottom: 2px solid #3c3c3c;
  transition: opacity 0.3s ease;
}

.media-item:hover img {
  opacity: 0.8;
}

.media-item h3 {
  padding: 10px;
  font-size: 16px;
  text-align: center;
  color: #f5f5f5;
  margin: 0;
}

.heart-icon {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 24px;
  color: #fff;
  cursor: pointer;
  z-index: 1;
}

.heart-icon.active {
  color: red;
}
</style>
