<template>
  <div class="container">
    <div class="row justify-content-center text-left">
      <h3 class="col-lg-12 text-ightindigo display-5">Send ZIL</h3>
      <p class="col-lg-12 text-warning">Only send ZIL to an Zilliqa address.</p>

      <form class="col">
        <div class="form-group">
          <label for="to">To address</label>
          <input type="text"
                 class="form-control bg-null"
                 id="to"
                 autocomplete="off"
                 placeholder="To address"
                 v-model="toAddress"
                 @blur="blurMenu"
                 @focus="isMenu = true && !toAddress"
                 @click="isMenu = true && !toAddress">
          <div class="dropdown-menu address-book"
               :class="{show: isMenu}">
            <a v-for="account of accounts" :key="account.index"
               class="dropdown-item point"
               @click="selectAddress(account.address)">
               Account {{account.index + 1}}
               {{account.address | trimAddress}}
            </a>
          </div>
          <small class="form-text text-danger"
                 v-if="!$v.toAddress.sameAs">{{addressMsg}}</small>
        </div>
        <div class="form-group">
          <label for="amount">
            Amount  <a v-show="amount !== maxAmount"
                       class="point display-10 text-warning"
                       @click="amount = maxAmount">max</a>
          </label>
          <input type="number"
                 class="form-control bg-null"
                 id="amount"
                 v-model="amount">
         <small class="form-text text-danger"
                v-if="!$v.amount.sameAs">{{amounMsg}}</small>
        </div>
        <div class="form-group">
          <label for="gas">Gas Price (ZILs)</label>
          <input type="text"
                 class="form-control bg-null"
                 id="gas"
                 v-model="gas">
         <small class="form-text text-danger"
                v-if="!$v.gas.sameAs">{{gasMsg}}</small>
        </div>

        <button v-btn="'success'"
                :disabled="!$v.submitForm.sameAs"
                @click="txFormSubmit">SEND</button>
        <button v-btn="'danger m-2'"
                @click="$router.push({ name: 'home' })">REJECT</button>
      </form>
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from 'vuex'
import { validation } from '@zilliqa-js/util'
import { validationMixin } from 'vuelidate'
import { fromZil, toZil, toBN } from '../filters/zil'
import trimAddress from '../filters/trimAddress'
import { required, sameAs } from 'vuelidate/lib/validators'
import { ERRORCODE } from '../lib/errors/code'
import btn from '../directives/btn'


export default {
  directives: { btn },
  mixins: [validationMixin],
  name: 'Send',
  filters: { fromZil, trimAddress },
  data() {
    return {
      toAddress: '', addressMsg: null,
      amount: 0, amounMsg: null,
      gas: 0, gasMsg: null,
      submitForm: true,
      isMenu: false
    };
  },
  validations: {
    amount: {
      required,
      sameAs: sameAs(vue => {
        if (+vue.amount < 0 || isNaN(+vue.amount)) {
          vue.amounMsg = ERRORCODE[0];
          return true;
        } else if (+vue.amount > +fromZil(vue.account.balance)) {
          vue.amounMsg = ERRORCODE[1];
          return true;
        }

        vue.amounMsg = null;

        return false;
      })
    },
    toAddress: {
      sameAs: sameAs(vue => {
        let isAddress = validation.isAddress(vue.toAddress);

        if (!isAddress || vue.toAddress.length < 40) {
          vue.addressMsg = ERRORCODE[2];
        } else {
          vue.addressMsg = null;
        }

        return isAddress;
      })
    },
    gas: {
      sameAs: sameAs(vue => {
        if (vue.gas <= 0 || isNaN(vue.gas) || vue.gas == '') {
          vue.gasMsg = ERRORCODE[0];
          return true;
        } else if (vue.gas > +fromZil(vue.account.balance)) {
          vue.gasMsg = ERRORCODE[1];
          return true;
        }

        vue.gasMsg = null;

        return false;
      })
    },
    submitForm: {
      sameAs: sameAs(vue => {
        return !vue.addressMsg &&
               !vue.amounMsg &&
               !vue.gasMsg;
      })
    }
  },
  computed: {
    ...mapState([
      'minGas'
    ]),
    ...mapState('storage', [
      'wallet'
    ]),

    account() {
      return this.wallet.identities[
        this.wallet.selectedAddress
      ];
    },
    accounts() {
      return this.wallet.identities.filter(
        acc => acc.index !== this.account.index
      );
    },
    maxAmount() {
      if (+this.account.balance == 0) {
        return '0';
      }
      const fullBalance = toBN(this.account.balance);
      const gas = toBN(toZil(this.gas));
      const amount = fullBalance.sub(gas);

      return fromZil(amount, false);
    }
  },
  methods: {
    ...mapMutations([
      'spiner'
    ]),
    ...mapActions('storage', [
      'nonContractSendTransaction',
      'transactionsUpdate'
    ]),

    async txFormSubmit() {
      this.spiner();

      let data = {
        toAddr: this.toAddress,
        amount: toZil(this.amount),
        gasPrice: toZil(this.gas),
        gasLimit: 1,
        code: '',
        data: ''
      };

      await this.nonContractSendTransaction(data);

      this.transactionsUpdate();
      this.spiner();
      this.$router.push({ name: 'home' });
    },
    selectAddress(address) {
      this.toAddress = address;
      this.isMenu = false;
    },
    blurMenu() {
      setTimeout(() => this.isMenu = false, 500);
    }
  },
  mounted() {
    this.gas = fromZil(this.minGas);
  }
}
</script>

<style lang="scss">
// @import '../styles/colors';
.address-book {
  margin-top: 56px;
  margin-left: 15px;
  right: 0;
  margin-right: 15px;
}
</style>
