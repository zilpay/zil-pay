<template>
  <div id="app">
    <NavBar/>
    <router-view/>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import zilConfig from './config/zil.json'
import NavBar from './components/UI/NavBar'


export default {
  name: 'App',
  components: { NavBar },
  mounted() {
    this.preStart();
  },
  methods: {
    ...mapActions('storage', [
      'syncBrowser',
      'signVerifyJWT'
    ]),
    ...mapMutations('storage', [
      'config',
    ]),
    ...mapState('storage', [
      'vault',
    ]),

    async preStart() {
      await this.syncBrowser();

      if (!this.vault()) {
        this.config(zilConfig);
        this.$router.push({ name: 'create' });
        return null;
      }

      
      let status = await this.signVerifyJWT();
      
      if (status) {
        this.$router.push({ name: 'home' });
      } else {
        this.$router.push({ name: 'lock' });
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
