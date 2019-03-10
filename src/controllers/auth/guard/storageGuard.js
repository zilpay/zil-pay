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
  getTxs() {
    return this.get(fields.TRANSACTIONS);
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
  getAllData() {
    return this.getAll();
  }

  // data recording //
  setEncryptedSeed(value) {
    const object = {};
    object[fields.VAULT] = value;
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
  async setTx(data) {
    // TODO: optimize!!!!!!!!!!!!!!!!!!!
    let bookkeeper;
    const object = {};
    const txs = await this.getTxs();

    if (!txs[fields.TRANSACTIONS]) {
      bookkeeper = [];
      bookkeeper.push(data);
      txs[data.from] = bookkeeper;
      object[fields.TRANSACTIONS] = txs;
      return this.set(object);
    } else {
      bookkeeper = txs[fields.TRANSACTIONS][data.from];
      bookkeeper.push(data);
      txs[data.from] = bookkeeper;
      return this.set(txs);
    }
  }
  // data recording //
  
}
