import jazzicon from 'jazzicon'
import zilConf from '../config/zil'
import Jwt from '../lib/jwt'
import Crypto from '../lib/crypto'
import BrowserStorage from '../lib/storage'
import Utils from '../lib/utils'


export default {
  namespaced: true,
  state: {
    storage: BrowserStorage(),
    jwt: new Jwt(),
    crypto: new Crypto(),

    vault: null,
    ready: false,
    phash: '',
    pubKeyJWT: '',
    wallet: {
      selectedAddress: null, // index
      identities: [/*{address: 0x..., index: 0, publicKey: 0x, balance: 30}*/]
    },
    transactions: {}, // {'0x..': [{to, amount, hash}] } //
    selectedNet: null,
    config: zilConf,
    bip39: ''
  },
  mutations: {
    setNet(state, payload) {
      state.selectedNet = payload;
      state.storage.set({ selectedNet: payload });
    },
    vault(state, payload) {
      state.vault = payload;
      state.storage.set({ vault: payload });
    },
    pubKeyJWT(state, key) {
      state.pubKeyJWT = key;
      state.storage.set({ pubKeyJWT: key });
    },
    wallet(state, object) {
      state.wallet = object;
      state.storage.set({ wallet: object });
    },
    config(state, object) {
      state.config = object;
      state.storage.set({ config: object });
    },
    bip39(state, bip39) {
      state.bip39 = bip39;
    },
    ready(state, isReady) {
      state.ready = isReady;
    },
    phash(state, phash) {
      state.phash = phash;
    },
    transactions(state, data) {
      let txStorage = {};
      let bookkeeper = state.transactions[data.fromAddr] || [];

      bookkeeper.push(data);
      txStorage[data.fromAddr] = bookkeeper;

      state.transactions = Object.assign(txStorage, state.transactions);
      state.storage.set({ transactions: state.transactions });
    }
  },
  actions: {
    async syncBrowser({ state }) {
      let storage = await state.storage.getAll();
      let keys = Object.keys(storage);

      keys.forEach(key => {
        state[key] = storage[key];
        // commit(key, storage[key]);
      });

      return null;
    },
    async createJWT({ state, commit }, password) {
      let pubKeyJWT = state.jwt.generateKey(password);
      let { phash, token } = await state.jwt.tokenCreate(pubKeyJWT);

      commit('vault', token);
      commit('pubKeyJWT', pubKeyJWT);
      commit('ready', true);
      commit('phash', phash);
    },
    async updateJWT({ state, commit }, password) {
      let key = state.jwt.generateKey(password);

      if (key !== state.pubKeyJWT) {
        return false;
      }

      let { token } = await state.jwt.tokenCreate(state.pubKeyJWT);

      commit('vault', token);
      commit('ready', true);

      return true;
    },
    async signVerifyJWT({ state, commit }) {
      let status = false;

      try {
        let { phash } = await state.jwt.tokenVerify(
          state.vault, state.pubKeyJWT
        );

        status = true;

        commit('phash', phash);
        commit('ready', status);

        return status;
      } catch(err) {
        commit('ready', status);
        return status;
      }
    },
    bip39Decrypt({ state, commit }) {
      let bip39 = state.bip39;
      let phash = state.phash;

      try {
        bip39 = state.crypto.decrypt(bip39, phash);

        commit('ready', true);
        commit('bip39', bip39);

        return true;
      } catch(err) {
        commit('ready', false);
        commit('vault', '');
        return false;
      }
    },
    async bip39Encrypt({ state, commit }, bip39) {
      let phash = state.phash;

      commit('bip39', bip39);

      bip39 = state.crypto.encrypt(bip39, phash);

      state.storage.set({ bip39 });
    },
    async jazzicon({ state }, id) {
      let ctx = window.document.querySelector('#' + id);
      let { wallet } = await state.storage.get('wallet');

      if (!wallet) {
        return null;
      }

      let account = wallet.identities[wallet.selectedAddress];
      let el = jazzicon(45, Utils.jsNumberForAddress(account.address));

      ctx.appendChild(el);
    }
  },
  getters: {
    NET: state => state.selectedNet
  }
}
