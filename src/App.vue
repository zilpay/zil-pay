<template>
  <div id="app">
    <NavBar/>
    <router-view/>
  </div>
</template>

<script>
import NavBar from './components/UI/NavBar'

export default {
  name: 'App',
  components: { NavBar },
  mounted() {
    this.$router.push('/');
  }
}
</script>



<style lang="scss">
@import './styles/bootstrap';
.container {
  padding: 5%;
}
</style>
