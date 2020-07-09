/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { CryptoUtils } from './crypto'

const { document, window } = global
const utils = new CryptoUtils()

/**
 * Get the favicon from current tab.
 */
export function getFavicon() {
  const needAttribute = 'href'
  let favicon = null
  let nodeList = document.getElementsByTagName('link')

  for (let i = 0; i < nodeList.length; i++) {
    switch (nodeList[i].getAttribute('rel')) {
    case 'icon':
      favicon = nodeList[i].getAttribute(needAttribute)
      break
    case 'fluid-icon':
      favicon = nodeList[i].getAttribute(needAttribute)
      break
    case 'shortcut icon':
      favicon = nodeList[i].getAttribute(needAttribute)
      break
    default:
      break
    }
  }

  if (!favicon) {
    return null
  } else if (favicon[0] === '/') {
    favicon = window.location.origin + favicon
  }

  return favicon
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
