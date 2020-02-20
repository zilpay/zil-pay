<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import { mapActions, mapMutations } from 'vuex'
import uiStore from '@/store/ui'
import settingsStore from '@/store/settings'

export default {
  name: 'App',
  methods: {
    ...mapActions(settingsStore.STORE_NAME, [
      settingsStore.ACTIONS_NAMES.updateRate
    ]),
    ...mapActions(uiStore.STORE_NAME, [
      uiStore.ACTIONS_NAMES.onLocal
    ]),
    ...mapMutations(uiStore.STORE_NAME, [
      uiStore.MUTATIONS_NAMES.setLoad
    ])
  },
  async beforeMount() {
    this.setLoad()
    await this.onLocal()
    await this.updateRate()
    this.setLoad()
  }
}
</script>

<style lang="scss">
@import "./styles/general";
</style>
