/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { FIELDS } from '../../config'

/**
 * Store Handler call when window.chrome.storage.local has been changed.
 * @param {Object} store - Changed store
 * @interface { [key]: newValue, oldValue }
 */
export function browserStorageHandler(store) {
  for (const keyStore in store) {
    if (!(keyStore in FIELDS)) {
      return null
    }

    const { newValue, oldValue } = store[keyStore]

    console.log(newValue, oldValue)
  }
}
