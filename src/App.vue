<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import { mapActions, mapMutations } from 'vuex'
import uiStore from '@/store/ui'
import settingsStore from '@/store/settings'
import walletStore from '@/store/wallet'

import FirstPage from '@/pages/FirstStart'
import LockPage from '@/pages/LockScreen'

export default {
  name: 'App',
  methods: {
    ...mapActions(settingsStore.STORE_NAME, [
      settingsStore.ACTIONS_NAMES.updateRate
    ]),
    ...mapActions(uiStore.STORE_NAME, [
      uiStore.ACTIONS_NAMES.onLocal
    ]),
    ...mapActions(walletStore.STORE_NAME, [
      walletStore.ACTIONS_NAMES.onInit
    ]),
    ...mapMutations(uiStore.STORE_NAME, [
      uiStore.MUTATIONS_NAMES.setLoad
    ])
  },
  async beforeMount() {
    this.setLoad()
    await this.onLocal()

    const authData = await this.onInit()

    if (!authData.isReady) {
      this.$router.push({ name: FirstPage.name })

      return null
    } else if (!authData.isEnable) {
      this.$router.push({ name: LockPage.name })

      return null
    }

    await this.updateRate()
    this.setLoad()
  }
}
</script>

<style lang="scss">
@import "./styles/general";
</style>
