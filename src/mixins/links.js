import extension from 'extensionizer'

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
    }
  }
}
