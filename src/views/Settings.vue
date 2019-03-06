<template>
  <div class="container">
    <div class="d-flex justify-content-end text-warning point">
      <h3 class="mr-auto p-2" @click="$router.push({name:'home'})">&#60;BACK</h3>
      <h3 class="p-2" @click="logOut">LOG OUT</h3>
    </div>

    <div class="row justify-content-center p-5">
      <ul class="col-lg list-group list-group-flush">
        <h2 class="text-center text-success">Accounts</h2>
        <li class="list-group-item acc"
            v-for="(val, index) of wallet.identities" :key="index"
            @click="selectAccount(index)"
            :class="{'active': index == wallet.selectedAddress}">

          <div class="d-flex justify-content-end">
            <b class="mr-auto">Account {{index + 1}}</b>
            <b>{{val.address | trimAddress}}</b>
          </div>
          <div class="d-flex justify-content-end">
            <p class="mr-auto text-ightindigo">{{val.balance | fromZil}}
              <span class="text-warning">{{currencyController.nativeCurrency}}</span>
            </p>
            <p class="text-ightindigo">{{val.balance | toUSD(currencyController.conversionRate)}}
              <span class="text-warning">{{currencyController.currentCurrency}}</span>
            </p>
          </div>

        </li>
      </ul>
      <button v-btn="'warning col m-3'"
              @click="createWallet(wallet.identities.length)">Create Account</button>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState, mapActions } from 'vuex'
import btn from '../directives/btn'
import trimAddress from '../filters/trimAddress'
import { fromZil, toUSD } from '../filters/zil'


export default {
  name: 'Settings',
  directives: { btn },
  filters: { trimAddress, fromZil, toUSD },
  computed: {
    ...mapState([
     'currencyController'
   ]),
   ...mapState('storage', [
     'wallet'
   ]),

    currentPage() {
      return this.$router.history.current.name;
    }
  },
  methods: {
    ...mapMutations('storage', [
      'vault',
      'setWallet'
    ]),
    ...mapActions('zilliqa', [
      'createWallet',
      'balanceUpdate'
    ]),

    logOut() {
      this.vault(null);
      this.$router.push({ name: 'lock' });
    },
    async selectAccount(index) {
      let wallet = this.wallet;

      wallet.selectedAddress = index;

      await this.setWallet(wallet);
      await this.balanceUpdate();
    }
  }
}
</script>

<style lang="scss">
@import '../styles/colors';
.acc:hover {
  background-color: $shade-10;
}
.acc {
  cursor: pointer;
}
</style>
