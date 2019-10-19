<template>
  <div class="nav-container">
    <nav>
      <div class="left">
        <img
          :src="connectURL"
          height="30"
          @click="$router.push({name: 'Networks'})"
        >
        <img src="/icons/qr-code.svg" height="30"
             class="point"
             @click="$router.push({name: 'Receive'})">
        <img v-show="!isExpand"
             height="30" class="point"
             src="/icons/expand.svg"
             @click="onExpand">
        <img src="/icons/networking.svg" height="30"
             class="point"
             @click="$router.push({name: 'DAPP'})">
      </div>

      <div class="center text-black">
        ZilPay
      </div>

      <div class="right">
        <img src="/icons/locked.svg" height="30"
             class="point"
             @click="logOut">
        <img src="/icons/refresh.svg" height="30"
             @click="statusUpdate" class="point">
        <img src="/icons/settings.svg" height="30"
             class="point"
             @click="$router.push({name: 'Setting'})">
      </div>

    </nav>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions, mapGetters } from 'vuex'
import StateStatusUpdater from '../mixins/status-updater'


export default {
  name: 'HomeBar',
  mixins: [StateStatusUpdater],
  computed: {
    ...mapState(['isConnect']),
    ...mapGetters(['isExpand']),

    connectURL() {
      if (this.isConnect) {
        return '/icons/connection.svg';
      }
      return '/icons/none-connection.svg';
    }
  },
  methods: {
    ...mapMutations(['spiner']),
    ...mapActions(['onExpand']),
    ...mapActions('Wallet', [
      'logOut'
    ]),

    async statusUpdate() {
      this.spiner();
      this.upadteAllState();
      setTimeout(() => this.spiner(), 500);
    }
  }
}
</script>

<style lang="scss">
@import "../styles/dimensions";

nav > .center {
  font-size: 25px;
  font-weight: bold;
}
.right > *, .left > * {
  margin-top: 24px;
  padding: 2%;
  cursor: pointer;
  
  &:hover {
    transition: all ease 0.3s;
  }
}
@media screen and (max-width: $nav-max-width) {
  .right > img {
    height: 25px;
  }
  .left > img {
    height: 25px;
  }
}
</style>