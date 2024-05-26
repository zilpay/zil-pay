/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { Contracts } from 'config/contracts';
import { getExtensionURL, Runtime } from 'lib/runtime';
import { RPCMethod } from 'config/methods';
import { httpProvider } from './provider';

export class PhishingDetect {
  #host = String(window.location.host).replace('www.', '');
  #field = 'domains';
  #url = getExtensionURL('phishing.html');
  #checked = false;

  public get checked() {
    return this.#checked;
  }

  public phishing = false;
  public http = '';

  async check() {
    if (!this.http || !this.phishing) {
      return;
    }

    this.#checked = true;

    if (this.#host !== 'zilpay.io' && this.#host.includes('zilpay')) {
      window.location.replace(this.#url);
      return;
    }

    try {
      const params = [
        Contracts.Phishing,
        this.#field,
        [this.#host]
      ];
      const { result } = await httpProvider(
        this.http,
        RPCMethod.GetSmartContractSubState,
        params
      );

      if (result && result[this.#field]) {
        window.location.replace(this.#url);
      }
    } catch {
      //
    }
  }
}
