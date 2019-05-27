
export default {
  namespaced: true,
  state: {
    transactions: { },
    confirmationTx: []
  },
  mutations: {

  },
  actions: {

  },
  getters: {
    CONFIRM_TX(state) {
      if (state.confirmationTx.length < 1) {
        return {};
      }
      let type = 'Send Zil.';
      let method = '';
      const txs = state.confirmationTx;
      const length = txs.length;
      const {
        toAddr,
        gasPrice,
        gasLimit,
        amount,
        code,
        data,
        domain
      } = txs[length - 1];
      if (code && data) {
        type = 'Contract creation.';
      } else if (data) {
        method = JSON.parse(data)._tag;
        type = 'Contract call method: ';
      }
      return {
        length,
        toAddr,
        gasPrice,
        gasLimit,
        amount,
        type,
        method,
        domain
      };
    }

  }
};
