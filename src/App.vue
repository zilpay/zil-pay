<template>
  <div id="app">
    <NavBar/>
    <router-view/>
  </div>
</template>

<script>
import NavBar from './components/UI/NavBar'
import StorageMixin from './mixins/storage'


export default {
  name: 'App',
  components: { NavBar },
  mixins: [StorageMixin],
  mounted() {
    this.preStart();
  },
  methods: {
    async preStart() {
      let createPage = this.$router.options.routes[1];
      let lockPage = this.$router.options.routes[0];
      let wallet = await this.get('wallet');
      let isNull = Object.keys(wallet).length > 0;
      console.log(isNull);
      if (isNull) {
        this.$router.push(lockPage.path);
      } else {
        this.$router.push(createPage.path);
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
