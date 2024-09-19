<template>
  <div>
    <nav class="navbar">
      <div class="logo-container">
        <router-link to="/" class="logo-text">
          <img src="../pictures/logo.png" class="logo" alt="Logo" />
        </router-link>
      </div>
      <div class="nav-links">
        <router-link to="/" class="nav-link">
          <font-awesome-icon :icon="['fas', 'house']" style="color: #ffffff;" /> Home
        </router-link>
        <router-link to="/movies" class="nav-link">
          <font-awesome-icon :icon="['fas', 'film']" style="color: #ffffff;" /> Movies
        </router-link>
        <router-link to="/series" class="nav-link">
          <font-awesome-icon :icon="['fas', 'tv']" style="color: #ffffff;" /> Series
        </router-link>
        <router-link to="/supportform" class="nav-link">
          <font-awesome-icon :icon="['fas', 'headset']" /> Support
        </router-link>

        <div v-if="isLoggedIn" class="dropdown">
          <button @click="toggleDropdown" class="nav-link">
            <font-awesome-icon :icon="['fas', 'user']" /> Account
          </button>
          <div v-if="dropdownOpen" class="dropdown-menu">
            <router-link to="/watchlist" class="dropdown-item">
              <font-awesome-icon :icon="['fas', 'clock']" style="color: #ffffff;" /> Watchlist
            </router-link>
            <router-link to="/favorites" class="dropdown-item">
              <font-awesome-icon :icon="['fas', 'heart']" style="color: #ffffff;" /> Favorites
            </router-link>
            <router-link to="/account-settings" class="dropdown-item">
              <font-awesome-icon :icon="['fas', 'gear']" style="color: #ffffff;" /> Settings
            </router-link>
            <router-link v-if="isAdmin" to="/add" class="dropdown-item">
              <font-awesome-icon :icon="['fas', 'plus']" style="color: #ffffff;" /> Ekle
            </router-link>
            <button @click="handleLogout" class="dropdown-item">
              <font-awesome-icon :icon="['fas', 'arrow-right-from-bracket']" style="color: #ffffff;" /> Sign Out
            </button>
          </div>
        </div>

        <div v-else>
          <router-link to="/login" class="nav-link">
            <font-awesome-icon :icon="['fas', 'user']" /> Giriş Yap
          </router-link>
        </div>
      </div>
    </nav>
    <div class="divider"></div>
  </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

export default {
  name: 'HeaderPage',
  components: {
    FontAwesomeIcon,
  },
  data() {
    return {
      isLoggedIn: false,
      isAdmin: false,
      dropdownOpen: false,
    };
  },
  methods: {
    toggleDropdown(event) {
      this.dropdownOpen = !this.dropdownOpen;
      event.stopPropagation();
    },
    handleLogout() {
      sessionStorage.clear();
      this.isLoggedIn = false;
      this.isAdmin = false;
      this.$router.push('/');
    },
    handleClickOutside(event) {
      const dropdown = this.$el.querySelector('.dropdown-menu');
      if (this.dropdownOpen && !dropdown.contains(event.target) && !event.target.closest('.dropdown')) {
        this.dropdownOpen = false;
      }
    }
  },
  mounted() {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');
    const userRole = sessionStorage.getItem('userRole');

    if (isAuthenticated === 'true') {
      this.isLoggedIn = true;
      if (userRole === 'admin') {
        this.isAdmin = true;
      }
    }

    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  }
};
</script>


<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  padding-right: 5%;
  height: 80px;
  position: relative;
}

.logo-container {
  display: flex;
  align-items: center;
  margin-left: 0;
}

.logo {
  width: 240px;
  height: auto;
  border-radius: 10px;
  margin-top: 20%;
  margin-left: 10%;
}

.logo-text {
  margin-left: 10px;
  font-size: 3rem;
  font-weight: bold;
  font-family: 'Courier New';
  text-decoration: none;
}

.nav-links {
  display: flex;
  align-items: center;
  margin-top: 5%;
  margin-left: 0;
  position: relative;
  gap: 15px;
}

.nav-link {
  text-decoration: none;
  font-weight: bold;
  padding: 5px 10px;
  transition: background-color 0.3s ease, color 0.3s ease;
  border-radius: 5px;
}

.nav-link:last-child {
  margin-right: 0;
}

.nav-link:hover {
  background-color: #3d4042;
  color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.dropdown {
  position: relative;
  display: inline-block;

}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #222;
  border-radius: 5px;
  width: 150px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);

}

.dropdown-item {
  padding: 3.5%;
  color: #fff;
  text-decoration: none;
  transition: background-color 0.3s ease;
  text-align: left;
  margin: 4% 3% 0% 3%;
  font-size: 15px;
}

.dropdown-item:last-child {
  margin-top: 4%;

}

.dropdown-item:hover {
  background-color: #3d4042;
}

.divider {
  width: 100%;
  height: 1px;
  background-color: #ccc;
  margin-top: 5%;
}

button {
  border-color: transparent;
  background-color: transparent;
  color: #fff;
  font-size: 15px;
}

button:focus {
  background-color: #3d4042;
}
</style>
