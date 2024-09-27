<template>
  <Header :onLogout="handleLogout" />
  <div class="account-settings">
    <h1 v-if="!showPasswordForm">Hesap Ayarları</h1>

    <div v-if="!showPasswordForm" class="general-info">
      <label>Ad</label>
      <input type="text" v-model="user.firstName" :disabled="!isEditing" />

      <label>Soyad</label>
      <input type="text" v-model="user.lastName" :disabled="!isEditing" />

      <label>Email</label>
      <input type="email" v-model="user.email" :disabled="!isEditing" />
    </div>

    <div class="password-section">
      <h3 @click="togglePasswordForm" class="password-link">
        <a v-if="!showPasswordForm && !isEditing" href="javascript:void(0)">Şifremi Değiştir</a>
      </h3>
      <h2 v-if="showPasswordForm"> Şifremi Değiştir</h2>
      <div v-if="showPasswordForm" class="password-form">
        <label>Eski Şifre</label>
        <input type="password" v-model="oldPassword" />

        <label>Yeni Şifre</label>
        <input type="password" v-model="newPassword" />

        <label>Yeni Şifrenizi Onaylayın</label>
        <input type="password" v-model="confirmPassword"/>

        <div class="password-actions">
          <button @click="savePassword" class="save-btn">Kaydet</button>
          <button @click="cancelPasswordChange" class="cancel-btn">İptal</button>
        </div>
      </div>
    </div>

    <div class="actions" v-if="!showPasswordForm">
      <button v-if="!isEditing" @click="enableEditing" class="edit-btn">Düzenle</button>
      <button v-if="!isEditing" @click="deleteAccount" class="delete-btn">Hesabımı Sil</button>
      <button v-if="isEditing" @click="cancelChanges" class="cancel-btn">İptal</button>
      <button v-if="isEditing" @click="saveChanges" class="save-btn">Kaydet</button>
    </div>
  </div>
</template>


<script>
import axios from 'axios';
import Header from '@/components/HeaderPage.vue';

export default {
  name: 'AccountSettings',
  components: {
    Header
  },
  data() {
    return {
      user: {
        firstName: '',
        lastName: '',
        email: ''
      },
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
      isEditing: false,
      showPasswordForm: false
    };
  },
  mounted() {
    this.loadUserData();
  },
  methods: {
    async loadUserData() {
      try {
        const response = await axios.get('http://localhost:5000/account', { withCredentials: true });
        this.user = response.data;
      } catch (error) {
        console.error('Failed to load user data:', error);
      }
    },
    async saveChanges() {
      if (this.showPasswordForm) {
        return;
      }
      try {
        await axios.put('http://localhost:5000/account', {
          firstName: this.user.firstName,
          lastName: this.user.lastName,
          email: this.user.email
        });
        alert('Hesabınız başarılı bir şekilde güncellendi!');
        this.isEditing = false;
      } catch (error) {
        console.error('Failed to save changes:', error);
        alert('Değişiklik sırasında bir hata oluştu.');
      }
    },
    async savePassword() {
      try {
        if (this.newPassword && this.newPassword !== this.confirmPassword) {
          alert('Şifreleriniz aynı değil!');
          return;
        }
        await axios.put('http://localhost:5000/change-password', {
          oldPassword: this.oldPassword,
          newPassword: this.newPassword
        });
        alert('Şifreniz başarılı bir şekilde değiştirildi!');
        this.showPasswordForm = false; 
      } catch (error) {
        console.error('Failed to change password:', error);
        alert('Şifre değiştirilirken bir hata oluştu.');
      }
    },
    async deleteAccount() {
      if (confirm('Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
        try {
          await axios.delete('http://localhost:5000/account');
          alert('Hesabınız başarılı bir şekilde silindi.');
          this.$router.push('/login'); 
        } catch (error) {
          console.error('Failed to delete account:', error);
          alert('Hesabınız silinirken bir sorunla karşılaşıldı.');
        }
      }
    },
    cancelChanges() {
      this.loadUserData();
      this.isEditing = false;
    },
    cancelPasswordChange() {
      this.oldPassword = '';
      this.newPassword = '';
      this.confirmPassword = '';
      this.showPasswordForm = false; 
    },
    enableEditing() {
      this.isEditing = true;
    },
    togglePasswordForm() {
      this.showPasswordForm = !this.showPasswordForm;
    }
  }
};
</script>


<style scoped>
.account-settings {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  background-color: #f4f4f4;
  border-radius: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  color: #121111;
  margin-bottom: 20px;
}

.general-info,
.password-section {
  margin-bottom: 30px;
}

label {
  display: inline-block;
  width: 50%;
  font-weight: bold;
  margin-bottom: 5px;
  color: #555;
  text-align: left;
}

input[type="text"],
input[type="email"],
input[type="password"] {
  width: 40%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

input[disabled] {
  background-color: #e9e9e9;
}

.password-section {
  cursor: pointer;
}

.password-link a {
  color: #007bff;
  text-decoration: none;
  font-size: 18px;
}

.password-link a:hover {
  text-decoration: underline;
}

.password-form {
  margin-top: 10px;
}

.password-actions {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-left:3%;
  margin-right: 3%;
}

.save-btn,
.cancel-btn,
.delete-btn,
.edit-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  color: #ffffff;
  transition: background-color 0.3s ease;
}

.save-btn {
  background-color: #4CAF50;
}

.save-btn:hover {
  background-color: #45a049;
}

.cancel-btn {
  background-color: #f44336;
}

.cancel-btn:hover {
  background-color: #e53935;
}

.delete-btn {
  background-color: #ff4444;
}

.delete-btn:hover {
  background-color: #e53935;
}

.edit-btn {
  background-color: #007bff;
}

.edit-btn:hover {
  background-color: #0056b3;
}

button:disabled {
  background-color: #e0e0e0;
  cursor: not-allowed;
}

h3 {
  color: #333;
  margin-bottom: 10px;
  text-align: left;
  margin-left: 3%;
}
h2{
  text-align: center;
  color: #121111;
  margin-bottom: 20px;
}
</style>
