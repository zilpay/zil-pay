import { mapState, mapMutations, mapActions } from 'vuex'


export default {
  computed: {
    ...mapState('Wallet', [
      'wallet'
    ]),
    
    account() {
      if (!this.wallet.identities) {
        return null;
      }

      let account = this.wallet.identities[
        this.wallet.selectedAddress
      ];

      if (!account.name) {
        account.name = `Account ${account.index + 1}`;
      }

      return account;
    }
  },
  methods: {
    ...mapMutations(['spiner']),
    ...mapMutations('Wallet', [
      'mutateWallet'
    ]),
    ...mapActions('Wallet', [
      'createAccount',
    ]),

    split(hex, length=10) {
      const part0 = hex.slice(0, length);
      const part1 = hex.slice(hex.length - length);

      return `${part0}...${part1}`;
    },
    async createAccountBySeed() {
      this.spiner();
      await this.createAccount();
      this.spiner();
    },
    async selectAccount(index) {
      let wallet = this.wallet;
      wallet.selectedAddress = index;
      this.mutateWallet(wallet);
    },
  }
};