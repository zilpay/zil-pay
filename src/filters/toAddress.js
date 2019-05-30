import {
  toBech32Address,
  toChecksumAddress,
  encodeBase58
} from '@zilliqa-js/crypto'


function trim(string, length=6) {
  let part0 = string.substr(0, length)
  let part1 = string.substr(length * -1);

  return `${part0}...${part1}`;
}

export default function (hex, format, isTrim=true) {
  let address;

  try {
    if (format === 'Base16') {
      address = toChecksumAddress(hex);
    } else if (format === 'Base58') {
      address = encodeBase58(hex);
    } else if (format === 'Bech32') {
      address = toBech32Address(hex);
    }
  } catch(err) {
    return null;
  }

  if (isTrim) {
    address = trim(address);
  }

  return address;
}
