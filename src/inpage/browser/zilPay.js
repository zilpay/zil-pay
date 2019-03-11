import { Zilliqa } from '@zilliqa-js/zilliqa'
import * as zilUtils from '@zilliqa-js/util'
import * as core from '@zilliqa-js/core'

export class ZilPay extends Zilliqa {

  constructor(provider) {
    super(provider);
    this.utils = zilUtils;
    this.core = core;
    this.isEnable = false;
    this.isReady = false;
  }

  setDefaultAccount(address) {
    const isAddress = this.utils.validation.isAddress(address);
    
    if (!isAddress) {
      throw new Error('input param is not address type');
    }

    this.wallet.defaultAccount = address;
  }

  setProvider(provider) {
    this.provider = new this.core.HTTPProvider(provider);
  }

  async version() {
    let chainId = await this.network.GetNetworkId();
    let msgVerison = 1;
    return this.utils.bytes.pack(chainId, msgVerison);
  }

}
