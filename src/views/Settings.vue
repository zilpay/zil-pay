<template>
  <div class="container">
    <div class="d-flex justify-content-end text-warning point">
      <h5 class="mr-auto p-2" @click="$router.go(-1)">&#60;BACK</h5>
      <h5 class="p-2" @click="signOut">LOG OUT</h5>
    </div>

    <div class="row justify-content-center p-1 display-10">
      <ul class="col-lg list-group list-group-flush">
        <h5 class="text-center text-success">Accounts</h5>
        <li class="list-group-item acc"
            v-for="(val, index) of wallet.identities" :key="index"
            @click="selectAccount(index)"
            :class="{'active': index == wallet.selectedAddress}">

          <div class="d-flex justify-content-end">
            <b class="mr-auto">
              Account {{index + 1}}
              <span  v-if="val.isImport" class="text-warning">I</span>
            </b>
            <b>{{val.address | trimAddress}}</b>
          </div>
          <div class="d-flex justify-content-end">
            <p class="mr-auto text-ightindigo">{{val.balance | fromZil}}
              <span class="text-warning">
                {{currencyController.nativeCurrency}}
              </span>
            </p>
            <p class="text-ightindigo">
              {{val.balance | toUSD(currencyController.conversionRate)}}
              <span class="text-warning">
                {{currencyController.currentCurrency}}
              </span>
            </p>
          </div>

        </li>
      </ul>

      <div class="mt-2" style="width: 200px;">
        <button v-btn="'warning col-12 mt-1'"
                @click="createAccountBySeed">Create Account</button>

        <button v-btn="'info col-12 mt-1'"
                @click="$router.push({name: 'import'})">Import privateKey</button>
        <button v-btn="'danger col-12 mt-2'"
                @click="exportPrivKey">Export PrivateKey</button>
        <button v-btn="'danger col-12 mt-1'"
                @click="exportSeed">Export Seed</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState, mapActions } from 'vuex'
import btn from '../directives/btn'
import trimAddress from '../filters/trimAddress'
import { fromZil, toUSD } from '../filters/zil'
import { exportTypes } from '../lib/messages/messageTypes'


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
    ...mapMutations([
      'spiner'
    ]),
    ...mapMutations('storage', [
      'setWallet'
    ]),
    ...mapActions('storage', [
      'jazzicon',
      'logOut',
      'balanceUpdate',
      'createAccount'
    ]),

    signOut() {
      this.logOut();
      this.$router.push({ name: 'lock' });
    },
    async createAccountBySeed() {
      this.spiner();
      await this.createAccount();
      this.spiner();
      this.$router.push({ name: 'home' });
    },
    async selectAccount(index) {
      let wallet = this.wallet;

      wallet.selectedAddress = index;

      this.setWallet(wallet);
      this.balanceUpdate();
      this.jazzicon('jazzicon');
      this.$router.push({ name: 'home' });
    },

    exportPrivKey() {
      this.$router.push({
        name: 'export',
        params: { type: exportTypes.PRIVATE_KEY }
      });
    },
    exportSeed() {
      this.$router.push({
        name: 'export',
        params: { type: exportTypes.SEED }
      });
    }
  },
  mounted() { }
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
