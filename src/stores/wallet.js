import { MTypesInternal } from '../../lib/messages/messageTypes'
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
    }
  },
  actions: {

    initPopup: () => Message.signal(MTypesInternal.INIT).send(),
    randomSeed: () => Message.signal(MTypesInternal.GET_DECRYPT_SEED).send()
  },
  getters: {

  }
};
