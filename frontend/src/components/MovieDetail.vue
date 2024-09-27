<template>
  <div class="wrapper">
    <Header :onLogout="handleLogout" />
    <div class="movie-container">
      <div class="movie-top-section">
        <img :src="movie.img" alt="Film Posteri" class="movie-poster" />
        <div class="movie-info">
          <h2 class="movie-name">{{ movie.name }}</h2>
          <div class="average-rating">
            <div class="stars">
              <span class="averageRatingNumber">{{ averageRating }}</span>
              <span v-for="n in 5" :key="n" class="star">
                <font-awesome-icon v-if="n <= Math.floor(averageRating)" :icon="['fas', 'star']" class="filled" />
                <font-awesome-icon v-else-if="n === Math.ceil(averageRating) && averageRating % 1 !== 0"
                  :icon="['fas', 'star-half-alt']" class="half-filled" />
                <font-awesome-icon v-else :icon="['fas', 'star']" class="empty" />
              </span>
              <span class="comments-lenght"> {{ comments.length }} Değerlendirme</span>
            </div>
            <button @click="addToWatchlist" class="watchlist-button">İzleme Listesine Ekle</button>
          </div>
        </div>
      </div>
      <div class="movie-detail">
        <label class="movie-detail-title">Yönetmen:</label>
        <p>{{ movie.director }}</p>
        <label class="movie-detail-title">Senarist:</label>
        <p> {{ movie.screenwriter }}</p>
        <label class="movie-detail-title">IMDB:</label>
        <p> {{ movie.imdb }}</p>
        <label class="movie-detail-title">Özet:</label>
        <p> {{ movie.summary }}</p>
        <label class="movie-detail-title">Oyuncular:</label>
        <p> {{ movie.stars ? movie.stars.join(', ') : 'Bilgi yok' }}</p>
      </div>

      <div class="comments-section">
        <h2>Yorumlar ({{ comments.length }})</h2>
        <div class="comment-form">
          <h3>Yorumunuz</h3>
          <div class="rating">
            <div class="stars">
              <span v-for="n in 5" :key="n" class="star" @click="setRating(n)">
                <font-awesome-icon :icon="['fas', 'star']" :class="{ 'filled': n <= rating }" />
              </span>
            </div>
          </div>
          <textarea v-model="newComment" placeholder="Yorumunuzu yazın..."></textarea>
          <button @click="submitComment" class="submit-comment-button">Gönder</button>
        </div>

        <div>
          <div v-for="comment in comments" :key="comment._id" class="comment-item">
            <div class="comment-header">
              <div class="comment-rating">
                <i v-for="n in comment.rating" :key="n" class="fas fa-star"></i>
              </div>
              <span v-for="n in 5" :key="n" class="star">
                <font-awesome-icon :icon="['fas', 'star']" :class="{ 'filled': n <= comment.rating }" />
              </span>
            </div>
            <p class="comment-text">{{ comment.text }}</p>
          </div>
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
  name: 'MovieDetail',
  components: {
    Header,
    FontAwesomeIcon,
  },
  data() {
    return {
      movie: {
        stars: [],
      },
      comments: [],
      newComment: '',
      rating: 0,
      averageRating: 0,
    };
  },
  methods: {
    async fetchMovieDetails() {
      const movieId = this.$route.params.id;
      try {
        const response = await axios.get(`http://localhost:5000/movie/${movieId}`);
        this.movie = response.data;
        this.fetchComments(movieId);
      } catch (error) {
        console.error('Film detayları alınamadı:', error);
      }
    },
    async fetchComments(movieId) {
      try {
        const response = await axios.get(`http://localhost:5000/comments/${movieId}/movie`);
        this.comments = response.data;

        const totalRating = this.comments.reduce((sum, comment) => sum + comment.rating, 0);
        this.averageRating = this.comments.length ? (totalRating / this.comments.length).toFixed(1) : 0;
      } catch (error) {
        console.error('Yorumlar alınamadı:', error);
      }
    },
    setRating(n) {
      console.log('Clicked star 1:', n);
      this.rating = n;
    },

    async submitComment() {
      const userId = sessionStorage.getItem('userId');
      const itemId = this.movie.movieid;

      if (!userId) {
        alert('Yorum yapabilmek için giriş yapmış olmalısınız.');
        return;
      }

      if (this.rating === 0) {
        alert('Lütfen bir yıldız seçin.');
        return;
      }

      try {
        const response = await axios.post('http://localhost:5000/comments', {
          userId: Number(userId),
          text: this.newComment,
          rating: this.rating,
          itemId,
          itemType: 'movie',
        });

        if (response.status === 201) {
          alert('Yorum eklendi.');
          this.newComment = ''; 
          this.rating = 0;
          await this.fetchComments(itemId); 
          await this.updateMovieStats(itemId);
        } else {
          alert('Bir hata oluştu.');
        }
      } catch (error) {
        console.error('Yorum eklenirken bir hata oluştu:', error);
        alert('Bir hata oluştu.');
      }
    },

    async updateMovieStats(movieId) {
      try {
        const totalRating = this.comments.reduce((sum, comment) => sum + comment.rating, 0);
        const averageRating = this.comments.length ? (totalRating / this.comments.length).toFixed(1) : 0;
        const commentCount = this.comments.length;

        await axios.put(`http://localhost:5000/movies/${movieId}`, {
          averageRating,
          commentCount
        });
      } catch (error) {
        console.error('Film istatistikleri güncellenirken bir hata oluştu:', error);
      }
    },

    async addToWatchlist() {
      const userId = sessionStorage.getItem('userId');
      const movieId = this.movie.movieid;

      if (!userId) {
        alert('Giriş yapmış bir kullanıcı olmalısınız.');
        return;
      }


      try {
        const response = await axios.post('http://localhost:5000/add-to-watchlist', {
          userId,
          itemId: movieId,
          itemType: 'movie',
        });

        if (response.status === 201) {
          alert('Film izleme listesine eklendi.');
        } else {
          alert('Bir hata oluştu.');
        }
      } catch (error) {
        console.error('İzleme listesine eklenirken bir hata oluştu:', error);
        alert('Bir hata oluştu.');
      }
    },
    handleLogout() {
      console.log('Kullanıcı çıkış yaptı');
    },
  },
  mounted() {
    this.fetchMovieDetails();
  },
};
</script>

