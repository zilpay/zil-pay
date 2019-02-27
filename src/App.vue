<template>
  <div id="app">
    <NavBar/>
    <router-view/>
  </div>
</template>

<script>
import NavBar from './components/UI/NavBar'
import chromep from 'chrome-promise'

export default {
  name: 'App',
  components: { NavBar },
  mounted() {
    this.preStart();
  },
  methods: {
    async preStart() {
      let createPage = this.$router.options.routes[1];
      let lockPage = this.$router.options.routes[0];
      let seed = await chromep.storage.local.get('seedHash');
      
      seed = Object.keys(seed);
      
      if (seed.length > 0) {
        this.$router.push(lockPage.path);
      } else {
        this.$router.push(createPage.path);
      }
    }
  }
}
</script>



<style lang="scss">
@import './styles/bootstrap';
.container {
  padding: 5%;
}
.point {
  cursor: pointer;
}
</style>
