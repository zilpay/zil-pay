import { BrowserStorage } from '../../../lib/storage'
import fields from '../../../config/fields'


export class StorageGuard extends BrowserStorage {
  
  constructor() {
    super();
  }

  async getEncryptedSeed() {
    const vault = await this.get(fields.VAULT);
    const keys = Object.keys(vault);
    
    if (keys.length < 1) {
      return null;
    } else {
      return vault[keys[0]];
    }
  }
  async getTxs() {
    const txs = await this.get(fields.TRANSACTIONS);

    if (!txs) {
      return {};
    } else if (txs[fields.TRANSACTIONS]) {
      return txs[fields.TRANSACTIONS];
    } else {
      return txs;
    }
  }
  getConfig() {
    return this.get(fields.CONFIG);
  }
  getWallet() {
    return this.get(fields.WALLET);
  }
  getNet() {
    return this.get(fields.SELECTED_NET);
  }
  getConfirm() {
    return this.get(fields.CONFIRM_TX);
  }
  getAllData() {
    return this.getAll();
  }

  // data recording //
  setEncryptedSeed(value) {
    const object = {};
    object[fields.VAULT] = value;
    return this.set(object);
  }
  setImportedVault(value) {
    let object = {};
    object[fields.VAULT_IMPORTED] = value;
    return this.set(object);
  }
  setConfig(value) {
    const object = {};
    object[fields.CONFIG] = value;
    return this.set(object);
  }
  setWallet(value) {
    const object = {};
    object[fields.WALLET] = value;
    return this.set(object);
  }
  setNet(value) {
    const object = {};
    object[fields.SELECTED_NET] = value;
    return this.set(object);
  }
  async setTx(data, net) {
    let txs = await this.getTxs();
    const { from } = data;

    if (!txs[from]) {
      txs[from] = {};
      txs[from][net] = [];
    }
    if (txs[from][net].length > 5) {
      txs[from][net].shift();
    }
    if (!data.Info || !data.TranID || !data.toAddr) {
      return null;
    }

    txs[from][net].push({
      Info: data.Info,
      TranID: data.TranID,
      amount: data.amount,
      toAddr: data.toAddr
    });

    let object = {};
    object[fields.TRANSACTIONS] = txs;
    
    this.set(object);
  }
  async setConfirm(value) {
    const object = {};
    const confirmTxs = await this.getConfirm();
      
    if (Object.keys(confirmTxs).length < 1) {
      object[fields.CONFIRM_TX] = [value];
      return this.set(object);
    } else if (value.length >= 0) {
      object[fields.CONFIRM_TX] = value;
      return this.set(object);
    } else {
      confirmTxs[fields.CONFIRM_TX].push(value);
      return this.set(confirmTxs);
    }

  }
  // data recording //
  
}
