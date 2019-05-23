<template>
  <div>
    <BackBar/>

    <main class="text-center send-page">

      <h5>Only send ZIL native to an Zilliqa address.</h5>

      <div class="input-group">
        <div class="to text-left" @mouseleave="isInput = false">
          <label for="to">To address</label>
          <input type="text"
                 id="to"
                 placeholder="To address"
                 @focus="isInput = true"
                 @click="isInput = true"
                 @input="isInput = false"
                 v-model="to">
          <div class="dropdown-input text-black" v-show="isInput">
            <div class="item"
                 v-for="item of items"
                 :key="item.address"
                 @click="to = item.address">
              <div class="name">{{item.name}}</div>
              <div class="address">{{item.address | trimHex}}</div>
            </div>
          </div>
          <small class="text-danger">{{isAddress}}</small>
        </div>

        <div class="amount text-left">
          <label>Transfer Amount ZIL.
            <span class="text-primary">MAX</span>
          </label>
          <input type="number" v-model="amount" min="0">
          <small class="text-danger">{{isAmount}}</small>
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

        <button>Send Transaction</button>
      </div>

      <div>
      </div>

      <hr>
    </main>
  </div>
</template>

<script>
import { fromBech32Address } from '@zilliqa-js/crypto'
import GasFee from '../mixins/gas-fee'
import toBech32 from '../filters/to-bech32'
import trimHex from '../filters/trim-hex'

const BackBar = () => import('../components/BackBar');


export default {
  name: 'Send',
  mixins: [GasFee],
  components: { BackBar },
  filters: { toBech32, trimHex },
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
        {name: 'warden', address: 'zil1tg7j734280gzwc8emgamgr9yf85gr5uwh639c2'},
        {name: 'account 1', address: 'zil1xq6mh35lgr646hux0ys96q0f0hqv3hex80trpf'},
        {name: 'account 2', address: 'zil1q9z7ldt4jj2wwg545z3uecx40vchufput5r0mt'},
        {name: 'account 3', address: 'zil1cznkkuwq0sk38uavsvr3dd2cfcpq6lt8042rgw'},
      ]
    };
  },
  computed: {
    isAddress() {
      if (this.to === null) {
        return '';
      }

      try {
        fromBech32Address(this.to);
      } catch (err) {
        return 'Wrong Zilliqa address';
      }

      return '';
    },
    isAmount() {
      if (this.amount === 0) {
        return '';
      } else if (this.amount < 0) {
        return 'Wrong amount';
      }
      return '';
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
</style>
