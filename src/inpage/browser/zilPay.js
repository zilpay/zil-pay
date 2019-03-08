import { Zilliqa } from '@zilliqa-js/zilliqa'
import * as zilUtils from '@zilliqa-js/util'
import * as core from '@zilliqa-js/core'

export class ZilPay extends Zilliqa {

  constructor(provider) {
    super(provider);
    this.utils = zilUtils;
    this.core = core;
    this.enable = false;
  }

  setDefaultAccount(address) {
    if (!this.enable) {
      throw new Error('ZilPay is disable');
    }

    let isAddress = this.utils.validation.isAddress(address);
    
    if (!isAddress) {
      throw new Error('input param is not address type');
    }

    this.wallet.defaultAccount = address;
  }

  async version() {
    let chainId = await this.network.GetNetworkId();
    let msgVerison = 1;
    return this.utils.bytes.pack(chainId, msgVerison);
  }

}
