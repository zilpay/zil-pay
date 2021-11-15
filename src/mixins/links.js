import extension from 'extensionizer'

import { DEFAULT } from 'config'

const { window } = global
const transak = 'https://global.transak.com/'
const faucet = 'https://dev-wallet.zilliqa.com/faucet'

export default {
  methods: {
    linksToCoinswitch() {
      const url = transak

      extension.tabs.create({ url })
    },
    linksToFaucet() {
      extension.tabs.create({ url: faucet })
    },
    linksExpand(url = '') {
      extension.tabs.create({ url: DEFAULT.PROMT_PAGE + `#/${url}` })
      window.close()
    },
    linkToDomain(domain) {
      if (!domain.includes('http')) {
        domain = `http://${domain}`
      }

      extension.tabs.create({ url: domain })
    }
  }
}
