<template>
  <div class="container">
    <div class="row justify-content-center">
      <img src="/img/logo.png">
    </div>
    <div class="text-center p-2 text-ightindigo display-4">

      <button v-btn="'success m-2'"
            @click="copy(account['address'])">
            Account {{wallet.selectedAddress + 1}}
            <br/>
            {{account['address'] | trimAddress}}
      </button>

      <h1>
        {{account['balance'] | fromZil}}
        <span class="text-warning">{{currencyController.nativeCurrency}}</span>
      </h1>
      <h1>
         {{account['balance'] | toUSD(currencyController.conversionRate)}}
         <span class="text-warning">{{currencyController.currentCurrency}}</span>
      </h1>
    </div>

    <div class="row justify-content-center">
      <button disabled v-btn="'success m-2'">DEPOSIT</button>
      <button v-btn="'success m-2'"
              @click="$router.push({ name: 'send' })">SEND</button>
    </div>

    <TxTracking :txs="txArray"/>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import copy from 'clipboard-copy'
import { fromZil, toUSD } from '../filters/zil'
import trimAddress from '../filters/trimAddress'
import TxTracking from '../components/TxTracking'
import btn from '../directives/btn'


export default {
  name: 'home',
  directives: { btn },
  mixins: [],
  components: { TxTracking },
  filters: { fromZil, trimAddress, toUSD },
  computed: {
     ...mapState([
      'currencyController'
    ]),
    ...mapState('storage', [
      'wallet',
      'transactions'
    ]),

    account() {
      return this.wallet.identities[
        this.wallet.selectedAddress
      ];
    },
    txArray() {
      let txs = this.transactions[this.account.address] || [];
      return txs.reverse();
    }
  },
  methods: {
    copy,
    preStart() {}
  },
  mounted() {
    this.preStart();
  }
}
</script>
