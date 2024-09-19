<template>
  <div class="container">
    <Header :onLogout="handleLogout" />
    <div class="content">
      <h1>Bunları izlediniz mi?</h1>
      <div id="carouselExample" class="carousel slide">
        <div class="carousel-inner">
          <div v-for="(media, index) in carouselMedia" :key="media._id"
            :class="{ 'carousel-item': true, active: index === 0 }">
            <img :src="media.img" class="d-block w-100" alt="Media Poster">

          </div>
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
          <font-awesome-icon :icon="['fas', 'fa-chevron-left']" style="color: #ffffff;" />
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
          <font-awesome-icon :icon="['fas', 'fa-chevron-right']" style="color: #ffffff;" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Header from '@/components/HeaderPage.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import axios from 'axios';

export default {
  name: 'HomePage',
  components: {
    Header,
    FontAwesomeIcon
  },
  data() {
    return {
      movies: [],
      series: [],
      filteredMedia: [],
      carouselMedia: [],
      searchQuery: '',
      categories: [
        'Aksiyon', 'Komedi', 'Dram', 'Korku', 'Romantik', 'Bilim Kurgu',
        'Fantastik', 'Gerilim', 'Suç', 'Belgesel', 'Animasyon', 'Macera'
      ],
    };
  },
  methods: {
    async fetchData() {
      try {
        const response = await axios.get('http://localhost:5000/home');
        this.movies = response.data.movies;
        this.series = response.data.series;
        this.combineMedia();
        this.setCarouselMedia();
      } catch (error) {
        console.error('Veriler alınamadı:', error);
      }
    },
    combineMedia() {
      this.filteredMedia = [...this.movies, ...this.series];
    },
    setCarouselMedia() {
      const allMedia = [...this.movies, ...this.series];
      this.carouselMedia = this.getRandomElements(allMedia, 5);
    },
    getRandomElements(arr, num) {
      const shuffled = arr.slice().sort(() => 0.5 - Math.random());
      return shuffled.slice(0, num);
    },
    handleLogout() {
      console.log('Kullanıcı çıkış yaptı');
    },
  },
  mounted() {
    this.fetchData();
  },
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  background-color: #171717;
  color: #f5f5f5;
  min-height: 100vh;
  justify-content: center;
}

.content {
  width: 50%;
  padding: 2% 5%;
  border-radius: 25px;
  background-color: #1c1c1c;
  margin: 2% auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

h1 {
  margin-bottom: 3%;
}

.carousel-item img {
  width: auto;
  height: 400px;
  object-fit: cover;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.media-item {
  background-color: #2c2c2c;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
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
  font-size: 18px;
  color: #f5f5f5;
  text-align: center;
}


button {
  position: absolute;
  top: 50%;
  width: 5%;
  height: 5%;
  color: #fff;
  text-align: center;
  line-height: 0;
  cursor: pointer;
  border: none;
  z-index: 1;
  font-size: 2rem;
  background-color: transparent;
}

.carousel-control-prev {
  left: 0;
}

.carousel-control-next {
  right: 0;
}
</style>
