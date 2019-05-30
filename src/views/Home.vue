<template>
  <div class="home">
   <HomeBar/>
   <Jumbotron/>
   <TxList/>
  </div>
</template>

<script>
const HomeBar = () => import('../components/HomeBar');
const Jumbotron = () => import('../components/Jumbotron');
const TxList = () => import('../components/TxList');


export default {
  name: 'home',
  components: { HomeBar, Jumbotron, TxList }
}
</script>
