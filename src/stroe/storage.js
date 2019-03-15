import jazzicon from 'jazzicon'
import zilConf from '../config/zil'
import Utils from '../lib/utils'
import { MTypesInternal, MTypesAuth, MTypesZilPay } from '../lib/messages/messageTypes'
import { Message } from '../lib/messages/messageCall'
import { toZil } from '../filters/zil'


export default {
  namespaced: true,
  state: {
    isReady: false,
    isEnable: false,
    wallet: {
      selectedAddress: null, // index
      identities: [/*{address: 0x..., index: 0, publicKey: 0x, balance: 30}*/]
    },
    transactions: { },
    selectedNet: Object.keys(zilConf)[0],
    config: zilConf,
    confirmationTx: []
  },
  mutations: {
    setNet(state, net) {
      const type = MTypesInternal.SET_NET;
      const payload = { selectedNet: net };

      new Message({ type, payload }).send();

      state.selectedNet = net;
    },
    setWallet(state, wallet) {
      const type = MTypesInternal.CHANGE_ACCOUNT;
      const payload = { wallet };

      new Message({ type, payload }).send();
      
      state.wallet = wallet;
    },
    config(state, object) {
      state.config = object;
    },
    isReady(state, isReady) {
      state.isReady = isReady;
    },
    isEnable(state, isEnable) {
      state.isEnable = isEnable;
    },
    transactions(state, data) {
      state.transactions = data;
    },

    confirmationTx(state, data) {
      if ((typeof data !== 'object') || (!data || data.length < 1)) {
        state.confirmationTx = [];
      } else {
        state.confirmationTx = data.filter(tx => Object.keys(tx).length > 0);
      }
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
      const type = MTypesAuth.SET_SEED_AND_PWD;
      const payload = { seed, password };
      const wallet = await new Message({ type, payload }).send();

      commit('setWallet', wallet);
    },
    async unLock({ commit }, password) {
      const type = MTypesAuth.SET_PASSWORD;
      const payload = { password };
      const status = await new Message({ type, payload }).send();

      commit('isEnable', status);

      return status;
    },
    logOut({ commit }) {
      Message.signal(MTypesAuth.LOG_OUT).send();
      commit('isEnable', false);
    },
    async balanceUpdate({ state }) {
      const wallet = await Message.signal(MTypesInternal.UPDATE_BALANCE).send();
      state.wallet = wallet;
      return wallet;
    },
    async transactionsUpdate({ state }) {
      const transactions = await Message.signal(MTypesInternal.GET_ALL_TX).send();
      state.transactions = transactions;
    },
    async nonContractSendTransaction(_, data) {
      const type = MTypesZilPay.CALL_SIGN_TX;
      const payload = data;
      await new Message({ type, payload }).send();  
    },
    async createAccount({ state }) {
      state.wallet = await Message.signal(MTypesInternal.CREATE_ACCOUNT).send();
      return state.wallet;
    },
    async rejectConfirmTx({ state }) {
      await Message.signal(MTypesZilPay.REJECT_CONFIRM_TX).send();
      state.confirmationTx.pop();
    },
    async confirmTx({ state }, payload) {
      await new Message({
        type: MTypesZilPay.CONFIRM_TX,
        payload
      }).send();
      state.confirmationTx.pop();
    },

    initPopup: () => Message.signal(MTypesInternal.INIT).send(),
    randomSeed: () => Message.signal(MTypesInternal.GET_DECRYPT_SEED).send()
  },
  getters: {
    ISREADY: state => state.isReady,
    ISENABLE: state => state.isEnable,
    
    CONFIRM_TX(state) {
      if (state.confirmationTx.length < 1) {
        return {};
      }
      let type = 'Send Zil.';
      const txs = state.confirmationTx;
      const length = txs.length;
      const { toAddr, gasPrice, gasLimit, amount, code, data } = txs[length - 1];

      if (code && data) {
        type = 'Contract creation.';
      } else if (data) {
        type = 'Contract call state.';
      }
      return { length, toAddr, gasPrice, gasLimit, amount, type };
    }
  }
}
