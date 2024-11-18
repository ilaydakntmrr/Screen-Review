<template>
  <div class="reset-password-page">
    <div class="content-container">
      <div class="reset-password-container">
        <h1>Şifre Sıfırlama</h1>
        <form @submit.prevent="handleResetPassword">
          <div class="input-group">
            <label for="email">Email:</label>
            <input type="email" id="email" v-model="email" required />
          </div>
          <div class="input-group">
            <label for="new-password">Yeni Şifre:</label>
            <input type="password" id="new-password" v-model="newPassword" required />
          </div>
          <div class="input-group">
            <label for="confirm-password">Yeni Şifreyi Onayla:</label>
            <input type="password" id="confirm-password" v-model="confirmPassword" required />
          </div>
          <div class="form-actions">
            <button type="submit" class="submit-btn">Şifreyi Sıfırla</button>
            <button @click="cancelReset" type="button" class="cancel-btn">İptal</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ResetPassword',
  data() {
    return {
      email: '',
      newPassword: '',
      confirmPassword: ''
    };
  },
  methods: {
    async handleResetPassword() {
      if (this.newPassword !== this.confirmPassword) {
        alert('Şifreler uyuşmuyor!');
        return;
      }
      try {
        const response = await axios.post('http://localhost:5000/reset-password', {
          email: this.email,
          newPassword: this.newPassword
        });

        if (response.status === 200) {
          alert('Şifre başarıyla sıfırlandı.');
          this.$router.push('/login');
        } else {
          alert('Bir hata oluştu.');
        }
      } catch (error) {
        console.error('Şifre sıfırlanırken bir hata oluştu:', error);
        alert('Bir hata oluştu.');
      }
    },
    cancelReset() {
      this.$router.push('/login');
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

.reset-password-page {
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

.reset-password-container {
  width: 100%;
  max-width: 400px;
  padding: 40px 30px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  text-align: center;
  background-color: rgba(255, 255, 255, 0.9);
  position: relative;
}

h1 {
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

input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input[type="email"]:focus,
input[type="password"]:focus {
  border-color: #171818;
  outline: none;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.submit-btn,
.cancel-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  color: #ffffff;
  transition: background-color 0.3s ease;
}

.submit-btn {
  background-color: #181919;
}

.submit-btn:hover {
  background-color: #040404;
}

.cancel-btn {
  background-color: #f44336;
}

.cancel-btn:hover {
  background-color: #e53935;
}
</style>