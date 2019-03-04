<template>
  <div class="container">
    <ul class="list-group list-group-flush text-ightindigo">
      <li class="list-group-item text-ightindigo"
          v-for="tx of txs" :key="tx.id">
        <a class="text-ightindigo"
           target="_blank"
           :href="exploreTransactions(tx.id)">Explore</a>
      ,
       <a class="text-ightindigo"
          target="_blank"
          :href="exploreAddress(tx.toAddr)">To</a>
      ,
        <b>Amount: {{parseInt('0x'+tx.amount) | fromZil}}
          <span class="text-warning">{{currencyController.nativeCurrency}}</span>
        </b>
      ,
        <b>Statu: {{tx.status}}</b>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { fromZil } from '../filters/zil'


export default {
  name: 'TxTracking',
  filters: { fromZil },
  props: {
    txs: Array
  },
  data() {
    return {
      url: 'https://dev-explorer.zilliqa.com'
    };
  },
  computed: {
    ...mapState([
     'currencyController'
   ]),
  },
  methods: {
    exploreTransactions(hash) {
      return `${this.url}/transactions/${hash}`;
    },
    exploreAddress(address) {
      return `${this.url}/address/${address}`;
    }
  },
  mounted() {
    // console.log(this.txs);
  }
}
</script>

<style lang="scss">

</style>
