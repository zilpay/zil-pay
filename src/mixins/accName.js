import { mapState, mapActions } from 'vuex'


export default {
  computed: {
    ...mapState('storage', [
      'wallet'
    ]),

    name() {
      return this.getName(this.wallet.selectedAddress);
    }
  },
  methods: {
    ...mapActions('storage', [
      'changeAccountName'
    ]),

    changeName(event) {
      const newName = event.target.value;
      
      if (newName > 20) {
        return null;
      }

      this.changeAccountName(newName);
    },
    getName(index) {
      const account = this.wallet.identities[index];

      if (account.name) {
        return account.name;
      } else {
        return `Account ${index + 1}`;
      }
    }
  }
};