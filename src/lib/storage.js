const browserDetect = window.browser || window.chrome;

export class BrowserStorage {

  constructor() {
    this.EXT_ID = browserDetect.runtime.id;
  }

  set(value) {
    return new Promise(resolve => {
      browserDetect.storage.local.set(value, resolve);
    });
  }

  get(keys) {
    return new Promise(resolve => {
      browserDetect.storage.local.get(keys, resolve);
    });
  }

  getAll() {
    return new Promise(resolve => {
      browserDetect.storage.local.get(null, items => {
        resolve(items);
      });
    });
  }

  rm(key) {
    return new Promise(resolve => {
      browserDetect.storage.local.remove(key, resolve);
    });
  }

  clear() {
    return new Promise(StorageArea.clear);
  }

}