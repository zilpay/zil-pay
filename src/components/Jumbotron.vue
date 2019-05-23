<template>
  <div class="row">
    <div class="jumbotron">

      <div class="top">
        <div id="acc" class="text-white"
              @click="$router.push({name: 'Accounts'})"></div>

        <div class="burger dropdown-btn">
          <img src="/icons/menu-burger.svg" height="30"
               @click="isDropdown = !isDropdown">
          <ul v-show="isDropdown" @mouseleave="isDropdown = false"
              class="dropdown dropdown-input text-black">
            <li @click="$router.push({name: 'Networks'})">Change network</li>
            <li @click="$router.push({name: 'Export', params: {type: 'key'}})">Export account</li>
            <li>Delete account</li>
            <li>Log out</li>
          </ul>
        </div>
      </div>

      <div class="text-center text-white">
        {{account.name}}
      </div>

      <div class="center text-center">
        <h5 class="text-white">{{address}}</h5>
        <img src="/icons/copy.svg" v-tooltip="'copy'"
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
import Jazzicon from '../mixins/jazzicon'
import tooltip from '../directives/tooltip'


export default {
  name: 'Jumbotron',
  mixins: [AccountMixin, Jazzicon],
  directives: { tooltip },
  data() {
    return {
      isDropdown: false,
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

      if (width > 390) {
        return this.account.address;
      }

      return this.split(this.account.address);
    }
  },
  methods: {
    copy
  },
  mounted() {
    this.jazziconMake(this.account.address, 'acc');
  }
}
</script>
