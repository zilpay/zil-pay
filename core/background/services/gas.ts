/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { ZilliqaControl } from 'core/background/services/blockchain';

import { BrowserStorage, buildObject } from 'lib/storage';
import { Gas } from 'config/gas';
import { Fields } from 'config/fields';
import { toLi } from 'lib/filters/gas-to-fee';

export class GasController {
  readonly #zilliqa: ZilliqaControl;
  #gasLimit = Gas.gasLimit;
  #gasPrice = Gas.gasPrice;

  public get gasLimit() {
    return this.#gasLimit;
  }

  public get gasPrice() {
    return this.#gasPrice;
  }

  public get self() {
    return {
      gasLimit: this.gasLimit,
      gasPrice: this.gasPrice
    }
  }

  constructor(zilliqa: ZilliqaControl) {
    this.#zilliqa = zilliqa;
  }

  public async reset() {
    const min = await this.#zilliqa.getMinimumGasPrice();

    this.#gasPrice = Number(toLi(min));

    await BrowserStorage.set(
      buildObject(Fields.GAS, this.self)
    );
  }

  public async sync() {
    const gas = await BrowserStorage.get(Fields.GAS);

    if (gas) {
      this.#gasLimit = Number(gas['gasLimit']);
      this.#gasPrice = Number(gas['gasPrice']);
    } else {
      await BrowserStorage.set(
        buildObject(Fields.GAS, this.self)
      );
    }
  }
}
