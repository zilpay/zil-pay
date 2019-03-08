import bip39 from 'bip39'
import bip32 from 'bip32'
import { getAddressFromPrivateKey } from '@zilliqa-js/crypto';


export default class {

  _bip39 = null;
  _bip32 = null;

  phrase = null;

  constructor() {
    // console.log(bip39.entropyToMnemonic());
  }

  generateMnemonic() {
    return bip39.generateMnemonic(128);
  }

  bip32Node(mnemonic) {
    /**
     * @param mnemonic: Seed phrase.
    */
    this._bip39 = bip39.mnemonicToSeed(mnemonic);
    this._bip32 = bip32.fromSeed(this._bip39);
    this.phrase = mnemonic;
    
    return this._bip32;
  }

  getPrivateKeyAtIndex(index = 0) {
    let child = this._bip32.derivePath(`m/44'/195'/${ index }'/0/0`);
    let privateKey = child.privateKey.toString('hex');

    return { privateKey, index };
  }

  getAccountAtIndex(mnemonic, index = 0) {
    let node = this.bip32Node(mnemonic);
    let child = node.derivePath(`m/44'/195'/${ index }'/0/0`);
    let privateKey = child.privateKey.toString('hex');
    let address = getAddressFromPrivateKey(privateKey);
    
    return { privateKey, address };
  }

  validateMnemonic(mnemonic) {
    return bip39.validateMnemonic(mnemonic);
  }
}
