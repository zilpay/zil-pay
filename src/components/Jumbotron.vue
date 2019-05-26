<template>
  <div class="row">
    <div class="jumbotron">

      <div class="top">
        <div id="acc" class="text-white"
              @click="$router.push({name: 'Accounts'})"></div>
        
        <div class="text-center text-white">
          {{account.name}}
        </div>

        <div class="burger dropdown-btn">
          <img src="/icons/menu-burger.svg" height="30"
               @click="isDropdown = !isDropdown">
          <ul v-show="isDropdown" @mouseleave="isDropdown = false"
              class="dropdown dropdown-input text-black">
            <li @click="$router.push({name: 'Networks'})">Change network</li>
            <li @click="$router.push({name: 'Export', params: {type: 'key'}})">Export PrivateKey</li>
            <li>Delete account</li>
            <li @click="$router.push({name: 'Lock'})">Log out</li>
          </ul>
        </div>
      </div>

      <div class="text-center text-white">
        {{address}}
        <img src="/icons/copy.svg" v-tooltip="'Copy'" class="pointer"
             height="30" @click="copy(account.address)">
      </div>

      <div class="bottom text-center text-white">
        {{account.balance}}
        <span class="currency">ZIL</span>
        <br>
        ≈ 1000
        <span class="currency">USD</span>
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
import toBech32 from '../filters/to-bech32'


export default {
  name: 'Jumbotron',
  components: { },
  mixins: [AccountMixin, Jazzicon],
  directives: { tooltip },
  filters: { toBech32 },
  data() {
    return {
      isDropdown: false,
      open: true,
      account: {
        address: '0xEEf22809B26479ce53F52A0849DbBDAd630E0F35',
        balance: '312.3',
        name: 'warden'
      }
    };
  },
  computed: {
    address() {
      const addressBech32 = this.toBech32(this.account.address);
      return this.split(addressBech32);
    }
  },
  methods: {
    copy,
    toBech32
  },
  mounted() {
    this.jazziconMake(this.account.address, 'acc');
  }
}
</script>
