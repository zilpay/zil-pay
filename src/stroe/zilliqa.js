import storage from './storage'

import { Zilliqa } from '@zilliqa-js/zilliqa'
import { RPCMethod } from '@zilliqa-js/core';
import {
  getAddressFromPrivateKey,
  getPubKeyFromPrivateKey
} from '@zilliqa-js/crypto'
import { units, Long, BN, bytes } from '@zilliqa-js/util'

import Mnemonic from '../lib/mnemonic'
import zilConf from '../config/zil'


export default {
  namespaced: true,

  state: {
    zilliqa: new Zilliqa(zilConf.testnet.PROVIDER),
    mnemonic: new Mnemonic()
  },
  mutations: {
    changeProvider(state, key) {
      state.zilliqa = new Zilliqa(
        zilConf[key || 'mainnet']['PROVIDER']
      );
    }
  },
  actions: {
    async balanceUpdate({ state, getters }) {
      let storageState = getters.STORAGE_STATE;
      let storageMutations = getters.STORAGE_MUTATIONS;
      let data = storageState.wallet;
      let addressIndex = storageState.wallet.selectedAddress;
      let { address } = storageState.wallet.identities[addressIndex];
      let { result } = await state.zilliqa.blockchain.getBalance(address);

      if (!result) {
        result = 0;
      } else {
        result = result.balance;
      }

      data.identities[addressIndex].balance = result;

      storageMutations.wallet(storageState, data);

      return result;
    },
    async createWallet({ state, getters }, index) {
      let storageState = getters.STORAGE_STATE;
      let storageMutations = getters.STORAGE_MUTATIONS;
      let data = storageState.wallet;

      if (!state.mnemonic._bip39) {
        state.mnemonic.bip32Node(storageState.bip39);
      }

      let { privateKey } = state.mnemonic.getPrivateKeyAtIndex(index);
      let publicKey = getPubKeyFromPrivateKey(privateKey);
      let address = getAddressFromPrivateKey(privateKey);
      let { result } = await state.zilliqa.blockchain.getBalance(address);

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

      storageMutations.wallet(storageState, data);
    },

    async buildTransaction({ state, getters }, { to, amount, gasPrice }) {
      let storageState = getters.STORAGE_STATE;
      let storageMutations = getters.STORAGE_MUTATIONS;
      let { address, publicKey } = getters.ACCOUNT_ACTIVATION;

      let { result } = await state.zilliqa.blockchain.getBalance(address);
      let nonce = result ? result.nonce : 0;
      let gasLimit = Long.fromNumber(1);

      gasPrice = units.toQa(gasPrice, units.Units.Zil);
      amount = new BN(units.toQa(amount, units.Units.Zil));
      nonce++;

      let zilTxData = state.zilliqa.transactions.new({
        nonce, gasPrice, amount, gasLimit,
        toAddr: to,
        pubKey: publicKey,
        version: getters.VERSION
      });

      let { txParams } = await state.zilliqa.wallet.sign(zilTxData);
      let data = await state.zilliqa.provider.send(
        RPCMethod.CreateTransaction, txParams
      );
      let transactionCreated = {
        amount: amount.toString(),
        id: data.result.TranID,
        info: data.result.Info,
        net: storageState.selectedNet,
        toAddr: txParams.toAddr,
        fromAddr: address
      };

      storageMutations.transactions(storageState, transactionCreated);

      return transactionCreated;
    }
  },
  getters: {
    STORAGE_STATE() {
      return storage.state;
    },
    STORAGE_MUTATIONS() {
      return storage.mutations;
    },
    VERSION() {
      let { CHAIN_ID, MSG_VERSION } = storage.state.config[
        storage.state.selectedNet
      ];
      return bytes.pack(CHAIN_ID, MSG_VERSION);
    },
    ACCOUNT_ACTIVATION(state) {
      if (!state.mnemonic._bip39) {
        state.mnemonic.bip32Node(storage.state.bip39);
      }

      let index = storage.state.wallet.selectedAddress;
      let { privateKey } = state.mnemonic.getPrivateKeyAtIndex(index);
      let wallet = storage.state.wallet.identities[index];

      state.zilliqa.wallet.addByPrivateKey(privateKey);

      return wallet;
    }
  }
}
