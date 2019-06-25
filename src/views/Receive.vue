<template>
  <div>
    
    <BackBar/>

    <main class="text-center is-mini">

      <h1 class="text-black">{{account.name}}</h1>

      <div class="animated fadeIn faster">
        <img v-if="qrcode" :src="qrcode">
        <br>
        <span class="full-address">{{account.address | toAddress(addressFormat, false)}}</span>
        <br>
        <button @click="copy(account.address)">Copy address</button>
      </div>

      <hr>
    </main>
  </div>
</template>

<script>
import QRCode from 'qrcode'
import clipboardMixin from '../mixins/clipboard'
import AccountListing from '../mixins/account-listing'

const BackBar = () => import('../components/BackBar');


export default {
  name: 'receive',
  mixins: [clipboardMixin, AccountListing],
  components: { BackBar },
  data() {
    return {
      qrcode: null
    };
  },
  methods: {
    async qrcodeGenerate() {
      const address = this.toAddress(
        this.account.address,
        this.addressFormat,
        false
      );
      this.qrcode = await QRCode.toDataURL(
        `zilliqa:${address}`
      );
    }
  },
  mounted() {
    this.qrcodeGenerate();
  }
}
</script>

<style lang="scss">
.full-address {
  font-size: 15px;
}
</style>