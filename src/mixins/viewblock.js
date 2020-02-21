import extension from 'extensionizer'

import { mapState } from 'vuex'
import settingsStore from '@/store/settings'


import { API } from 'config/api'

export default {
  computed: {
    ...mapState(settingsStore.STORE_NAME, [
      settingsStore.STATE_NAMES.network
    ]),
    net() {
      return `network=${this.network}`
    }
  },
  methods: {
    onViewblockTx(hash) {
      const url = `${API.EXPLORER}/tx/${hash}?${this.net}`

      extension.tabs.create({ url })
    },
    onViewblockAddress(address) {
      const url = `${API.EXPLORER}/address/${address}?${this.net}`

      extension.tabs.create({ url })
    }
  }
}
