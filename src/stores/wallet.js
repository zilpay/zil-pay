import { MTypesInternal, MTypesAuth } from '../../lib/messages/messageTypes'
import { Message } from '../../lib/messages/messageCall'


export default {
  namespaced: true,
  state: {
    isReady: true,
    isEnable: true,
    wallet: {
      selectedAddress: null,
      identities: []
    }
  },
  mutations: {
    mutateIsReady(state, isReady) {
      state.isReady = isReady;
    },
    mutateIsEnable(state, isEnable) {
      state.isEnable = isEnable;
    },
    mutateWallet(state, wallet) {
      const type = MTypesInternal.CHANGE_ACCOUNT;
      const payload = { wallet };
      new Message({ type, payload }).send();
      state.wallet = wallet;
    }
  },
  actions: {
    async newWallet({ commit }, { seed, password }) {
      const type = MTypesAuth.SET_SEED_AND_PWD;
      const payload = { seed, password };
      const wallet = await new Message({ type, payload }).send();
    
      if (wallet.resolve) {
        commit('setWallet', wallet.resolve);
      } else {
        throw new Error(wallet.reject);
      }
    },

    initPopup: () => Message.signal(MTypesInternal.INIT).send(),
    randomSeed: () => Message.signal(MTypesInternal.GET_DECRYPT_SEED).send()
  },
  getters: {

  }
};
