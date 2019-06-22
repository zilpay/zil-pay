<template>
  <div class="home">
   <HomeBar/>
   <Jumbotron/>
   <TxList/>
  </div>
</template>

<script>
import StatusUpdater from '../mixins/status-updater'

const HomeBar = () => import('../components/HomeBar');
const Jumbotron = () => import('../components/Jumbotron');
const TxList = () => import('../components/TxList');


export default {
  name: 'home',
  mixins: [StatusUpdater],
  components: { HomeBar, Jumbotron, TxList },
  mounted() {
    this.upadteAllState();
  }
}
</script>
