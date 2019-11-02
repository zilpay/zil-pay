<template>
  <div>
    <BackBar/>
    <main class="animated fadeInUp faster is-mini">
      <a v-for="app of defaultList"
         :key="app.domain"
         :href="app.src"
         target="_blanck"
         class="dapp-item">
        <img :src="app.icon" height="40">
        <span>{{app.domain}}</span>
        <span>{{app.title}}</span>
      </a>
      <a v-for="dapp of dappsList"
         :key="dapp.domain"
         :href="'http://'+dapp.domain"
         target="_blanck"
         class="dapp-item">
        <img :src="dapp.icon" height="40">
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
  data() {
    return {
      defaultList: [
        {
          domain: 'UnstoppableDomains',
          src: 'https://zilpay.xyz/app/unstoppabledomains',
          icon: '/icons/unstoppable-logo.svg',
          title: 'Blockchain domains'
        },
        {
          domain: 'Editor',
          src: 'https://zilpay.xyz/app/Editor',
          icon: '/icons/scilla-logo.png',
          title: 'Scilla IDE'
        },
        {
          domain: 'Roll',
          src: 'https://zilpay.xyz/app/roll',
          icon: '/icons/roll.svg',
          title: 'Roll game'
        }
      ]
    }
  },
  computed: {
    ...mapState('Static', [
      'dappsList'
    ])
  }
}
</script>
