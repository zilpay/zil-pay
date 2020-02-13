<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import uiStore from '@/store/ui'

export default {
  name: 'App',
  methods: {
    ...mapActions(uiStore.STORE_NAME, [
      uiStore.ACTIONS_NAMES.onLocal
    ])
  },
  beforeMount() {
    this.onLocal()
  }
}
</script>

<style lang="scss">
@import "./styles/general";
</style>
