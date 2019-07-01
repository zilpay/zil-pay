import {
  encodeBase58,
  toBech32Address,
  toChecksumAddress
} from '@zilliqa-js/crypto'
import { validation } from '@zilliqa-js/util'


export function getFavicon() {
  let favicon = undefined;
  let nodeList = document.getElementsByTagName('link');
  
  for (let i = 0; i < nodeList.length; i++) {
    if((nodeList[i].getAttribute('rel') == 'icon') || (nodeList[i].getAttribute('rel') == 'shortcut icon')) {
      favicon = nodeList[i].getAttribute('href');
    }
  }

  if (!favicon.includes(window.document.domain)) {
    if (favicon[0] !== '/') {
      favicon = window.location.origin + '/' + favicon;
    } else {
      favicon = window.location.origin + favicon;
    }
  }
  return favicon;        
}

export function toAccountFormat(address) {
  const isAddress = validation.isAddress(address);

  if (!isAddress) {
    throw new Error('input param is not address type');
  }

  return {
    base16: toChecksumAddress(address),
    base58: encodeBase58(address),
    bech32: toBech32Address(address)
  };
}