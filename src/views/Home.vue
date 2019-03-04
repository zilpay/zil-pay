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
         $605.67
         <span class="text-warning">{{currencyController.currentCurrency}}</span>
      </h1>
    </div>

    <div class="row justify-content-center">
      <button v-btn="'success m-2'">DEPOSIT</button>
      <button v-btn="'success m-2'"
              @click="$router.push({ name: 'send' })">SEND</button>
    </div>

    <TxTracking :txs="txArray"/>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import copy from 'clipboard-copy'
import { fromZil } from '../filters/zil'
import trimAddress from '../filters/trimAddress'
import TxTracking from '../components/TxTracking'
import btn from '../directives/btn'
import MnemonicMixin from '../mixins/mnemonic'


export default {
  name: 'home',
  directives: { btn },
  mixins: [MnemonicMixin],
  components: { TxTracking },
  filters: { fromZil, trimAddress },
  computed: {
     ...mapState([
      'currencyController'
    ]),
    ...mapState('storage', [
      'wallet',
      'bip39',
      'transactions'
    ]),

    account() {
      return this.wallet.identities[
        this.wallet.selectedAddress
      ];
    },
    txArray() {
      return this.transactions[
        this.account.address
      ];
    }
  },
  methods: {
    ...mapActions('storage', [
      'walletUpdate'
    ]),

    copy,
    preStart() {
      this.mnemonic.bip32Node(this.bip39);
      let { privateKey, index } = this.mnemonic.getPrivateKeyAtIndex(
        this.wallet.selectedAddress
      );

      this.walletUpdate({ index, privateKey });
    }
  },
  mounted() {
    this.preStart();
  }
}
</script>
