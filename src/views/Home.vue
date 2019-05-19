<template>
  <div class="home">
   <HomeBar/>
   <Jumbotron/>
  </div>
</template>

<script>
import HomeBar from '../components/HomeBar'
import Jumbotron from '../components/Jumbotron'


export default {
  name: 'home',
  components: { HomeBar, Jumbotron }
}
</script>
