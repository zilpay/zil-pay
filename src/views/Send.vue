<template>
  <div>
    <BackBar/>

    <main class="text-center send-page">

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
            <div class="item"
                 v-for="item of items"
                 :key="item.address"
                 @click="to = toAddress(item.address, addressFormat, false)">
              <div class="name">{{item.name}}</div>
              <div class="address">{{item.address | toAddress(addressFormat)}}</div>
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

const BackBar = () => import('../components/BackBar');


export default {
  name: 'Send',
  mixins: [GasFee, clipboardMixin],
  components: { BackBar },
  data() {
    return {
      isAdvance: false,
      isInput: false,

      amount: 0,
      to: null,

      account: {
        address: '0x63b92f2128d12781cb8a1edd729b5a6bcdec4ceb',
        balance: '312.3',
        name: 'warden'
      },
      items: [
        {name: 'warden', address: '0x63b92f2128d12781cb8a1edd729b5a6bcdec4ceb'},
        {name: 'account 1', address: '0xD8C19c01E156fca9f6970BE733C9Fec52897f75B'},
        {name: 'account 2', address: '0x582aB16Ffb89fB0607a6b6ABfD47Db8306a83B84'},
        {name: 'account 3', address: '0x21FE9889b71eB1caeCe5B94354163D11e1062272'},
      ]
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
