<template>
  <div class="wrapper">
    <Header :onLogout="handleLogout" />
    <div class="form-container">
      <h2 class="form-title">Destek</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="email">Email:</label>
          <input id="email" type="email" v-model="email" required class="input-field" />
        </div>
        <div class="form-group">
          <label for="suggestions">Önerileriniz:</label>
          <textarea id="suggestions" v-model="suggestions" rows="4" required class="text-area" />
        </div>
        <button type="submit" class="submit-button">Gönder</button>
      </form>
    </div>
  </div>
</template>


<script>
import axios from 'axios';
import Header from '@/components/HeaderPage.vue';

export default {
  name: 'SupportForm',
  components: {
    Header
  },
  data() {
    return {
      email: '',
      suggestions: '',
    };
  },
  methods: {
    async handleSubmit() {
      try {
        await axios.post('http://localhost:5000/support', {
          email: this.email,
          suggestions: this.suggestions,
        });
        alert('Form başarı ile gönderildi.');
      } catch (error) {
        console.error('Form gönderilirken bir hata oluştu:', error);
        alert('Form gönderilirken bir hata oluştu.');
      }
    },
  },
};
</script>

<style scoped>
.form-title {
  text-align: center;
  color: #121111;
  margin-bottom: 20px;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: #f4f4f4;
  border-radius: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  margin: 20px auto;
  max-width: 70%;
  padding: 20px;
}

.form-group {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

label {
  flex: 1;
  font-weight: bold;
  color: #555;
  min-width: 150px;
}

.input-field,
.text-area {
  flex: 2;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1em;
  box-sizing: border-box;
  margin-bottom: 5%;
}

.text-area {
  resize: none;
}

.submit-button {
  padding: 10px 20px;
  background-color: #4caf50;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  align-self: center;
}

.submit-button:hover {
  background-color: #45a049;
}
</style>
