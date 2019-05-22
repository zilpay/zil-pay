<template>
  <div>
    <div class="send-recipient">
      <a href="">warden</a>
      <img src="/icons/caret-right.svg" height="30">
      <a href="">0xe8a99...0ead2</a>
    </div>    
    <main class="text-center popup">

      <img src="https://zilpay.xyz/img/favicon.ico">

      <h5>Transaction 1</h5>

      <div class="input-group">
        <div class="form-border text-left details">
          <div>
            method: <span class="text-black">Roll</span>
            <br>
            amount: <span class="text-black">10 ZIL</span>
            <br>
            DApp: <span class="text-black">Roll game</span>
          </div>
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

        <div class="btn-group">
          <button>confirm</button>
          <button class="btn-outline">reject</button>
        </div>
      </div>

      <div>
      </div>

      <hr>
    </main>
  </div>
</template>

<script>
export default {
  name: 'Send',
  data() {
    return {
      isAdvance: false,
      isInput: false,

      gasLimit: 1,
      gasPrice: 1000
    };
  }
}
</script>

<style lang="scss">
.popup {
  margin: 30px;
}
.details {
  padding: 10px;
  font-size: 15px;
}
.send-recipient {
  background-color: rgba(77, 77, 77, 0.123);
  padding: 10px;
  font-size: 15px;

  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  justify-items: center;

  img {
    border: 1px solid #d2d8dd;
    border-radius: 20px;
    margin-left: 20px;
  }
}
.btn-group > button {
  margin: 10px;
}
</style>