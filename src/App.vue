<template>
  <div id="app">
    <router-view/>
  </div>
</template>


<script>
export default {
  name: 'App',
  mounted() {
    this.$router.push({ name: 'Home' });
  }
}
</script>


<style lang="scss">
@import "./styles/main";
</style>
