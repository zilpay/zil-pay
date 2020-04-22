/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { toBech32Address } from '@zilliqa-js/crypto/dist/bech32'
import { toChecksumAddress } from '@zilliqa-js/crypto/dist/util'

import { validation } from '@zilliqa-js/util/dist/index'


const { document, window } = global

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
  const isAddress = validation.isAddress(address)

  if (!isAddress) {
    throw new Error('input param is not address type')
  }

  return {
    base16: toChecksumAddress(address),
    bech32: toBech32Address(address)
  }
}
