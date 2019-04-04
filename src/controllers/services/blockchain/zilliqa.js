import { Zilliqa } from '@zilliqa-js/zilliqa'
import { RPCMethod } from '@zilliqa-js/core'
import { Long, BN, bytes, validation } from '@zilliqa-js/util'
import { BrowserStorage, BuildObject } from '../../../lib/storage'
import fields from '../../../config/fields'
import errorsCode from './errors'

export class ZilliqaControl extends Zilliqa {

  constructor(provider) {
    super(provider);
  }

  async getBalance(address) {
    // Get the balance by address. // 
    let { result } = await this.blockchain.getBalance(address);
    let nonce = 0;

    if (!result) {
      result = 0;
    } else {
      nonce = result ? result.nonce : 0;
      result = result.balance;
    }

    return { result, nonce };
  }

  async singTransaction(txData, seedOrPrivateKey, index, currentNonce, msgId) {
    /**
     * @param {txData}: Object with data about transaction.
     * @param seedOrPrivateKey: type String, seed phrase or private key.
     * @param index: type Number, the index of address from seed phrase.
     * @prarm msgId: Message version network.
     */

    // importing account from private key or seed phrase. //
    if (validation.isPrivateKey(seedOrPrivateKey)) {
      this.wallet.addByPrivateKey(seedOrPrivateKey);
    } else {
      this.wallet.addByMnemonic(seedOrPrivateKey, index);
    }

    const pubKey = this.wallet.defaultAccount.publicKey;
    const balance = await this.getBalance(
      this.wallet.defaultAccount.address
    );
    let {
      amount,   // Amount of zil. type Number.
      code,     // Value contract code. type String.
      data,     // Call contract transition. type Object.
      gasLimit,
      gasPrice,
      toAddr,   // Recipient address. type String.
      nonce,
      version   // Netowrk version. type Number.
    } = txData;

    if (!version) {
      version = await this.version(msgId);
    }
    if (isNaN(nonce)) {
      nonce = balance.nonce;
    }
    if (currentNonce > balance.nonce) {
      nonce = currentNonce;
    }

    amount = new BN(amount);
    gasPrice = new BN(gasPrice);
    gasLimit = Long.fromNumber(gasLimit);

    nonce++;

    const zilTxData = this.transactions.new({
      nonce,
      gasPrice,
      amount,
      gasLimit,
      version,
      toAddr,
      pubKey,
      code,
      data
    });
    // Sign transaction by current account. //
    const { txParams } = await this.wallet.sign(zilTxData);

    return await this.provider.send( // Send to shard node.
      RPCMethod.CreateTransaction, txParams
    );
  }

  async version(msgVerison=1) {
    const { result } = await this.network.GetNetworkId();
    return bytes.pack(result, msgVerison);
  }

  async getAccountBySeed(seed, index) {
    if (typeof seed !== 'string' || isNaN(index)) {
      throw new Error(errorsCode.WrongParams);
    }

    this.wallet.addByMnemonic(seed, index);

    const {
      address,
      publicKey,
      privateKey
    } = this.wallet.defaultAccount;
    const { result } = await this.getBalance(address);

    return {
      index, publicKey, address, privateKey,
      balance: result
    };
  }

  async getAccountByPrivateKey(importPrivateKey, index=0) {
    this.wallet.addByPrivateKey(importPrivateKey);

    const account = this.wallet.defaultAccount;
    const { result } = await this.getBalance(account.address);

    return Object.assign(account, { index, balance: result });
  }

  async addForSingTransaction(payload) {
    [
      'amount',
      'toAddr'
    ].forEach(key => {
      if (!payload.hasOwnProperty(key)) {
        throw new Error(
          errorsCode.WrongRequiredparam + key
        );
      }
    });

    const storage = new BrowserStorage();
    let forConfirm = await storage.get(fields.CONFIRM_TX);

    try {
      forConfirm = forConfirm[fields.CONFIRM_TX];
      forConfirm.push(payload);
    } catch(err) {
      forConfirm = [payload];
    }

    await storage.set(new BuildObject(fields.CONFIRM_TX, forConfirm));
  }

  async rmForSingTransaction() {
    const storage = new BrowserStorage();
    let forConfirm = await storage.get(fields.CONFIRM_TX);

    forConfirm = forConfirm[fields.CONFIRM_TX];

    const removedConfirm = forConfirm.pop();
    
    await storage.set(new BuildObject(fields.CONFIRM_TX, forConfirm));

    return removedConfirm;
  }

  async addTransactionList(tx, net) {
    const storage = new BrowserStorage();
    const { from } = tx;
    let txsList = await storage.get(fields.TRANSACTIONS);
    const data = {
      Info: tx.Info,
      TranID: tx.TranID,
      amount: tx.amount,
      toAddr: tx.toAddr,
      nonce: tx.nonce
    };

    if (!net) {
      throw new Error(
        errorsCode.WrongRequiredparam + 'net'
      );
    }
    Object.keys(data).forEach(key => {
      if (!data[key]) {
        throw new Error(
          errorsCode.WrongRequiredparam + key
        );
      }
    });

    try {
      txsList = txsList[fields.TRANSACTIONS];
      txsList[from][net].push(data);
    } catch(err) {
      txsList = {};
      txsList[from] = {};
      txsList[from][net] = [];
      txsList[from][net].push(data);
    }

    if (txsList[from][net].length > 5) {
      txsList[from][net].shift();
    }

    await storage.set(
      new BuildObject(fields.TRANSACTIONS, txsList)
    );
  }

}