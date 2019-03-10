<template>
  <div id="app">
    <NavBar/>
    <router-view/>
  </div>
</template>

<script>
import { mapMutations, mapActions } from 'vuex'
import NavBar from './components/UI/NavBar'


export default {
  name: 'App',
  components: { NavBar },
  mounted() {
    this.preStart();
  },
  methods: {
    ...mapMutations(['spiner']),

    ...mapMutations('storage', [
      'isReady',
      'isEnable',
      'setNet',
      'config',
      'setWallet',
      'transactions'
    ]),
    ...mapActions('storage', [
      'initPopup',
      'jazzicon'
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
      console.log(data);
      if (data.reject) {
        this.isReady(data.reject.isReady);
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
        this.isReady(data.resolve.isReady);
        this.isEnable(data.resolve.isEnable);
        this.setNet(data.resolve.data.selectednet);
        this.config(data.resolve.data.config);
        this.setWallet(data.resolve.data.wallet);
        this.transactions(data.resolve.data.transactions);
        this.jazzicon('jazzicon');

        if (data.resolve.isEnable) {
          this.$router.push({ name: 'home' });
        } else {
          this.$router.push({ name: 'lock' });
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
</style>
