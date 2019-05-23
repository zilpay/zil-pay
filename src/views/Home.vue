<template>
  <div class="home">
   <HomeBar/>
   <Jumbotron/>
   <TxList/>
  </div>
</template>

<script>
import HomeBar from '../components/HomeBar'
import Jumbotron from '../components/Jumbotron'
import TxList from '../components/TxList'


export default {
  name: 'home',
  components: { HomeBar, Jumbotron, TxList }
}
</script>