<style scoped>
.movie-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  border: 1px solid #1c1c1c;
  border-radius: 8px;
  background-color: #1c1c1c;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.movie-top-section {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
}

.movie-poster {
  max-width: 300px;
  height: auto;
  border-radius: 8px;
  margin-right: 20px;
}

.movie-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.movie-name {
  margin-top: 10%;
  margin-bottom: 10px;
  font-size: 2.5em;
  color: #fff;
  text-align: left;
}

p {
  margin: 10px 0;
  font-size: 1em;
  color: #fff;
  text-align: left;
}

.watchlist-button {
  margin-top: 10%;
  padding: 10px 20px;
  background-color: #2196f3;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
  width: 100%;
}

.watchlist-button:hover {
  background-color: #1976d2;
}

.comments-section {
  margin-top: 20px;
  padding: 20px;
  background-color: #2c2c2c;
  border-radius: 8px;
}

.comment-item {
  margin-bottom: 15px;
  color: #fff;
  border-bottom: 1px solid #444;
  padding-bottom: 10px;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.comment-rating {
  margin-right: 10px;
}

.comment-form textarea {
  width: 97%;
  height: 80px;
  margin-bottom: 10px;
  padding: 10px;
  border-radius: 5px;
  resize: none;
}

.submit-comment-button {
  padding: 10px 20px;
  background-color: #4caf50;
  border: none;
  border-radius: 5px;
  color: white;
  cursor: pointer;
}

.submit-comment-button:hover {
  background-color: #45a049;
}

.rating {
  display: flex;
  align-items: center;
}

.rating p {
  margin-right: 10px;
}

.stars {
  display: flex;
  align-items: center;
}


.star {
  font-size: 20px;
  margin-right: 4px;
}

.filled {
  color: gold;
}

.half-filled {
  color: gold;
}

.star.empty {
  color: lightgray;
}

h3 {
  text-align: left;
  margin: 2% 0;
}

.averageRatingNumber {
  font-weight: bold;
  font-size: 20px;
  margin-right: 3%;
}

.comments-lenght {
  margin-left: 5%;
  font-size: 15px;
}

.movie-detail {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 10px;
  align-items: start;
  margin-top: 3%;
  margin-bottom: 3%;
  margin-left: 1%;
}

.movie-detail p {
  margin-bottom: 0;

}

.movie-detail-title {
  font-weight: bold;
  min-width: 150px;
  text-align: left;
  margin-top: 7%;
}

.comment-text {
  margin: 1.5%;
}
</style>
