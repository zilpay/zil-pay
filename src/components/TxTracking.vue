<template>
  <div class="container">
    <p class="text-left">History</p>
    <ul class="list-group list-group-flush text-ightindigo">
      <li class="list-group-item text-ightindigo"
          v-for="(tx, index) of txs" :key="index">
          <div class="row">
            <a class="col-2 text-truncate text-warning" target="_blank"
               :href="exploreTransactions(tx.id)">#{{index + 1}}</a>
            <div class="col text-break">
              {{tx.info}}
            </div>
            <div class="col-">
              {{tx.amount | fromZil}}
              <span class="text-warning">{{currencyController.nativeCurrency}}</span>
            </div>
          </div>
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
   ])
  },
  methods: {
    exploreTransactions(hash) {
      return `${this.url}/transactions/${hash}`;
    }
  },
  mounted() {
    // console.log(this.txs);
  }
}
</script>

<style lang="scss">

</style>
