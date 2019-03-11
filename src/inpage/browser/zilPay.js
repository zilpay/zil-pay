import { Zilliqa } from '@zilliqa-js/zilliqa'
import * as zilUtils from '@zilliqa-js/util'
import * as core from '@zilliqa-js/core'

var onAddressListing = window.document.createEvent('Event');
onAddressListing.initEvent('addressListing');

export class ZilPay extends Zilliqa {

  constructor(provider) {
    super(provider);
    this.utils = zilUtils;
    this.core = core;
    this.isEnable = false;
    this.isReady = false;
    this.override();
  }

  setDefaultAccount(address) {
    const isAddress = this.utils.validation.isAddress(address);
    
    if (!isAddress) {
      throw new Error('input param is not address type');
    }

    this.wallet.defaultAccount = address;
    dispatchEvent(onAddressListing);
  }

  setProvider(provider) {
    this.provider = new this.core.HTTPProvider(provider);
  }

  async version() {
    let chainId = await this.network.GetNetworkId();
    let msgVerison = 1;
    return this.utils.bytes.pack(chainId, msgVerison);
  }

  override() {
    [
      'addByKeystore',
      'addByMnemonic',
      'addByPrivateKey',
      'create',
      'export',
      'remove',
      'setDefault',
      'sign',
      'signWith'
    ].forEach(method => {
      this.wallet.__proto__[method] = (...args) => {
        throw new Error(`${method} is disable in ZilPay`);
      };
    });
  }

}
