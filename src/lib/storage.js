import extension from 'extensionizer'

var storage = extension.storage;

if (process.env.NODE_ENV === 'test') {
  storage.local = {
    get(inputKeys, callback) {
      let data = {};
      try {
        inputKeys.forEach(key => {
          data[key] = global.storage[key];
        });
      } catch(err) {
        data[inputKeys] = global.storage[inputKeys];
      }
      callback(data);
    },    
    set(value, callback) {
      global.storage = Object.assign(global.storage, value);
      callback(global.storage);
    }
  };
}


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
      if (value.length) {
        value.forEach(val => {
          storage.local.set(val, resolve);
        });
      } else {
        storage.local.set(value, resolve);
      }
    });
  }

  get(keys) {
    return new Promise(resolve => {
      storage.local.get(keys, resolve);
    });
  }

  getAll() {
    return new Promise(resolve => {
      storage.local.get(null, items => {
        resolve(items);
      });
    });
  }

  rm(key) {
    return new Promise(resolve => {
      storage.local.remove(key, resolve);
    });
  }

  clear() {
    return storage.StorageArea.clear();
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