import Mnemonic from '../lib/mnemonic'
import Crypto from '../lib/crypto'


export default {
  data() {
    return {
      mnemonic: new Mnemonic(),
      crypto: new Crypto()
    };
  },
  mounted() {
    this.phrase = this.mnemonic.generateMnemonic();
  },
  methods: {
    async onEncrypt(phrase, password) {
      let index = 0;
      let wallet = await this.mnemonic.getAccountAtIndex(phrase, index);
      let walletHash = await this.crypto.encrypt(wallet, password);
      let seedHash = await this.crypto.encrypt(phrase, password);

      return { privKeys: [walletHash], seedHash };
    }
  }
}
