import { Zilliqa } from '@zilliqa-js/zilliqa'
import {
  getAddressFromPrivateKey,
  getPubKeyFromPrivateKey
} from '@zilliqa-js/crypto'
import { units, Long, BN, bytes } from '@zilliqa-js/util'
import jazzicon from 'jazzicon'
import zilConf from '../config/zil'
import Jwt from '../lib/jwt'
import Crypto from '../lib/crypto'
import BrowserStorage from '../lib/storage'
import Utils from '../lib/utils'


export default {
  namespaced: true,
  state: {
    zilliqa: new Zilliqa(zilConf.testnet.PROVIDER),
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
    selectedNet: 'testnet',
    config: zilConf,
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
    },
    transactions(state, { tx, address }) {
      let txStorage = {};
      let bookkeeper = state.transactions[address] || [];

      bookkeeper.push(tx);
      txStorage[address] = bookkeeper;

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
    async walletUpdate({ state, commit }, { index, privateKey }) {
      let data = state.wallet;
      let publicKey = getPubKeyFromPrivateKey(privateKey);
      let address = getAddressFromPrivateKey(privateKey);
      let { result } = await state.zilliqa.blockchain.getBalance(address);

      state.zilliqa.wallet.addByPrivateKey(privateKey);

      if (!result) {
        result = 0;
      } else {
        result = result.balance;
      }

      data.selectedAddress = index;
      data.identities[index] = {
        address,
        publicKey,
        balance: result
      };

      commit('wallet', data);
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
    },
    async buildTransactions({ state, commit }, { to, amount, gasPrice }) {
      let { CHAIN_ID, MSG_VERSION } = state.config[state.selectedNet];
      let { address, publicKey } = state.wallet.identities[state.wallet.selectedAddress];
      let { result } = await state.zilliqa.blockchain.getBalance(address);

      let nonce = result ? result.nonce : 0;
      let gasLimit = Long.fromNumber(1);
      let version = bytes.pack(CHAIN_ID, MSG_VERSION);

      gasPrice = units.toQa(gasPrice, units.Units.Zil);
      amount = new BN(units.toQa(amount, units.Units.Zil));
      nonce++;

      let zilTx = state.zilliqa.transactions.new({
        version, nonce, gasPrice, amount, gasLimit,
        toAddr: to, pubKey: publicKey,
      });
      let tx = await state.zilliqa.blockchain.createTransaction(zilTx);

      commit('transactions', { tx, address });

      return tx;
    }
  },
  getters: { }
}
