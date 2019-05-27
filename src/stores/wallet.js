import { MTypesInternal } from '../../lib/messages/messageTypes'
import { Message } from '../../lib/messages/messageCall'


export default {
  state: {
    isReady: true,
    isEnable: true,
    wallet: {
      selectedAddress: null,
      identities: []
    }
  },
  mutations: {

  },
  actions: {

    initPopup: () => Message.signal(MTypesInternal.INIT).send(),
    randomSeed: () => Message.signal(MTypesInternal.GET_DECRYPT_SEED).send()
  },
  getters: {

  }
};
