<template>
  <div>
    <BackBar/>
    <main class="about is-mini">
      <img src="/icon48.png">
      <div class="text-center">
        <span>ZilPay Version {{version}}</span>

        <div class="donate">
          <span>Maybe you want to help.</span>
          <br>
          <span>{{donate | toAddress(addressFormat, false)}}</span>
          <br>
          <button @click="copy(donate)">Copy</button>
        </div>

        <ul class="text-left">
          <li><a href="https://github.com/lich666dead/zil-pay" target="_blanck">GitHub</a></li>
          <li><a href="https://t.me/zilpay" target="_blanck">Telegram</a></li>
          <li><a href="https://zilpay.xyz/privacy.html" target="_blanck">privacy</a></li>
          <li><a href="https://zilpay.xyz/privacy.html" target="_blanck">terms</a></li>
        </ul>

        <h5>By: lich666black</h5>
      </div>
    </main>
  </div>
</template>

<script>
import extension from 'extensionizer'
import clipboardMixin from '../mixins/clipboard'

const BackBar = () => import('../components/BackBar');


export default {
  name: 'About',
  mixins: [clipboardMixin],
  components: { BackBar },
  data() {
    return {
      donate: '0x77E27C39ce572283b848E2cDF32ccE761e34Fa49'
    };
  },
  computed: {
    version() {
      return extension.runtime.getManifest()['version'];
    }
  }
}
</script>

<style lang="scss">
.about {
  justify-items: center;
}
.donate {
  font-size: 15px;
  margin-top: 50px;
}
</style>