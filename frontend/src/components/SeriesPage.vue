<template>
  <div class="container">
    <Header :onLogout="handleLogout" />
    <div class="content">
      <div class="search-dropdown-container">
        <div class="search-bar-wrapper">
          <font-awesome-icon icon="search" class="search-icon" />
          <input type="text" v-model="searchQuery" @input="filterSeries" placeholder="Dizi ara..." class="search-bar" />
        </div>
        <div class="dropdown-container">
          <select class="dropdown" v-model="selectedCategory" @change="filterSeries">
            <option disabled selected>Kategoriler</option>
            <option value="">Tüm Kategoriler</option>
            <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
          </select>
          <select class="dropdown" v-model="sortOrder" @change="filterSeries">
            <option value="">Sırala</option>
            <option value="imdb-desc">IMDB Yüksekten Düşüğe</option>
            <option value="imdb-asc">IMDB Düşükten Yükseğe</option>
            <option value="most-rated">En Çok Değerlendirilen</option>
          </select>
        </div>
      </div>
      <div v-if="noResults" class="no-results-message">
        Üzgünüz, bu kategoride ürün bulunamamıştır.
      </div>
      <div v-else class="media-grid">
        <div v-for="seriesItem in filteredSeries" :key="seriesItem.seriesid" class="media-item">
          <font-awesome-icon :icon="['fas', 'heart']" class="heart-icon" @click.stop="handleHeartClick(seriesItem)"
            :class="{ 'active': isFavorite(seriesItem) }" />
          <router-link :to="`/series/${seriesItem.seriesid}`">
            <img :src="seriesItem.img" alt="Series Poster" />
            <h3>{{ seriesItem.name }}</h3>
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
  name: 'SeriesPage',
  components: {
    Header,
    FontAwesomeIcon,
  },
  data() {
    return {
      series: [],
      filteredSeries: [],
      searchQuery: '',
      selectedCategory: '',
      sortOrder: '',
      categories: [
        'Aksiyon', 'Komedi', 'Dram', 'Korku', 'Romantik', 'Bilim Kurgu',
        'Fantastik', 'Gerilim', 'Polisiye', 'Belgesel', 'Animasyon', 'Macera'
      ],
      favorites: [],
      noResults: false,
    };
  },
  methods: {
    async fetchSeries() {
      try {
        const response = await axios.get('http://localhost:5000/home');
        this.series = response.data.series;
        this.filterSeries();
        this.fetchFavorites();
      } catch (error) {
        console.error('Diziler alınamadı:', error);
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
    async handleHeartClick(series) {
      const userId = sessionStorage.getItem('userId');
      if (!userId) {
        alert('Lütfen giriş yapın');
        return;
      }

      if (this.isFavorite(series)) {
        try {
          await axios.delete('http://localhost:5000/favorites', {
            data: {
              userId: Number(userId),
              itemId: series.seriesid,
              itemType: 'series'
            }
          });
          this.removeFromFavorites(series);
        } catch (error) {
          console.error('Favorilerden çıkarılırken bir hata oluştu:', error);
        }
      } else {
        try {
          await axios.post('http://localhost:5000/favorites', {
            userId: Number(userId),
            itemId: series.seriesid,
            itemType: 'series'
          });
          this.addToFavorites(series);
        } catch (error) {
          console.error('Favoriye eklenirken bir hata oluştu:', error);
        }
      }
    },
    addToFavorites(series) {
      if (this.isFavorite(series)) {
        return;
      }

      this.favorites.push({
        itemId: series.seriesid,
        itemType: 'series'
      });
    },
    removeFromFavorites(series) {
      this.favorites = this.favorites.filter(fav => fav.itemId !== series.seriesid);
    },
    isFavorite(series) {
      const isFav = this.favorites.some(fav => fav.itemId === series.seriesid && fav.itemType === 'series');
      console.log(`Dizi ID: ${series.seriesid} Favori mi? ${isFav}`);
      return isFav;
    },
    filterSeries() {
      let series = this.series.filter(series =>
        series.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );

      if (this.selectedCategory) {
        series = series.filter(series =>
          series.category.includes(this.selectedCategory)
        );
      }

      if (this.sortOrder === 'imdb-desc') {
        series.sort((a, b) => b.imdb - a.imdb);
      } else if (this.sortOrder === 'imdb-asc') {
        series.sort((a, b) => a.imdb - b.imdb);
      } else if (this.sortOrder === 'most-rated') {
        series.sort((a, b) => b.averageRating - a.averageRating);
      }

      this.filteredSeries = series;
      this.noResults = series.length === 0;
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
      this.filterSeries();
    },
    sortOrder() {
      this.saveFilters();
      this.filterSeries();
    },
  },
  mounted() {
    this.fetchSeries();
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
