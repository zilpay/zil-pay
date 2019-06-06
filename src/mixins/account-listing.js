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

      if (!account.name && account.hwType) {
        account.name = `Ledger ${account.index}`;
      } else if (!account.name) {
        account.name = `Account ${account.index}`;
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
      'logOut',
      'removeAccount'
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
      let rgb = this.hexToRgb(hex.slice(-6));

      rgb.r = rgb.r > 150 ? 150 : rgb.r;
      rgb.g = rgb.g > 200 ? 200 : rgb.g;
      rgb.b = rgb.b > 100 ? 100 : rgb.b;
    
      return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    },
    hexToRgb(hex) {
      const bigint = parseInt(hex, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
  
      return { r, g, b };
    }
  }
};