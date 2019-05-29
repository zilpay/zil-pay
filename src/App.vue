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
      'mutateIsEnable',
      'mutateWallet'
    ]),
    ...mapMutations('Static', [
      'mutateNetwork',
      'mutateNetworkConfig'
    ]),
    ...mapMutations('Transactions', [
      'mutateTransactions',
      'mutateConfirmationTx'
    ]),

    ...mapActions('Wallet', [
      'initPopup',
      'randomSeed'
    ]),

    async init() {
      this.spiner();
      
      let state;
      const data = await this.initPopup();
      
      if (data.reject) {
        state = data.reject;
      } else {
        state = data.resolve;
        this.dataStateUpdate(state.data);
      }
      
      this.commonStateUpdate(state);
      this.routePush(state);
    },
    commonStateUpdate(state) {
      this.mutateIsReady(state.isReady);
      this.mutateIsEnable(state.isEnable);
      this.mutateNetwork(state.selectednet || state.data.selectednet);
      this.mutateNetworkConfig(state.config || state.data.config);
      this.mutateIsConnect(state.networkStatus);
    },
    dataStateUpdate(state) {
      if (!state) {
        return null;
      }

      this.mutateWallet(state.wallet);
      this.mutateTransactions(state.transactions);
      this.mutateConfirmationTx(state.confirm);
    },
    routePush(state) {
      if (!state.isReady) {
        this.$router.push({ name: 'First' });
      } else if (!state.isEnable) {
        this.$router.push({ name: 'Lock' });
      } else if (state.data.confirm && state.data.confirm.length > 0) {
        this.$router.push({ name: 'Popup' });
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
