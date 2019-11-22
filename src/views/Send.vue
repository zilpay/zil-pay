<template>
  <div>
    <BackBar/>

    <main class="text-center is-mini">

      <small class="warning-msg text-black"
             v-show="isWarning">
        This ZIL in {{network}} (It does not cost)!
      </small>

      <div class="animated fadeIn faster input-group">
        <div class="to text-left"
             v-click-outside="addressesDropdownClose">
          <label>To address</label>
          <input type="text"
                 autocomplete="false"
                 placeholder="To address"
                 @focus="isInput = true"
                 @click="isInput = true"
                 @input="isInput = false"
                 @change="checkDomain"
                 @blur="checkDomain"
                 v-model="to">
          <div class="animated fadeIn dropdown-input text-black" v-show="isInput">
            <div v-for="acc of wallet.identities"
                 :key="acc.address"
                 class="item"
                 @click="to = toAddress(acc.address, addressFormat, false)">
              <div class="name">
                {{acc.name || (`Account ${acc.index}`)}}
              </div>
              <div class="address">
                {{acc.address | toAddress(addressFormat)}}
              </div>
            </div>
          </div>
          <small class="text-info" v-show="resolveDomain">
            {{resolveDomain}}
          </small>
          <small class="text-danger" v-show="isAddress">
            {{isAddress}}
          </small>
        </div>

        <div class="amount text-left">
          <label>Transfer Amount ZIL.
            <span @click="amount = maxAmount" class="text-primary">max</span>
          </label>
          <input type="number" v-model="amount" min="0">
          <small class="text-danger" v-show="isAmount">{{isAmount}}</small>
        </div>

        <div class="text-primary text-right advance"
             @click="isAdvance = !isAdvance">
          <div class="text-left">fee: {{fee}}</div>
          {{isAdvance ? '-': '+'}} Advance
        </div>

        <div class="animated fadeIn faster gas" v-show="isAdvance">
          <div class="text-left">
            <label>Gas Limit</label>
            <input type="number" v-model="gasLimit">
          </div>
          <div class="text-left">
            <label>Gas Price (Li)</label>
            <input type="number" v-model="gasPrice">
          </div>
        </div>

        <button class="send"
                :disabled="isValidTx"
                @click="send">Send Transaction</button>
      </div>

      <div>
      </div>
    </main>
  </div>
</template>

<script>
import vClickOutside from 'v-click-outside'
import { MTypesZilPay, MTypesInternal } from '../../lib/messages/messageTypes'
import { Message } from '../../lib/messages/messageCall'
import { BN, units } from '@zilliqa-js/util'
import { mapState, mapActions, mapMutations } from 'vuex'
import { validation } from '@zilliqa-js/util'
import GasFee from '../mixins/gas-fee'
import toZIL from '../filters/to-zil'
import fromZil from '../filters/from-zil'
import clipboardMixin from '../mixins/clipboard'
import AccountListing from '../mixins/account-listing'
import { ERRORCODE } from '../../lib/errors/code'

const BackBar = () => import('../components/BackBar');

const DEFAULT_ZONE = 'zil'
async function nonContractSendTransaction(data) {
  const type = MTypesZilPay.CALL_SIGN_TX;
  const payload = data;
  await new Message({ type, payload }).send();  
}

export default {
  name: 'Send',
  mixins: [GasFee, clipboardMixin, AccountListing],
  components: { BackBar },
  directives: {
    clickOutside: vClickOutside.directive
  },
  data() {
    return {
      isAdvance: false,
      isInput: false,

      amount: 0,
      to: null,
      resolveDomain: null
    };
  },
  computed: {
    ...mapState('Static', [
      'network'
    ]),
    isWarning() {
      return this.network == 'testnet' || this.network == 'private';
    },
    isAddress() {
      if (this.to === null) {
        return null;
      }
      
      const isBech32 = validation.isBech32(this.to);

      if (isBech32) {
        return false;
      }

      return ERRORCODE[2];
    },
    isAmount() {
      try {
        const amountBN = new BN(toZIL(this.amount));
        const balanceBN = new BN(this.account.balance);
        const feeBN = new BN(toZIL(this.fee));
        const txAmountBN = feeBN.add(amountBN);
        const isInsufficientFunds = balanceBN.lt(txAmountBN);

        if (isInsufficientFunds) {
          return ERRORCODE[1];
        }
      } catch(err) {
        return ERRORCODE[3];
      }
      return false;
    },
    isValidTx() {
      if (this.isAddress == null) {
        return true;
      }

      return !!this.isAmount || !!this.isAddress;
    },
    maxAmount() {
       if (+this.account.balance == 0) {
        return 0;
      }

      const fullBalance = new BN(this.account.balance);
      const feeBN = new BN(toZIL(this.fee));
      const amount = fullBalance.sub(feeBN);

      return fromZil(amount, false);
    }
  },
  methods: {
    ...mapMutations(['spiner']),
    ...mapActions('Transactions', [
      'transactionsUpdate'
    ]),

    async send() {
      this.spiner();
      
      let data = {
        toAddr: this.to,
        amount: toZIL(this.amount),
        gasPrice: units.toQa(this.gasPrice, units.Units.Li).toString(),
        gasLimit: this.gasLimit,
        code: '',
        data: ''
      };

       await nonContractSendTransaction(data);
       this.transactionsUpdate();
       this.spiner();
    },
    async checkDomain() {
      const testZone = /.*\w.zil/gm;

      if (!testZone.test(this.to)) {
        return null;
      }

      this.to = this.to.toLowerCase();

      this.isInput = false;

      const type = MTypesInternal.GET_UD_OWNER;
      const payload = { domain: this.to };
      const { resolve } = await new Message({
        type,
        payload
      }).send();

      if (!resolve) {
        return null;
      }

      this.resolveDomain = resolve.domain;
      this.to = this.toAddress(resolve.owner, this.addressFormat, false);
    },
    addressesDropdownClose() {
      this.isInput = false;
    }
  }
}
</script>

<style lang="scss">
.dropdown-input > .item {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.amount > label > span {
  cursor: pointer;
}
.input-group {
  .send {
    margin-top: 30px;
  }
}
</style>
