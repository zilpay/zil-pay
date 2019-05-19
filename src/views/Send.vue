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
                 v-for="item of itesms"
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


export default {
  name: 'Send',
  components: { BackBar },
  data() {
    return {
      isAdvance: false,
      isInput: false,

      amount: 0,
      gasLimit: 1,
      gasPrice: 1000,
      to: null,

      account: {
        address: '0x90C3269c32e328fC26C91Fb3cD107B88E74e1C7c',
        balance: '312.3',
        name: 'warden'
      },
      itesms: [
        {name: 'test', address: '0x90C3269c3...7B88E74e1C7c'},
        {name: 'test', address: '0x90C3269c3...7B88E74e1C7c'},
        {name: 'test', address: '0x90C3269c3...7B88E74e1C7c'},
        {name: 'test', address: '0x90C3269c3...7B88E74e1C7c'},
      ]
    };
  },
  methods: {
    inputShow() {

    }
  }
}
</script>

<style lang="scss">
.send-page {
  justify-items: center;
}
.input-group {
  width: 360px;

  padding-left: 10%;
  padding-right: 10%;
}
label[for=amount] > span, .advance {
  cursor: pointer;
}
.advance {
  font-size: 15px;
  margin-top: 10px;
}
.gas {
  display: grid;
  grid-template-columns: 1fr 1fr;
  
  & > * {
    margin: 2%;
  }
}

</style>