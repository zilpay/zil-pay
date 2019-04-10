<template>
  <div class="container">
    <p class="text-left">History</p>
    <ul class="list-group list-group-flush text-ightindigo">
      <li class="list-group-item text-ightindigo"
          v-for="(tx, index) of txs" :key="index">
        <div v-if="tx.TranID && tx.Info" class="row">
          <a class="col-2 text-truncate text-warning" target="_blank"
              :href="exploreTransactions(tx.TranID)">#{{index + 1}}</a>
          <div class="col text-break little">
            {{tx.Info}}
          </div>
          <div>
            {{tx.amount | fromZil}}
            <span class="text-warning">
              {{currencyController.nativeCurrency}}
            </span>
          </div>
        </div>

        <div class="row justify-content-center little">
          <a class="text-left text-ightindigo"
            :href="exploreAddress(currentAccount.address)" target="_blanck">
            {{name}}
          </a>

          <b class="ml-3 mr-3 text-pink">&#62;</b>

          <a class="text-right text-warning"
             :href="exploreAddress(tx.toAddr)" target="_blanck">
            {{tx.toAddr | trimAddress}}
          </a>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { fromZil } from '../filters/zil'
import explorer from '../mixins/explorer'
import trimAddress from '../filters/trimAddress'
import accName from '../mixins/accName'


export default {
  name: 'TxTracking',
  filters: { fromZil, trimAddress },
  mixins: [explorer, accName],
  props: {
    txs: Array,
    currentAccount: Object 
  },
  computed: {
    ...mapState([
     'currencyController'
   ])
  },
  mounted() { }
}
</script>

<style lang="scss">

</style>
