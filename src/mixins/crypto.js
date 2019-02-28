import Crypto from '../lib/crypto'

export default {
  data() {
    return {
      crypto: new Crypto()
    };
  },
  methods: {
    onDecryptWallet(wallet, password) {
      let hash = this.crypto.hash(password);

      return wallet.map(el => 
        this.crypto.decrypt(el, hash)
      );
    },
    onDecryptSeed(phrase, password) {
      return this.crypto.decrypt(phrase, password);
    }
  }
}
