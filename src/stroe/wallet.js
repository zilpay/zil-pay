import { Zilliqa } from '@zilliqa-js/zilliqa'
import { getAddressFromPrivateKey } from '@zilliqa-js/crypto'
import zilConfig from '../config/zil'


export default {
  namespaced: true,
  state: {
    selectedAddress: null,
    identities: [/*{address: 0x..., name: Account 1}*/],
    currentBalance: 0
  },
  mutations: {
    addAddress: (state, accounts) => state.identities.push(accounts),
    selectAddress: (state, account) => state.selectedAddress = account
  },
  actions: {
    importAddress() {},
    async balanceUpdate() {
      // what would work need to import a private key. //
      let zilliqa = new Zilliqa(zilConfig.PROVIDER);
      let address = 'c54e41d38d7d95f2bd8cca729334c78672f34bf4';
      let balance = await zilliqa.blockchain.getBalance(address);
      console.log(balance);
    }
  },
  getters: {
    IDENTITIES: state => state.identities
  }
}
