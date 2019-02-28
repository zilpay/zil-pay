<template>
  <div id="app">
    <NavBar/>
    <router-view/>
  </div>
</template>

<script>
import zilConfig from './config/zil.json'
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
      let { hash } = await this.get('hash');

      if (hash) {
        this.$router.push({ name: 'lock' });
      } else {
        this.set({ config: zilConfig });
        this.$router.push({ name: 'create' });
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
