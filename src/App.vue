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
    ...mapMutations([
      'spiner',
      'mutateIsConnect'
    ]),
    ...mapMutations('Wallet', [
      'mutateIsReady',
      'mutateIsEnable'
    ]),
    ...mapMutations('Static', [
      'mutateNetwork',
      'mutateNetworkConfig'
    ]),

    ...mapActions('Wallet', [
      'initPopup',
      'randomSeed'
    ]),

    async init() {
      let state;
      const data = await this.initPopup();
      
      if (data.reject) {
        state = data.reject;
      } else {
        state = data.resolve;
      }

      this.spiner();
      this.commonStateUpdate(state);
      this.routePush(state);
    },
    commonStateUpdate(state) {
      this.mutateIsReady(state.isReady);
      this.mutateIsEnable(state.isEnable);
      this.mutateNetwork(state.selectednet);
      this.mutateNetworkConfig(state.config);
      this.mutateIsConnect(state.networkStatus);
    },
    routePush(state) {
      if (!state.isReady) {
        this.$router.push({ name: 'First' });
      } else if (!state.isEnable) {
        this.$router.push({ name: 'Lock' });
      } else {
        this.$router.push({ name: 'Home' });
      }
    }
  },
  mounted() {
    this.init();
  }
}
</script>


<style lang="scss">
@import "./styles/main";
</style>
