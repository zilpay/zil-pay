<template>
  <div id="app">
    <router-view/>
  </div>
</template>


<script>
import { mapMutations, mapActions } from 'vuex'

export default {
  name: 'App',
  methods: {
    ...mapMutations(['spiner']),
    ...mapActions('Walllet', [
      'initPopup',
      'randomSeed'
    ]),

    async initPopUp() {
      const data = await this.randomSeed();
      console.log(data);
      this.spiner();
    }
  },
  mounted() {
    this.initPopUp();
    this.$router.push({ name: 'Home' });
  }
}
</script>


<style lang="scss">
@import "./styles/main";
</style>
