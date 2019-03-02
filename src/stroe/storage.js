import { Zilliqa } from '@zilliqa-js/zilliqa'
import { getAddressFromPrivateKey, getPubKeyFromPrivateKey } from '@zilliqa-js/crypto'
import jazzicon from 'jazzicon'
import zilConf from '../config/zil'
import Jwt from '../lib/jwt'
import Crypto from '../lib/crypto'
import BrowserStorage from '../lib/storage'


export default {
  namespaced: true,
  state: {
    zilliqa: new Zilliqa(zilConf.PROVIDER),
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
    config: {
      PROVIDER: zilConf.PROVIDER,
      CHAIN_ID: zilConf.CHAIN_ID
    },
    bip39: ''
  },
  mutations: {
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
      state.pubKeyJWT = state.jwt.generateKey(password);
      state.vault = await state.jwt.tokenCreate(state.pubKeyJWT);

      commit('vault', state.vault);
      commit('pubKeyJWT', state.pubKeyJWT);
      commit('ready', true);
    },
    async updateJWT({ state, commit }, password) {
      let key = state.jwt.generateKey(password);
      
      if (key !== state.pubKeyJWT) {
        return false;
      }

      state.vault = await state.jwt.tokenCreate(state.pubKeyJWT);
      
      commit('vault', state.vault);
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
    async bip39Decrypt({ state, commit }, password) {
      let { phash } = await state.jwt.tokenVerify(state.vault, password);
      let hashID = await state.crypto.hash(state.storage.EXT_ID);
      let bip39 = await state.storage.get('bip39');
      
      bip39 = state.crypto.decrypt(bip39, phash + hashID);

      commit('bip39', bip39);
    },
    async bip39Encrypt({ state }, password) {
      let phash = state.crypto.hash(password);
      let hashID = await state.crypto.hash(state.storage.EXT_ID);
      let bip39 = state.crypto.encrypt(state.bip39, phash + hashID);
      
      state.storage.set({ bip39 });
    },
    async walletUpdate({ state, commit }, { index, privateKey }) {
      let publicKey = getPubKeyFromPrivateKey(privateKey);
      let address = getAddressFromPrivateKey(privateKey);
      let { result } = await state.zilliqa.blockchain.getBalance(address);

      await state.zilliqa.wallet.addByPrivateKey(privateKey);
 
      if (!result) {
        result = 0;
      } else {
        result = result.balance;
      }

      state.wallet.selectedAddress = index;
      state.wallet.identities[index] = {
        address,
        publicKey,
        balance: result
      };
      
      commit('wallet', state.wallet);
    },
    async jazzicon({ state }, id) {
      let ctx = window.document.querySelector('#' + id);
      let { wallet } = await state.storage.get('wallet');
      let account = wallet.identities[wallet.selectedAddress];
      let el = jazzicon(45, `0x${account.address}`);

      ctx.appendChild(el);
    }
  },
  getters: { }
}
