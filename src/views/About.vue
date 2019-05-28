<template>
  <div>
    <BackBar/>
    <main class="about">
      <img src="/icon128.png">
      <div class="text-center">
        <h5>ZilPay Version</h5>
        <span>{{version}}</span>

        <h5 class="text-left">Links:</h5>

        <ul class="text-left">
          <li><a href="https://github.com/lich666dead/zil-pay">GitHub</a></li>
          <li><a href="https://t.me/zilpay">Telegram</a></li>
          <li><a href="https://zilpay.xyz/privacy.html">privacy</a></li>
          <li><a href="https://zilpay.xyz/privacy.html">terms</a></li>
        </ul>

        <h5>By: lich666black</h5>
      </div>
    </main>
  </div>
</template>

<script>
import extension from 'extensionizer'

const BackBar = () => import('../components/BackBar');


export default {
  name: 'About',
  components: { BackBar },
  computed: {
    version() {
      return extension.runtime.getManifest()['version'];
    }
  }
}
</script>

<style lang="scss">
.about {
  margin-top: 30px;
  justify-items: center;
}
</style>