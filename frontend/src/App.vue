<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
* {
  margin: 0%;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  text-align: center;
  color: #f5f5f5;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  background-color: #171717;
}

body {
  background-color: #171717;
}

a {
  color: #f5f5f5;
  text-decoration: none;
}
</style>
