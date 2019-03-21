<template>
  <div v-if="state && state.length > 0" class="jumbotron">
    <h1 class="display-5">Contract info!</h1>
    <p>address: {{address}}</p>
    <p class="lead text-warning">Contract balance: {{balance || 0}}</p>
    <p class="lead text-warning">totalSupply: {{totalSupply || 0}}</p>
    <hr class="my-4">
    <div class="form-group">
      <label for="buy">Your tokens</label>
      <input type="number"
             class="form-control"
             id="tokens"
             :value="tokens"
             @input="tokensAmount = $event.target.value">
    </div>
    <a class="btn btn-primary btn-lg"
       href="#"
       role="button"
       @click="$emit('withdraw', tokensAmount)">withdraw</a>
  </div>
</template>

<script>
export default {
  name: 'Info',
  data() {
    return {
      tokensAmount: 0
    };
  },
  props: {
    address: {
      type: String
    },
    state: {
      type: Array
    }
  },
  computed: {
    balance() {
      const utils = window.zilPay.utils;
      return utils.units.fromQa(
        new utils.BN(this.state[4].value),
        utils.units.Units.Zil
      );
    },
    tokens() {
      const address = window.zilPay.defaultAccount.address;
      if (!address) {
        return 0;
      }
      const values = this.state[1].value;
      const tokens = values.filter(el => el.key.includes(address));

      if (!tokens[0]) {
        return 0;
      }

      if (this.tokensAmount == 0) {
        // eslint-disable-next-line
        this.tokensAmount = tokens[0].val;
      }
      
      return tokens[0].val;
    },
    totalSupply() {
      return this.state[0].value;
    }
  }
}
</script>

<style>

</style>
