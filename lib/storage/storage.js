/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import extension from 'extensionizer'
import { TypeChecker } from 'lib/type'

const { Promise } = global

let storage = extension.storage

/**
 * Default class for working with browser Storage.
 * @example
 * import { BrowserStorage } from 'lib/storage'
 * new BrowserStorage().get('KEY')
 */
export class BrowserStorage {

  /**
   * Create subscribe
   * @param {Function} cb - A callback function.
   * @returns {Object} unsubscribe method for removeListener.
   * @example
   * import { BrowserStorage } from 'lib/storage'
   * BrowserStorage
   *   .subscribe(store => / Do something... /)
   *   .unsubscribe()
   */
  static subscribe(cb) {
    storage
      .onChanged
      .addListener(cb)

    return {
      unsubscribe() {
        storage
          .onChanged
          .removeListener()
      }
    }
  }

  constructor() {
    try {
      // User extension id.
      this.EXT_ID = extension.runtime.id
    } catch (err) {
      this.EXT_ID = ''
    }
  }

  /**
   * Set value by someting key.
   * @param {Object, String, Number, Array} value - Any value for set storage.
   * @returns {Promise<null | undefined>}
   * @example
   * import { BrowserStorage, BuildObject } from 'lib/storage'
   * const storage = new BrowserStorage()
   * storage.set(
   *   new BuildObject('example-key', { example: 'set method'})
   * ).then(/ Do something... /)
   * // OR
   * storage.set([
   *   new BuildObject('key-1', new Object()),
   *   new BuildObject('key-2', new Object())
   *   //...
   * ]).then(/ Do something... /)
   */
  set(value) {
    return new Promise(resolve => {
      if (new TypeChecker(value).isArray) {
        for (let index = 0; index < value.length; index++) {
          const element = value[index]

          if (index === value.length - 1) {
            storage.local.set(element, resolve)
          } else {
            storage.local.set(element, () => null)
          }
        }
      } else {
        storage.local.set(value, resolve)
      }
    })
  }

  /**
   * Get value from storage by keys.
   * @param {String, Number} keys - key or keys.
   * @returns {Promise<Object | Array | String | Number>}
   * @example
   * import { BrowserStorage } from 'lib/storage'
   * const storage = new BrowserStorage()
   * storage.get(key).then(recievePaylod => / Do something... /)
   */
  get(keys) {
    return new Promise(resolve => {
      if (new TypeChecker(keys).isArray) {
        storage.local.get(keys, resolve)
      } else {
        storage.local.get(keys, res => resolve(res[keys]))
      }
    })
  }

  /**
   * @returns {Object} - return all storage data values.
   * @example
   * import { BrowserStorage } from 'lib/storage'
   * const storage = new BrowserStorage()
   * storage.getAll(key).then(fullStorageObject => / Do something... /)
   */
  getAll() {
    return new Promise(resolve => {
      storage.local.get(null, items => {
        resolve(items)
      })
    })
  }

  /**
   * Remove one item from storage.
   * @param {String, Number} keys - key or keys.
   * @returns {Promise<null | undefined>}
   * @example
   * import { BrowserStorage } from 'lib/storage'
   * const storage = new BrowserStorage()
   * storage.rm('any-key-item').then(() => / Do something... /)
   */
  rm(keys) {
    return new Promise(resolve => {
      storage.local.remove(keys, resolve)
    })
  }

  /**
   * Clear all storage data.
   * @returns {Promise<null | undefined>}
   * @example
   * import { BrowserStorage } from 'lib/storage'
   * const storage = new BrowserStorage()
   * storage.clear().then(() => / Do something... /)
   */
  clear() {
    return new Promise(resolve => {
      storage.local.clear(resolve)
    })
  }

}
