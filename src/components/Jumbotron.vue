<template>
  <div class="row">
    <div class="jumbotron">

      <div class="top">
        <div>
          <img src="/icons/wallet.svg" height="30">
          <span class="text-white">{{account.name}}</span>
        </div>

        <img src="/icons/menu-burger.svg" height="30">
      </div>

      <div class="center text-center">
        <h5 class="text-white">{{address}}</h5>
        <img src="/icons/copy.svg"
             height="30" @click="copy(account.address)">
      </div>

      <div class="bottom text-center">
        <h5 class="text-white">
          {{account.balance}}
          <span class="currency">ZIL</span>
          <br>
          ≈ 1000
          <span class="currency">USD</span>
        </h5>
      </div>

      <div class="btns text-white">
        <span @click="$router.push({name: 'Receive'})">
          <img src="/icons/qr-code-white.svg" height="18">
          Receive
        </span>
        <span @click="$router.push({name: 'Send'})">
          <img src="/icons/send.svg" height="21">
          Send
        </span>
      </div>
      
    </div>
  </div>
</template>

<script>
import copy from 'clipboard-copy'
import AccountMixin from '../mixins/account'


export default {
  name: 'Jumbotron',
  mixins: [AccountMixin],
  data() {
    return {
      account: {
        address: '0x90C3269c32e328fC26C91Fb3cD107B88E74e1C7c',
        balance: '312.3',
        name: 'warden'
      }
    };
  },
  computed: {
    address() {
      const width = window.screen.width;

      if (width > 360) {
        return this.account.address;
      }

      return this.split(this.account.address);
    }
  },
  methods: {
    copy
  }
}
</script>
