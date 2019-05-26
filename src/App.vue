<template>
  <div id="app">
    <router-view/>
  </div>
</template>


<script>
import { mapMutations } from 'vuex'

export default {
  name: 'App',
  methods: {
    ...mapMutations(['spiner'])
  },
  mounted() {
    this.spiner();
    this.$router.push({ name: 'Home' });
  }
}
</script>


<style lang="scss">
@import "./styles/main";
</style>
