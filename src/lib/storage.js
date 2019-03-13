export class BrowserStorage {

  constructor() {
    this.EXT_ID = window.chrome.runtime.id;
  }

  set(value) {
    return new Promise(resolve => {
      window.chrome.storage.local.set(value, resolve);
    });
  }

  get(keys) {
    return new Promise(resolve => {
      window.chrome.storage.local.get(keys, resolve);
    });
  }

  getAll() {
    return new Promise(resolve => {
      window.chrome.storage.local.get(null, items => {
        resolve(items);
      });
    });
  }

  rm(key) {
    return new Promise(resolve => {
      window.chrome.storage.local.remove(key, resolve);
    });
  }

  clear() {
    return new Promise(StorageArea.clear);
  }

}