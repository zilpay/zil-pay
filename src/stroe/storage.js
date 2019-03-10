import jazzicon from 'jazzicon'
import zilConf from '../config/zil'
import Utils from '../lib/utils'
import {
  // MTypesContent,
  // Message,
  InternalMessage,
  MTypesAuth,
  MTypesInternal
} from '../content/messages/messageTypes'


export default {
  namespaced: true,
  state: {
    vault: null,
    isReady: false,
    isEnable: false,
    wallet: {
      selectedAddress: null, // index
      identities: [/*{address: 0x..., index: 0, publicKey: 0x, balance: 30}*/]
    },
    transactions: {}, // {'0x..': [{to, amount, hash}] } //
    selectedNet: Object.keys(zilConf)[0],
    config: zilConf
  },
  mutations: {
    setNet(state, payload) {
      InternalMessage.widthPayload(
        MTypesInternal.SET_NET,
        { selectedNet: payload }
      ).send();
      state.selectedNet = payload;
    },
    setWallet(state, object) {
      state.wallet = object;
    },
    config(state, object) {
      state.config = object;
    },
    isReady(state, isReady) {
      state.ready = isReady;
    },
    isEnable(state, isEnable) {
      state.isEnable = isEnable;
    },
    transactions(state, data) {
      let txStorage = {};
      let bookkeeper = state.transactions[data.fromAddr] || [];

      bookkeeper.push(data);
      txStorage[data.fromAddr] = bookkeeper;

      state.transactions = Object.assign(txStorage, state.transactions);
    }
  },
  actions: {
    async jazzicon({ state }, id) {
      if (state.wallet.identities.length < 1) {
        return null;
      }

      let ctx = window.document.querySelector('#' + id);
      let account = state.wallet.identities[state.wallet.selectedAddress];
      let el = jazzicon(45, Utils.jsNumberForAddress(account.address));

      if (ctx.children.length > 0) {
        ctx.children[0].remove();
      }

      ctx.appendChild(el);
    },

    async walletCreate({ commit }, { seed, password }) {
      const wallet = await InternalMessage.widthPayload(
        MTypesInternal.SET_SEED_AND_PWD,
        { seed, password }
      ).send();

      commit('setWallet', wallet);
    },
    async unLock({ state }, password) {
      const status = await InternalMessage.widthPayload(
        MTypesAuth.SET_PASSWORD,
        { password }
      ).send();
      console.log(status);
      return status;
    },

    initPopup: () => InternalMessage.signal(MTypesInternal.INIT).send(),
    randomSeed: () => InternalMessage.signal(MTypesInternal.GET_DECRYPT_SEED).send()
  },
  getters: {
    NET: state => state.selectedNet
  }
}
