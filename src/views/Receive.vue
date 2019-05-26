<template>
  <div>
    
    <BackBar/>

    <main class="text-center">

      <h1 class="text-black">{{account.name}}</h1>

      <div>
        <img v-if="qrcode" :src="qrcode">
        <br>
        <span class="full-address">{{account.address | toAddress(addressFormat, false)}}</span>
        <br>
        <button @click="copy">Copy address</button>
      </div>

      <hr>
    </main>
  </div>
</template>

<script>
import QRCode from 'qrcode'
import clipboardMixin from '../mixins/clipboard'

const BackBar = () => import('../components/BackBar');


export default {
  name: 'receive',
  mixins: [clipboardMixin],
  components: { BackBar },
  data() {
    return {
      account: {
        address: '0xEEf22809B26479ce53F52A0849DbBDAd630E0F35',
        balance: '312.3',
        name: 'warden'
      },
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