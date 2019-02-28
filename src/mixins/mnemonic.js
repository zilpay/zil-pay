import Mnemonic from '../lib/mnemonic'
import CryptoMixin from './crypto'


export default {
  mixins: [CryptoMixin],
  data() {
    return {
      mnemonic: new Mnemonic()
    };
  },
  mounted() {
    this.phrase = this.mnemonic.generateMnemonic();
  },
  methods: {
    async onEncrypt(phrase, password) {
      let index = 0;
      let hash = this.crypto.hash(password);
      let wallet = await this.mnemonic.getAccountAtIndex(phrase, index);
      let seedHash = await this.crypto.encrypt(phrase, password);

      return {
        wallets: [{
          address: wallet.address,
          id: index
        }],
        mnemonic: seedHash,
        hash: hash
      };
    }
  }
}
