import Mnemonic from '../lib/mnemonic'


export default {
  data() {
    return {
      mnemonic: new Mnemonic()
    };
  },
  mounted() {
    this.mnemonicPhrase = this.mnemonic.generateMnemonic();
  },
  methods: { }
}
