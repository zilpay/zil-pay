import { mapState } from 'vuex'
import extension from 'extensionizer'

import { API } from '../../config/api'

export default {
  computed: {
    ...mapState('settings', [
      'network'
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
