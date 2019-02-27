import bip39 from 'bip39'
import bip32 from 'bip32'
import { getAddressFromPrivateKey } from '@zilliqa-js/crypto';

export default class {

  generateMnemonic() {
    return bip39.generateMnemonic(128);
  }

  getAccountAtIndex(mnemonic, index = 0) {
    if (index > 10 || index < 0) {
      throw new Error('index only be: 10 < index > 0');
    }

    let seed = bip39.mnemonicToSeed(mnemonic);
    let node = bip32.fromSeed(seed);
    let child = node.derivePath(`m/44'/195'/${ index }'/0/0`);
    let privateKey = child.privateKey.toString('hex');
    let address = getAddressFromPrivateKey(privateKey);
    
    return { privateKey, address };
  }

  validateMnemonic(mnemonic) {
    return bip39.validateMnemonic(mnemonic);
  }
}
