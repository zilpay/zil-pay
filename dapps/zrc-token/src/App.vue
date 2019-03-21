<template>
  <div id="app">
    <div class="container">
      <div class="row justify-content-md-center">
        <Header class="col-12"/>
        <Info class="col-12 p-5"
              :address="contractAddress"
              :state="state"
              @withdraw="withdrawToken"/>
        <BuyForm @buy="buyToken" class="col-6 p-5"/>
      </div>      
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import Header from './components/Header'
import BuyForm from './components/BuyForm'
import Info from './components/Info'

export default {
  name: 'app',
  components: {
    Header, BuyForm, Info
  },
  
  data() {
    return {
      contractAddress: '1b9bee83a721b6e63ba4819d0c9ce2d16c521bd3',
      state: []
    };
  },
  methods: {
    async stateUpdate() {
      const zilliqa = new window.Zilliqa();
      const hello = zilliqa.contracts.at(this.contractAddress);
      const state = await hello.getState();
      
      if (state) {
        this.state = state;
      }

      console.log(state);
    },
    async buyToken(amount) {
      const zilliqa = new window.Zilliqa();
      const address = window.zilPay.defaultAccount.address;
      const utils = window.zilPay.utils;
      const ZRC = zilliqa.contracts.at(this.contractAddress);
      const gasPrice = utils.units.toQa(
        '1000', utils.units.Units.Li
      );
      const zilAmount = utils.units.toQa(
        amount || 1,
        utils.units.Units.Zil
      );
      const callTx = await ZRC.call(
        "Buy", [],
        {
          amount: zilAmount,
          gasPrice: gasPrice,
          gasLimit: utils.Long.fromNumber(8000)
        }
      );
      console.log(callTx);
    },
    async withdrawToken(amount=0) {
      const zilliqa = new window.Zilliqa();
      const address = window.zilPay.defaultAccount.address;
      const utils = window.zilPay.utils;
      const ZRC = zilliqa.contracts.at(this.contractAddress);
      const gasPrice = utils.units.toQa(
        '1000', utils.units.Units.Li
      );
      const callTx = await ZRC.call(
        "Withdraw", [{
          vname: "tokensAmount",
          type: "Uint128",
          value: amount
        }],
        {
          amount: new utils.BN(0),
          gasPrice: gasPrice,
          gasLimit: utils.Long.fromNumber(8000)
        }
      );
      console.log(callTx, amount);
    }
  },
  mounted() {
    setTimeout(() => this.stateUpdate(), 1000);
  }
}
</script>

<style>

</style>
