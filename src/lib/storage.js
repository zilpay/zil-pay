import extension from 'extensionizer'


export class BrowserStorage {

  constructor() {
    this.EXT_ID = extension.runtime.id;
  }

  set(value) {
    return new Promise(resolve => {
      extension.storage.local.set(value, resolve);
    });
  }

  get(keys) {
    return new Promise(resolve => {
      extension.storage.local.get(keys, resolve);
    });
  }

  getAll() {
    return new Promise(resolve => {
      extension.storage.local.get(null, items => {
        resolve(items);
      });
    });
  }

  rm(key) {
    return new Promise(resolve => {
      extension.storage.local.remove(key, resolve);
    });
  }

  clear() {
    return new Promise(extension.storage.StorageArea.clear);
  }

}