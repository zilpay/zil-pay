import extension from 'extensionizer'

import { DEFAULT } from 'config'

const { window } = global
const coinswitch = 'https://coinswitch.co'
const faucet = 'https://dev-wallet.zilliqa.com/faucet'

export default {
  methods: {
    linksToCoinswitch(address) {
      const url = `${coinswitch}?address=${address}&to=zil`

      extension.tabs.create({ url })
    },
    linksToFaucet() {
      extension.tabs.create({ url: faucet })
    },
    linksExpand() {
      extension.tabs.create({ url: DEFAULT.PROMT_PAGE })
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
