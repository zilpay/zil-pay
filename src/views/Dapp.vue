<template>
  <div>
    <BackBar/>
    <main class="animated fadeInUp faster is-mini">

      <a v-for="dapp of dappsList"
           :key="dapp.domain"
           :href="'http://'+dapp.domain"
           target="_blanck"
           class="dapp-item">
        <img :src="dapp.icon">
        <span>{{dapp.domain}}</span>
        <span>{{dapp.title}}</span>
      </a>
    </main>
  </div>
</template>

<script>
import { mapState } from 'vuex'

const BackBar = () => import('../components/BackBar');


export default {
  name: 'Dapp',
  components: { BackBar },
  computed: {
    ...mapState('Static', [
      'dappsList'
    ])
  }
}
</script>
