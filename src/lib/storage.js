import extension from 'extensionizer'


export class BrowserStorage {

  constructor() {
    try {
      this.EXT_ID = extension.runtime.id;
    } catch(err) {
      this.EXT_ID = '';
    }
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
    return extension.storage.StorageArea.clear();
  }

}

export class BuildObject {

  constructor(key, value) {
    if (typeof key !== 'string') {
      throw new Error('key most be string');
    }

    this[key] = value;
  }
}