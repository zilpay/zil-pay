<template>
  <div class="container">
    <div class="row justify-content-center text-left">
      <h1 class="col-lg-12 text-pink display-3">Send ZIL</h1>
      <p class="col-lg-12 text-warning">Only send ZIL to an Zilliqa address.</p>

      <form class="col">
        <div class="form-group">
          <label for="to">To address</label>
          <input type="text"
                 class="form-control bg-null"
                 id="to"
                 placeholder="To address">
          <small class="form-text text-danger">wrong zil address</small>
        </div>
        <div class="form-group">
          <label for="amount">Amount</label>
          <input type="number"
                 class="form-control bg-null"
                 id="amount"
                 placeholder="Amount">
         <small class="form-text text-danger">wrong zil amount</small>
        </div>
        <div class="form-group">
          <label for="gas">Gas Price (ZILs)</label>
          <input type="text"
                 class="form-control bg-null"
                 id="gas"
                 placeholder="Amount">
         <small class="form-text text-danger">wrong Gas Price</small>
        </div>

        <button v-btn="'success'">SEND</button>
        <button v-btn="'danger m-2'"
                @click="$router.push({ name: 'home' })">REJECT</button>
      </form>
    </div>
  </div>
</template>

<script>
import btn from '../directives/btn'


export default {
  directives: { btn },
  name: 'Send'
}
</script>

<style lang="scss">
// @import '../styles/colors';
</style>
