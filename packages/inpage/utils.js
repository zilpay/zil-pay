/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { CryptoUtils } from './crypto'

const { document } = global
const utils = new CryptoUtils()

/**
 * Get the favicon from current tab.
 */
export function getFavicon() {
  try {
    return document.querySelector('link[rel*=\'icon\']').href
  } catch (err) {
    return null
  }
}

/**
 * Replace from base16 to (base16, beach32).
 */
export function toAccountFormat(address) {
  return {
    base16: utils.toChecksumAddress(address),
    bech32: utils.toBech32Address(address)
  }
}
