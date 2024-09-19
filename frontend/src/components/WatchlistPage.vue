<template>
  <div class="container">
    <Header :onLogout="handleLogout" />
    <div class="content">
      <h1>İzleme Listem</h1>
      <div v-if="watchlistItems.length === 0" class="empty-message">
        <p>İzleme listenizde öğe bulunmamaktadır.</p>
      </div>
      <div v-else class="media-list">
        <div v-for="item in watchlistItems" :key="item._id" class="media-item">
          <img :src="item.img" alt="Media Poster" />
          <div class="media-info">
            <h3>{{ item.name }}</h3>
            <p><strong>Yönetmen:</strong> {{ item.director }}</p>
            <p><strong>Oyuncular:</strong> {{ item.stars.join(', ') }}</p>
          </div>
          <font-awesome-icon :icon="['fas', 'x']" class="remove-icon" @click="removeFromWatchlist(item)" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from '@/components/HeaderPage.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import axios from 'axios';

export default {
  name: 'WatchlistPage',
  components: {
    Header,
    FontAwesomeIcon,
  },
  data() {
    return {
      watchlistItems: [],
    };
  },
  methods: {
    async fetchWatchlist() {
      const userId = sessionStorage.getItem('userId');
      if (!userId) return;

      try {
        const response = await axios.get(`http://localhost:5000/watchlist/details/${userId}`);
        this.watchlistItems = response.data;
      } catch (error) {
        console.error('İzleme listesi öğeleri alınamadı:', error);
      }
    },
    async removeFromWatchlist(item) {
      const userId = sessionStorage.getItem('userId');
      if (!userId) return;

      try {
        const itemId = item.itemType === 'movie' ? item.movieid : item.seriesid;

        const response = await axios.delete('http://localhost:5000/watchlist', {
          data: {
            userId: Number(userId),
            itemId: itemId,
            itemType: item.itemType
          }
        });

        if (response.status === 200) {
          this.fetchWatchlist();
        } else {
          console.error('API Yanıtı:', response.data);
        }
      } catch (error) {
        console.error('İzleme listesinden öğe kaldırılamadı:', error);
      }
    },
    handleLogout() {
      console.log('Kullanıcı çıkış yaptı');
      sessionStorage.removeItem('userId');
    },
  },
  mounted() {
    this.fetchWatchlist();
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

.content {
  margin: 1% auto;
  padding: 2% 5% 2% 5%;
  width: 50%;
  border-radius: 25px;
  background-color: #1c1c1c;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 3%;
}

h1 {
  margin-bottom: 2%;
}

.media-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.media-item {
  display: flex;
  align-items: center;
  background-color: #2c2c2c;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  padding: 10px;
  width: 100%;
  position: relative;
}

.media-item:hover {
  transform: scale(1.05);
  box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.4);
}

.media-item img {
  width: 120px;
  height: 120px;
  object-fit: contain;
  border-radius: 8px;
  margin-right: 15px;
}

.media-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-grow: 1;
}

.media-info h3 {
  font-size: 16px;
  color: #f5f5f5;
  margin: 0 0 5px 0;
}

.media-info p {
  margin: 2px 0;
  color: #b0b0b0;
}

.remove-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  color: #ff0000;
  cursor: pointer;
  font-size: 20px;
}

.empty-message {
  color: #f5f5f5;
  font-size: 18px;
  text-align: center;
  margin-top: 20px;
}
</style>
