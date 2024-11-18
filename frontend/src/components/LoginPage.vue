<template>
  <div class="login-page">
    <div class="content-container">
      <div class="login-container">
        <div class="logo-container">
          <img src="../pictures/logo2.png" class="logo" alt="Logo" />
        </div>
        <h2>Giriş Yap</h2>
        <form @submit.prevent="handleLogin">
          <div class="input-group">
            <label for="email">Email:</label>
            <input type="email" id="email" v-model="email" required />
          </div>
          <div class="input-group">
            <label for="password">Şifre:</label>
            <input type="password" id="password" v-model="password" required />
            <a @click="handleForgotPassword" class="forgot-password-link">Parolamı Unuttum</a>
          </div>
          <button type="submit" class="login-button">Giriş Yap</button>
        </form>
        <a href="/signup" class="forgot-password-link">Hesabınız yok mu? </a>
      </div>
    </div>
    <div v-if="showAlert" class="modal-overlay" @click="showAlert = false">
      <div class="modal-content" @click.stop>
        <p class="alert-message">Email ya da şifreniz hatalı.</p>
        <button class="modal-close" @click="showAlert = false">Kapat</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      email: '',
      password: '',
      showAlert: false
    };
  },
  methods: {
    async handleLogin() {
      try {
        const response = await axios.post('http://localhost:5000/login', {
          email: this.email,
          password: this.password
        });

        if (response.status === 200) {
          sessionStorage.setItem('isAuthenticated', 'true');
          sessionStorage.setItem('userId', response.data.userId);
          sessionStorage.setItem('userRole', response.data.role);
          console.log('Kullanıcı ID\'si:', response.data.userId);
          console.log('Kullanıcı Rolü:', response.data.role);
          this.$router.push('/');
        } else {
          this.showAlert = true;
        }
      } catch (error) {
        console.error('Bir hata oluştu:', error);
        this.showAlert = true;
      }
    },
    handleForgotPassword() {
      this.$router.push('/resetpassword');
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

.login-page {
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

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 40px 30px;
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
  margin-bottom: 30px;
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

.login-button {
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

.login-button:hover {
  background-color: #040404;
}

.forgot-password-link {
  color: #181919;
  text-decoration: underline;
  cursor: pointer;
  margin-top: 10px;
  display: block;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #ffffff;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  max-width: 400px;
  width: 100%;
  position: relative;
}

.alert-message {
  font-size: 16px;
  margin-bottom: 20px;
  color: #000;
}

.modal-close {
  background-color: #181919;
  color: #ffffff;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
}
</style>
