import { Zilliqa } from '@zilliqa-js/zilliqa'
import { RPCMethod } from '@zilliqa-js/core'
import { toChecksumAddress, decodeBase58, fromBech32Address } from '@zilliqa-js/crypto'
import { Long, BN, bytes, validation } from '@zilliqa-js/util'
import { BrowserStorage, BuildObject } from '../../../../lib/storage'
import { NotificationsControl } from '../browser/notifications'
import fields from '../../../../config/fields'
import errorsCode from './errors'

export class ZilliqaControl extends Zilliqa {

  constructor(provider) {
    super(provider);
  }

  async getBalance(address) {
    // Get the balance by address. // 
    let { result } = await this.blockchain.getBalance(
      address.replace('0x', '')
    );
    let nonce = 0;

    if (!result) {
      result = 0;
    } else {
      nonce = result ? result.nonce : 0;
      result = result.balance;
    }

    return { result, nonce };
  }

  async buildTxParams(txData, from, currentNonce, pubKey) {
    const balance = await this.getBalance(from);
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
      version = await this.version();
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

    return this.transactions.new({
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
  }

  async signedTxSend(payload) {
    const tx =  await this.provider.send( // Send to shard node.
      RPCMethod.CreateTransaction, payload
    );
    return tx;
  }

  async singTransaction(txData, seedOrPrivateKey, index, currentNonce) {
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

    const zilTxData = await this.buildTxParams(
      txData,
      this.wallet.defaultAccount.address,
      currentNonce,
      this.wallet.defaultAccount.publicKey
    );
    // Sign transaction by current account. //
    const { txParams } = await this.wallet.sign(zilTxData);
    return await this.signedTxSend(txParams);
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
      index, publicKey, privateKey,
      balance: result,
      address: toChecksumAddress(address)
    };
  }

  async getAccountByPrivateKey(importPrivateKey, index=0) {
    this.wallet.addByPrivateKey(importPrivateKey);

    const account = this.wallet.defaultAccount;
    const { result } = await this.getBalance(account.address);

    account.address = toChecksumAddress(account.address);

    return Object.assign(account, { index, balance: result });
  }

  async addForSingTransaction(payload) {
    /**
     * @method: This method call add to storage some payload data.
     * @param {payload}: It is transaction params "amount, gas, data"...
     */
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

    if (validation.isBase58(payload.toAddr)) {
      payload.toAddr = decodeBase58(payload.toAddr);
    } else if (validation.isBech32(payload.toAddr)) {
      payload.toAddr = fromBech32Address(payload.toAddr);
    }

    payload.toAddr = toChecksumAddress(payload.toAddr);

    try {
      forConfirm = forConfirm[fields.CONFIRM_TX];
      forConfirm.push(payload);
    } catch(err) {
      forConfirm = [payload];
    }

    await storage.set(new BuildObject(fields.CONFIRM_TX, forConfirm));
    this.notificationsCounter(forConfirm);
  }

  async rmForSingTransaction() {
    /**
     * @method: This method remove payload data from storage.
     */
    const storage = new BrowserStorage();
    let forConfirm = await storage.get(fields.CONFIRM_TX);

    forConfirm = forConfirm[fields.CONFIRM_TX];

    const removedConfirm = forConfirm.pop();
    
    await storage.set(new BuildObject(fields.CONFIRM_TX, forConfirm));
    this.notificationsCounter(forConfirm);
    return removedConfirm;
  }

  async addTransactionList(tx, net) {
    /**
     * @method: Add to storage payload data of completed transaction.
     * @param {tx}: Payload data.
     * @param net: It is network wthi which call transaction.
     */
    const storage = new BrowserStorage();
    const from = toChecksumAddress(tx.from);
    let txsList = await storage.get(fields.TRANSACTIONS);
    const data = {
      Info: tx.Info,
      TranID: tx.TranID,
      amount: tx.amount,
      toAddr: toChecksumAddress(tx.toAddr),
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
      if (!txsList[from]) {
        txsList[from] = {};
        txsList[from][net] = [];
      }
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

  async rmAllTransactionList() {
    /**
     * @method: clear all completed transaction from storage.
     */
    const storage = new BrowserStorage();
    await storage.set(
      new BuildObject(fields.TRANSACTIONS, {})
    );
  }

  async notificationsCounter(value) {
    /**
     * @method: Set "BadgeText" for show number of actions.
     * @param value: Number of action.
     */
    let forConfirm;

    if (!value) {
      const storage = new BrowserStorage();
      forConfirm = await storage.get(fields.CONFIRM_TX);
      forConfirm = forConfirm[fields.CONFIRM_TX];
    } else {
      forConfirm = value;
    }

    if (!forConfirm || forConfirm.length == 0) {
      NotificationsControl.counter('');
    } else {
      NotificationsControl.counter(forConfirm.length);
    }    
  }

}
