<template>
  <div class="row">
    <div class="jumbotron">

      <div class="top">
        <div id="acc" class="text-white"
              @click="$router.push({name: 'Accounts'})"></div>
        
        <input type="text"
               class="text-center text-white account-name"
               :value="account.name"
               @blur="changeName">

        <div class="burger dropdown-btn">
          <img src="/icons/menu-burger.svg" height="30"
               @click="isDropdown = !isDropdown">
          <ul v-show="isDropdown" @mouseleave="isDropdown = false"
              class="dropdown dropdown-input text-black">
            <li><a :href="exploreAddress(account.address)" target="_blanck">Account details</a></li>
            <li @click="$router.push({name: 'Networks'})">Change network</li>
            <li @click="$router.push({name: 'Export', params: {type: 'key'}})">Export PrivateKey</li>
            <li @click="logOut">Log out</li>
          </ul>
        </div>
      </div>

      <div class="text-center text-white">
        {{account.address | toAddress(addressFormat)}}
        <img src="/icons/copy.svg" v-tooltip="'Copy'" class="pointer"
             height="30" @click="copy(account.address)">
      </div>

      <div class="bottom text-center text-white">
        {{account.balance | fromZil}}
        <span class="currency">ZIL</span>
        <br>
        ≈ {{account.balance | toConversion(conversionRate[currency])}}
        <span class="currency">{{currency}}</span>
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
import { mapState } from 'vuex'
import Jazzicon from '../mixins/jazzicon'
import tooltip from '../directives/tooltip'
import clipboardMixin from '../mixins/clipboard'
import AccountListing from '../mixins/account-listing'
import explorer from '../mixins/explorer'
import toConversion from '../filters/to-conversion'
import fromZil from '../filters/from-zil'


export default {
  name: 'Jumbotron',
  components: { },
  mixins: [
    Jazzicon,
    clipboardMixin,
    AccountListing,
    explorer
  ],
  filters: { toConversion, fromZil },
  directives: { tooltip },
  data() {
    return {
      isDropdown: false
    };
  },
  computed: {
    ...mapState(['conversionRate']),
    ...mapState('Static', [
      'currency'
    ])
  },
  mounted() {
    this.jazziconMake(this.account.address, 'acc');
  }
}
</script>
