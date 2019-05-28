<template>
  <div>
    <BackBar/>

    <main class="text-center send-page is-mini">

      <h6>Only send ZIL native to an Zilliqa address.</h6>

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
          <div class="dropdown-input text-black" v-show="isInput">
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
            <span class="text-primary">MAX</span>
          </label>
          <input type="number" v-model="amount" min="0">
          <small class="text-danger" v-show="isAmount">{{isAmount}}</small>
        </div>

        <div class="text-primary text-right advance"
             @click="isAdvance = !isAdvance">
          <div class="text-left">fee: {{fee}}</div>
          {{isAdvance ? '-': '+'}} Advance
        </div>

        <div class="gas" v-show="isAdvance">
          <div class="text-left">
            <label>Gas Limit</label>
            <input type="number" v-model="gasLimit">
          </div>
          <div class="text-left">
            <label>Gas Price (Li)</label>
            <input type="number" v-model="gasPrice">
          </div>
        </div>

        <button class="send" :disabled="isValidTx">Send Transaction</button>
      </div>

      <div>
      </div>

      <hr>
    </main>
  </div>
</template>

<script>
import { validation } from '@zilliqa-js/util'
import GasFee from '../mixins/gas-fee'
import clipboardMixin from '../mixins/clipboard'
import AccountListing from '../mixins/account-listing'

const BackBar = () => import('../components/BackBar');


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

      return 'Wrong Zilliqa address';
    },
    isAmount() {
      if (this.amount === 0) {
        return null;
      } else if (this.amount < 0) {
        return 'Wrong amount';
      }
      return false;
    },
    isValidTx() {
      if (this.isAddress == null) {
        return true;
      }

      return !!this.isAmount || !!this.isAddress;
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
