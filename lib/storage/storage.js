import extension from 'extensionizer'

var storage = extension.storage

/**
 * Default class for working with browser Storage.
 * @example
 * import { BrowserStorage } from 'lib/storage'
 * new BrowserStorage().get('KEY')
 */
export class BrowserStorage {

  constructor() {
    try {
      this.EXT_ID = extension.runtime.id
    } catch(err) {
      this.EXT_ID = ''
    }
  }

  set(value) {
    return new Promise(resolve => {
      if (value.length) {
        for (const key in value) {
          storage.local.set(key, resolve)
        }
      } else {
        storage.local.set(value, resolve)
      }
    })
  }

  get(keys) {
    return new Promise(resolve => {
      storage.local.get(keys, resolve)
    })
  }

  getAll() {
    return new Promise(resolve => {
      storage.local.get(null, items => {
        resolve(items)
      })
    })
  }

  rm(key) {
    return new Promise(resolve => {
      storage.local.remove(key, resolve)
    })
  }

  clear() {
    return storage.StorageArea.clear()
  }

}
