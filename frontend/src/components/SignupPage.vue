<template>
  <div class="signin-page">
    <div class="content-container">
      <div class="signin-container">
        <div class="logo-container">
          <img src="../pictures/logo2.png" class="logo" alt="Logo" />
        </div>
        <h2>Kayıt Ol</h2>
        <form @submit.prevent="handleSignUp">
          <div class="input-group">
            <label for="firstName">Ad:</label>
            <input type="text" id="firstName" v-model="firstName" required />
          </div>
          <div class="input-group">
            <label for="lastName">Soyad:</label>
            <input type="text" id="lastName" v-model="lastName" required />
          </div>
          <div class="input-group">
            <label for="email">Email:</label>
            <input type="email" id="email" v-model="email" required />
          </div>
          <div class="input-group">
            <label for="password">Şifre:</label>
            <input type="password" id="password" v-model="password" required />
          </div>
          <button type="submit" class="signin-button">Kayıt Ol</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    };
  },
  methods: {
    async handleSignUp() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        alert('Lütfen geçerli bir email adresi girin.');
        return;
      }

      try {
        const response = await axios.post('http://localhost:5000/signup', {
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          password: this.password
        });

        if (response.status === 200) {
          console.log('Kayıt başarılı!');
          alert('Kayıt Başarılı Bir Şekilde Oluşturuldu!');
          this.$router.push('/login');
        } else if (response.status === 409) {
          console.log('Email already exists');
          alert('Bu email adresi ile daha önce kayıt olunmuş.');
        } else {
          console.log(response.data.error);
        }
      } catch (error) {
        console.error('Bir hata oluştu:', error);
      }
    }
  }
};
</script>

<style scoped>
html,
body {
  height: 100%;
  margin: 0;
  overflow: hidden;
}

.signin-page {
  background-image: url('../pictures/background.png');
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.content-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.signin-container {
  width: 100%;
  max-width: 400px;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  text-align: center;
  background-color: rgba(255, 255, 255, 0.9);
  position: relative;
}

.logo-container {
  padding: 0;
  margin-bottom: 5%;
}

.logo {
  width: 250px;
  height: auto;
}

h2 {
  color: #171818;
  font-size: 28px;
}

.input-group {
  margin-bottom: 25px;
  text-align: left;
  max-width: 95%;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  font-size: 14px;
  color: #333333;
}

input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input:focus {
  border-color: #171818;
  outline: none;
}

.signin-button {
  width: 100%;
  background-color: #181919;
  color: #ffffff;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
}

.signin-button:hover {
  background-color: #040404;
}
</style>
