import { MTypesInternal, MTypesZilPay } from '../../lib/messages/messageTypes'
import { Message } from '../../lib/messages/messageCall'


export default {
  namespaced: true,
  state: {
    transactions: { },
    confirmationTx: []
  },
  mutations: {
    mutateTransactions(state, transactions) {
      state.transactions = transactions;
    },
    mutateConfirmationTx(state, transactions) {
      state.confirmationTx = transactions;
    }
  },
  actions: {
    async clearTransactions({ commit }) {
      await Message.signal(
        MTypesInternal.CLEAR_HISTORY_TX
      ).send();
    
      commit('mutateTransactions', {});
    },
    async transactionsUpdate({ commit }) {
      const transactions = await Message.signal(MTypesInternal.GET_ALL_TX).send();
      commit('mutateTransactions', transactions);
    },
    async rejectConfirmTx({ state }) {
      await Message.signal(MTypesZilPay.REJECT_CONFIRM_TX).send();
      state.confirmationTx.pop();
    },
    async confirmTx({ state }, payload) {
      const result = await new Message({
        type: MTypesZilPay.CONFIRM_TX,
        payload
      }).send();
      
      state.confirmationTx.pop();
    
      if (result.reject) {
        throw new Error(result.reject);
      }
    },
    // eslint-disable-next-line no-empty-pattern
    async buildTxParams({}, payload) {
      const type = MTypesZilPay.BUILD_TX_PARAMS;
      const result = await new Message({
        type, payload
      }).send();

      if (result.resolve) {
        return result.resolve;
      } else {
        throw new Error(result.reject);
      }
    },
    async sendSignTx({ state }, payload) {
      const type = MTypesZilPay.SEND_SIGN_TX;
      const result = await new Message({
        type, payload
      }).send();

      state.confirmationTx.pop();

      if (result.resolve) {
        return result.resolve;
      } else {
        throw new Error(result.reject);
      }
    }
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
        domain,
        title,
        icon
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
        domain,
        title,
        icon
      };
    }

  }
};
