/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { FIELDS } from 'config'
import { Wallet, Transaction } from './controllers'

const walletControl = new Wallet()
/**
 * Store Handler call when window.chrome.storage.local has been changed.
 * @param {Object} store - Changed store
 * @interface { [key]: newValue, oldValue }
 */
export function browserStorageHandler(store) {
  const keys = Object.keys(store)

  for (let index = 0; index < keys.length; index++) {
    const key = keys[index]
    const value = store[key]

    switch (key) {
    case FIELDS.WALLET:
      walletControl.changeWallet(value.newValue)
      new Transaction().checkAllTransaction()
      break
    case FIELDS.SELECTED_NET:
      // networkControl.changeNetwork(value.newValue)
      new Transaction().checkAllTransaction()
      break
    default:
      break
    }
  }
}
