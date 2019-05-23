<template>
  <div>
    
    <BackBar/>

    <main class="text-center">

      <h1 class="text-black">{{account.name}}</h1>

      <div>
        <img v-if="qrcode" :src="qrcode">
        <br>
        <span class="full-address">{{account.address}}</span>
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
import BackBar from '../components/BackBar'


export default {
  name: 'receive',
  components: { BackBar },
  data() {
    return {
      account: {
        address: 'bc1qngw83fg8dz0k749cg7k3emc7v98wy0c74dlrkd',
        balance: '312.3',
        name: 'warden'
      },
      qrcode: null
    };
  },
  methods: {
    copy,

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