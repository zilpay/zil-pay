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
    setWallet(state, payload) {
      InternalMessage.widthPayload(
        MTypesInternal.CHANGE_ACCOUNT,
        { wallet: payload }
      ).send();
      state.wallet = payload;
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
      state.transactions = data;
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
        MTypesAuth.SET_SEED_AND_PWD,
        { seed, password }
      ).send();

      commit('setWallet', wallet);
    },
    
    async unLock({ commit }, password) {
      const status = await InternalMessage.widthPayload(
        MTypesAuth.SET_PASSWORD,
        { password }
      ).send();
      commit('isEnable', status);
      return status;
    },

    logOut({ commit }) {
      InternalMessage.signal(MTypesAuth.LOG_OUT).send();
      commit('isEnable', false);
    },

    async balanceUpdate({ state }) {
      const wallet = await InternalMessage.signal(MTypesInternal.UPDATE_BALANCE).send();
      state.wallet = wallet;
      return wallet;
    },
    async transactionsUpdate({ state }) {
      const { transactions } = await InternalMessage.signal(MTypesInternal.GET_ALL_TX).send();
      state.transactions = transactions;
    },

    async nonContractSendTransaction({ }, data) {
      const tx = await InternalMessage.widthPayload(
        MTypesInternal.SIGN_SEND_TRANSACTION,
        { data }
      ).send();

      return tx;
    },

    initPopup: () => InternalMessage.signal(MTypesInternal.INIT).send(),
    randomSeed: () => InternalMessage.signal(MTypesInternal.GET_DECRYPT_SEED).send()
  },
  getters: {
    ISREADY: state => state.isReady,
    ISENABLE: state => state.isEnable
  }
}
