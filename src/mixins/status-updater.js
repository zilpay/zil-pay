import { mapActions } from 'vuex'


export default {
  methods: {
    ...mapActions([
      'updateRate'
    ]),
    ...mapActions('Wallet', [
      'balanceUpdate'
    ]),
    ...mapActions('Static', [
      'stateUpdate'
    ]),

    upadteAllState() {
      this.updateRate();

      this.balanceUpdate().catch(console.log);
      this.stateUpdate();
    }
  }
};