<template>
  <div>
    <BackBar/>

    <main class="text-center is-mini">

      <small class="warning-msg text-black"
             v-show="isWarning">
        This ZIL in {{network}} (It does not cost)!
      </small>

      <div class="input-group">
        <div class="to text-left" @mouseleave="isInput = false">
          <label>To address</label>
          <input type="text"
                 autocomplete="false"
                 placeholder="To address"
                 @focus="isInput = true"
                 @click="isInput = true"
                 @input="isInput = false"
                 v-model="to">
          <div class="animated fadeIn dropdown-input text-black" v-show="isInput">
            <div v-for="acc of wallet.identities"
                 :key="acc.address"
                 class="item"
                 @click="to = toAddress(acc.address, addressFormat, false)">
              <div class="name">
                {{acc.name || (`Account ${acc.index + 1}`)}}
              </div>
              <div class="address">
                {{acc.address | toAddress(addressFormat)}}
              </div>
            </div>
          </div>
          <small class="text-danger" v-show="isAddress">{{isAddress}}</small>
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
import { MTypesZilPay } from '../../lib/messages/messageTypes'
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


async function nonContractSendTransaction(data) {
  const type = MTypesZilPay.CALL_SIGN_TX;
  const payload = data;
  await new Message({ type, payload }).send();  
}

export default {
  name: 'Send',
  mixins: [GasFee, clipboardMixin, AccountListing],
  components: { BackBar },
  data() {
    return {
      isAdvance: false,
      isInput: false,

      amount: 0,
      to: null
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
      const isHex = validation.isAddress(this.to);
      const isBase58 = validation.isBase58(this.to);

      if (isBech32 || isHex || isBase58) {
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
