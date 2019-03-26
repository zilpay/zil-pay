<template>
  <div id="app">
    <NavBar/>
    <router-view/>
  </div>
</template>

<script>
import { mapMutations, mapActions } from 'vuex'

const NavBar = () => import('./components/UI/NavBar')


export default {
  name: 'App',
  components: { NavBar },
  mounted() {
    this.preStart();
  },
  methods: {
    ...mapMutations(['spiner']),

    ...mapMutations('storage', [
      'mutateIsReady',
      'isEnable',
      'setNet',
      'config',
      'setWallet',
      'transactions',
      'confirmationTx'
    ]),
    ...mapActions('storage', [
      'initPopup',
      'jazzicon',
      'netTest'
    ]),

    async preStart() {
      let data;

      try {
        data = await this.initPopup();
      } catch(err) {
        this.$router.push({ name: 'create' });
        this.spiner();
        return null;
      }

      this.spiner();

      if (data.reject) {
        this.mutateIsReady(data.reject.isReady);
        this.isEnable(data.reject.isEnable);
        this.setNet(data.reject.selectednet);
        this.config(data.reject.config);

        if (!data.reject.isEnable) {
          this.$router.push({ name: 'lock' });
        }
        if (!data.reject.isReady) {
          this.$router.push({ name: 'create' });
        }

        return null;
      } else {
        this.mutateIsReady(data.resolve.isReady);
        this.isEnable(data.resolve.isEnable);
        this.setNet(data.resolve.data.selectednet);
        this.config(data.resolve.data.config);
        this.setWallet(data.resolve.data.wallet);
        this.confirmationTx(data.resolve.data.confirm || []);
        this.jazzicon('jazzicon');

        if (data.resolve.data.transactions) {
          this.transactions(data.resolve.data.transactions);
        }

        this.netTest();

        if (data.resolve.isEnable) {
          if (data.resolve.data.confirm && data.resolve.data.confirm.length > 0) {
            this.$router.push({ name: 'confirmation' });
            return null;
          } else if (window.data) {
            this.$router.push({ name: 'confirmation' });
            return null;
          }

          this.$router.push({ name: 'home' });
          return null;
        } else {
          this.$router.push({ name: 'lock' });
          return null;
        }
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
.error-input {
  border-color: $red;
}
textarea {
  cursor: pointer;
  font-size: 20px !important;
  height: 120px !important;
}
textarea:hover {
  box-shadow: inset 0px 0px 40px $lightviolet;
}
.display-10 {
  font-size: 15px !important;
}
.little {
  font-size: 10px !important;
}
.expand-view {
  position: absolute;
  top: 0;
  cursor: pointer;
  left: 0;
}
</style>
