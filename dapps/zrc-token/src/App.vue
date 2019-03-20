<template>
  <div id="app">
    <div class="container">
      <div class="row justify-content-md-center">
        <Header class="col-12"/>
        <Info class="col-12 p-5"
              :address="contractAddress"
              :state="state"/>
        <BuyForm @buy="buyToken" class="col-6 p-5"/>
      </div>      
    </div>
  </div>
</template>

<script>
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
      contractAddress: 'f5c4a6e5dca64fd0cd6d2a3cf4eafa4cd287910d',
      state: {
        balance: 90,
        tokens: 900312,
        price: 423432
      }
    };
  },
  methods: {
    async stateUpdate() {
      const zilliqa = new window.Zilliqa();
      const hello = zilliqa.contracts.at(this.contractAddress);
      const state = await hello.getState();
      
      // if (state) {
      //   this.state = state;
      // }

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
        "Buy", [{}],
        {
          amount: zilAmount,
          gasPrice: gasPrice,
          gasLimit: utils.Long.fromNumber(8000)
        }
      );
      console.log(callTx);
    },
    withdrawToken() {

    }
  },
  mounted() {
    setTimeout(() => this.stateUpdate(), 1000);
  }
}
</script>

<style>

</style>
