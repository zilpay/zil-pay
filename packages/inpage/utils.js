import {
  toBech32Address,
  toChecksumAddress
} from '@zilliqa-js/crypto'
import { validation } from '@zilliqa-js/util'

/**
 * Get the favicon from current tab.
 */
export function getFavicon() {
  let favicon = undefined
  let nodeList = document.getElementsByTagName('link')
  
  for (let i = 0; i < nodeList.length; i++) {
    if((nodeList[i].getAttribute('rel') == 'icon') || (nodeList[i].getAttribute('rel') == 'shortcut icon')) {
      favicon = nodeList[i].getAttribute('href')
    }
  }

  if (!favicon) {
    return null
  } else if (!favicon.includes(window.document.domain)) {
    if (favicon[0] !== '/') {
      favicon = window.location.origin + '/' + favicon
    } else {
      favicon = window.location.origin + favicon
    }
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