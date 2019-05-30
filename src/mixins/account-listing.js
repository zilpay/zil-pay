import { mapState, mapMutations, mapActions } from 'vuex'
import StateStatusUpdater from './status-updater'


export default {
  mixins: [StateStatusUpdater],
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
      'changeAccountName',
      'logOut'
    ]),

    split(hex, length=10) {
      const part0 = hex.slice(0, length);
      const part1 = hex.slice(hex.length - length);

      return `${part0}...${part1}`;
    },
    async createAccountBySeed() {
      this.spiner();
      await this.createAccount();
      await this.balanceUpdate();
      this.spiner();
    },
    async selectAccount(index) {
      let wallet = this.wallet;
      wallet.selectedAddress = index;
      this.mutateWallet(wallet);
    },
    async changeName(event) {
      const newName = event.target.value;
      
      if (newName > 20) {
        return null;
      }

      this.changeAccountName(newName);
    },
    
    addressToColor(hex) {
      hex = hex.replace('0x', '');
      return '#'+hex.slice(-6);
    }
  }
};