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
              <div class="address">{{item.address}}</div>
            </div>
          </div>
        </div>

        <div class="amount text-left">
          <label for="amount">Transfer Amount ZIL.
            <span class="text-primary">MAX</span>
          </label>
          <input type="number" id="amount" v-model="amount">
        </div>

        <div class="text-primary text-right advance"
             @click="isAdvance = !isAdvance">
          <div class="text-left">fee: {{fee}}</div>
          {{isAdvance ? '-': '+'}} Advance
        </div>

        <div class="gas" v-show="isAdvance">
          <div class="text-left">
            <label for="gas-limit">Gas Limit</label>
            <input type="number" id="gas-limit" v-model="gasLimit">
          </div>
          <div class="text-left">
            <label for="gas-price">Gas Price (Li)</label>
            <input type="number" id="gas-price" v-model="gasPrice">
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
import BackBar from '../components/BackBar'
import GasFee from '../mixins/gas-fee'


export default {
  name: 'Send',
  mixins: [GasFee],
  components: { BackBar },
  data() {
    return {
      isAdvance: false,
      isInput: false,

      amount: 0,
      to: null,

      account: {
        address: '0x90C3269c32e328fC26C91Fb3cD107B88E74e1C7c',
        balance: '312.3',
        name: 'warden'
      },
      items: [
        {name: 'test', address: '0x9C3269c3...7B88E74e1C7c'},
        {name: 'test', address: '0x90C3269c3...7B88E7e1C7c'},
        {name: 'test', address: '0x90C329c3...7B88E74e1Cc'},
        {name: 'test', address: '0x90C329c3...7B88E74e17c'},
      ]
    };
  }
}
</script>
