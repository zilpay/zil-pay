<template>
  <div class="container">
    <input type="text">
    <div class="row justify-content-center">
      <img src="/img/logo.png">
    </div>
    <div class="text-center p-2 text-ightindigo display-4">
      <h1>{{account['address']}}</h1>
      <h1>
        {{account['balance'] | toZil}}
        <span class="text-warning">{{currencyController.nativeCurrency}}</span>
      </h1>
      <h1>
         $605.67 
         <span class="text-warning">{{currencyController.currentCurrency}}</span>
      </h1>
    </div>

    <div class="row justify-content-center">
      <button v-btn="'success m-2'">DEPOSIT</button>
      <button v-btn="'success m-2'">SEND</button>
    </div>

    <TxTracking/>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import toZil from '../filters/toZil'
import TxTracking from '../components/TxTracking'
import btn from '../directives/btn'

export default {
  name: 'home',
  directives: { btn },
  components: { TxTracking },
  filters: { toZil },
  computed: {
     ...mapState([
      'currencyController'
    ]),
    ...mapState('storage', [
      'wallet'
    ]),
    account() {
      return this.wallet.identities[
        this.wallet.selectedAddress
      ];
    }
  },
  methods: {
  },
  mounted() {
    
  }
}
</script>
