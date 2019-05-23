<template>
  <div>
    
    <BackBar/>

    <main class="text-center">

      <h1 class="text-black">{{account.name}}</h1>

      <div>
        <img v-if="qrcode" :src="qrcode">
        <br>
        <span class="full-address">{{account.address | toBech32}}</span>
        <br>
        <button @click="copy(account.address)">Copy address</button>
      </div>

      <hr>
    </main>
  </div>
</template>

<script>
import QRCode from 'qrcode'
import copy from 'clipboard-copy'
import toBech32 from '../filters/to-bech32'

const BackBar = () => import('../components/BackBar');


export default {
  name: 'receive',
  components: { BackBar },
  filters: { toBech32 },
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
    copy(hex) {
      const bech32Address = toBech32(hex);
      copy(bech32Address);
    },

    async qrcodeGenerate() {
      this.qrcode = await QRCode.toDataURL(
        `zilliqa:${this.account.address}`
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