<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="jumbotron text-ightindigo text-left p-3">
        <h1 class="display-5 text-lightviolet">
          Confirmation! <b class="text-warning">{{index + 1}}</b>
        </h1>
        <p class="lead text-indigo">
          Type: <b class="text-ightindigo">contract triger!</b>
          <br>
          Amount: 
          <b class="text-ightindigo">{{amount | fromZil}}</b>
          <span class="text-warning">
            {{currencyController.nativeCurrency}}
          </span>
          <br>
          Amount: 
          <b class="text-ightindigo">{{amount | toUSD(currencyController.conversionRate)}}</b>
          <span class="text-warning">
            {{currencyController.currentCurrency}}
          </span>
        </p>
        
        <hr class="my-4">

        <div class="row p-4">
          <div id="j-from">
            <a class="text-truncate text-ightindigo"
               :href="exploreAddress(from)" target="_blanck">
              Account 1
            </a>
          </div>

          <b class="ml-5 text-pink">&#62;</b>

          <div id="j-to" class="ml-5">
            <a class="text-truncate text-warning"
               :href="exploreAddress(to)" target="_blanck">
              {{to | trimAddress}}
            </a>
          </div>
        </div>

        <form class="col">
          <div class="form-group">
            <label for="gas">Gas Price (ZILs)</label>
            <input type="text"
                  class="form-control bg-null"
                  id="gas">
          </div>
          <div class="form-group">
            <label for="gas">Gas Limit (ZILs)</label>
            <input type="text"
                  class="form-control bg-null"
                  id="gas">
          </div>

          <div class="p-2">
            <button v-btn="'success btn-lg mr-2'">CONFIRM</button>
            <button v-btn="'danger btn-lg ml-2'">REJECT</button>
          </div>
      </form>

      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import trimAddress from '../filters/trimAddress'
import { fromZil, toUSD } from '../filters/zil'
import explorer from '../mixins/explorer'
import btn from '../directives/btn'


export default {
  name: 'Confirmation',
  filters: { trimAddress, fromZil, toUSD },
   directives: { btn },
  mixins: [explorer],
  data() {
    return {
      from: 'eef22809b26479ce53f52a0849dbbdad630e0f35',
      to: '31de24752489e04d06ad32a1095b86ce9310bf9b',
      amount: '5783495734904',
      index: 3
    };
  },
  computed: {
    ...mapState([
      'currencyController'
    ])
  }
}
</script>

<style lang="scss">
.jumbotron {
  min-width: 310px;
}
</style>
