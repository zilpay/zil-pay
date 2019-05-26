<template>
  <div class="home">
   <HomeBar/>
   <Jumbotron/>
   <TxList/>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
const HomeBar = () => import('../components/HomeBar');
const Jumbotron = () => import('../components/Jumbotron');
const TxList = () => import('../components/TxList');


export default {
  name: 'home',
  components: { HomeBar, Jumbotron, TxList },
  methods: {
    ...mapActions(['updateRate'])
  },
  mounted() {
    this.updateRate();
  }
}
</script>
