<template>
  <Header :onLogout="handleLogout" />
  <div class="add-page">
    <h1>Yeni Film ya da Dizi Ekle</h1>
    <div v-if="!showMovie && !showSeries" class="selection-buttons">
      <button @click="showMovieForm" class="select-btn">Film Ekle</button>
      <button @click="showSeriesForm" class="select-btn">Dizi Ekle</button>
    </div>

    <div v-if="showMovie" class="form-container">
      <h2>Film Ekle</h2>
      <label for="movieName">Film Adı</label>
      <input v-model="newMovie.name" type="text" id="movieName" placeholder="Film adı girin" />

      <label for="movieCategory">Kategori (virgülle ayırarak girin)</label>
      <input v-model="newMovie.category" type="text" id="movieCategory" placeholder="Kategori girin" />

      <label for="movieSummary">Özet</label>
      <textarea v-model="newMovie.summary" id="movieSummary" placeholder="Özet girin"></textarea>

      <label for="movieDuration">Süre (dakika)</label>
      <input v-model="newMovie.duration" type="number" id="movieDuration" placeholder="Süre girin" />

      <label for="movieDirector">Yönetmen</label>
      <input v-model="newMovie.director" type="text" id="movieDirector" placeholder="Yönetmen adı girin" />

      <label for="movieImdb">IMDB Puanı</label>
      <input v-model="newMovie.imdb" type="number" id="movieImdb" placeholder="IMDB puanı girin" />

      <label for="movieScreenwriter">Senarist</label>
      <input v-model="newMovie.screenwriter" type="text" id="movieScreenwriter" placeholder="Senarist adı girin" />

      <label for="movieStars">Oyuncular (virgülle ayırarak girin)</label>
      <input v-model="newMovie.stars" type="text" id="movieStars" placeholder="Oyuncuları girin" />

      <label for="movieImg">Kapak Resmi URL</label>
      <input v-model="newMovie.img" type="text" id="movieImg" placeholder="Resim URL'sini girin" />

      <button @click="addMovie" class="save-btn">Ekle</button>
      <button @click="resetForm" class="cancel-btn">İptal</button>
    </div>

    <div v-if="showSeries" class="form-container">
      <h2>Dizi Ekle</h2>
      <label for="seriesName">Dizi Adı</label>
      <input v-model="newSeries.name" type="text" id="seriesName" placeholder="Dizi adı girin" />

      <label for="seriesCategory">Kategori (virgülle ayırarak girin)</label>
      <input v-model="newSeries.category" type="text" id="seriesCategory" placeholder="Kategori girin" />

      <label for="seriesSummary">Özet</label>
      <textarea v-model="newSeries.summary" id="seriesSummary" placeholder="Özet girin"></textarea>

      <label for="seriesSeasonCount">Sezon Sayısı</label>
      <input v-model="newSeries.seasonCount" type="number" id="seriesSeasonCount" placeholder="Sezon sayısını girin" />

      <label for="seriesDirector">Yönetmen</label>
      <input v-model="newSeries.director" type="text" id="seriesDirector" placeholder="Yönetmen adı girin" />

      <label for="seriesImdb">IMDB Puanı</label>
      <input v-model="newSeries.imdb" type="number" id="seriesImdb" placeholder="IMDB puanı girin" />

      <label for="seriesScreenwriter">Senarist</label>
      <input v-model="newSeries.screenwriter" type="text" id="seriesScreenwriter" placeholder="Senarist adı girin" />

      <label for="seriesStars">Oyuncular (virgülle ayırarak girin)</label>
      <input v-model="newSeries.stars" type="text" id="seriesStars" placeholder="Oyuncuları girin" />

      <label for="seriesImg">Kapak Resmi URL</label>
      <input v-model="newSeries.img" type="text" id="seriesImg" placeholder="Resim URL'sini girin" />

      <button @click="addSeries" class="save-btn">Ekle</button>
      <button @click="resetForm" class="cancel-btn">İptal</button>
    </div>
  </div>
</template>

<script>
import Header from './HeaderPage.vue';
import axios from 'axios';

export default {
  name: 'AddPage',
  components: {
    Header
  },
  data() {
    return {
      showMovie: false,
      showSeries: false,
      newMovie: {
        name: '',
        category: '',
        summary: '',
        duration: null,
        director: '',
        imdb: null,
        screenwriter: '',
        stars: '',
        img: ''
      },
      newSeries: {
        name: '',
        category: '',
        summary: '',
        seasonCount: null,
        director: '',
        imdb: null,
        screenwriter: '',
        stars: '',
        img: ''
      }
    };
  },
  methods: {
    handleLogout() {
      sessionStorage.removeItem('userId');
      this.$router.push('/');
    },
    showMovieForm() {
      this.showMovie = true;
      this.showSeries = false;
    },
    showSeriesForm() {
      this.showMovie = false;
      this.showSeries = true;
    },
    async addMovie() {
      this.newMovie.stars = this.newMovie.stars.split(',').map(star => star.trim());
      this.newMovie.category = this.newMovie.category.split(',').map(category => category.trim());

      try {
        await axios.post('http://localhost:5000/movies', this.newMovie);
        alert('Film başarıyla eklendi!');
        this.resetMovieForm();
        this.showMovie = false;
      } catch (error) {
        alert('Film eklenirken hata oluştu!');
      }
    },
    async addSeries() {
      this.newSeries.stars = this.newSeries.stars.split(',').map(star => star.trim());
      this.newSeries.category = this.newSeries.category.split(',').map(category => category.trim());

      try {
        await axios.post('http://localhost:5000/series', this.newSeries);
        alert('Dizi başarıyla eklendi!');
        this.resetSeriesForm();
        this.showSeries = false;
      } catch (error) {
        alert('Dizi eklenirken hata oluştu!');
      }
    },
    resetForm() {
      this.showMovie = false;
      this.showSeries = false;
    },
    resetMovieForm() {
      this.newMovie = {
        name: '',
        category: '',
        summary: '',
        duration: null,
        director: '',
        imdb: null,
        screenwriter: '',
        stars: '',
        img: ''
      };
    },
    resetSeriesForm() {
      this.newSeries = {
        name: '',
        category: '',
        summary: '',
        seasonCount: null,
        director: '',
        imdb: null,
        screenwriter: '',
        stars: '',
        img: ''
      };
    }
  }
};
</script>

<style scoped>
.add-page {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  background-color: #f4f4f4;
  border-radius: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

h1,
h2 {
  text-align: center;
  color: #121111;
  margin-bottom: 20px;
}

.selection-buttons {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.select-btn {
  width: 48%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.select-btn:hover {
  background-color: #0056b3;
}

.form-container {
  margin-top: 20px;
}

label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

input[type="text"],
input[type="number"],
textarea {
  width: 95%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

textarea {
  resize: none;
  height: 100px;
}

.save-btn {
  width: 100%;
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.save-btn:hover {
  background-color: #45a049;
}

.cancel-btn {
  width: 100%;
  padding: 10px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
}

.cancel-btn:hover {
  background-color: #c62828;
}
</style>