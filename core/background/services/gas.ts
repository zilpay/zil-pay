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
  private readonly _zilliqa: ZilliqaControl;
  private _gasLimit = Gas.gasLimit;
  private _gasPrice = Gas.gasPrice;

  public get gasLimit() {
    return this._gasLimit;
  }

  public get gasPrice() {
    return this._gasPrice;
  }

  public get self() {
    return {
      gasLimit: this.gasLimit,
      gasPrice: this.gasPrice
    }
  }

  constructor(zilliqa: ZilliqaControl) {
    this._zilliqa = zilliqa;
  }

  public async reset() {
    const min = await this._zilliqa.getMinimumGasPrice();

    this._gasPrice = Number(toLi(min));

    await BrowserStorage.set(
      buildObject(Fields.GAS, this.self)
    );
  }

  public async sync() {
    const gas = await BrowserStorage.get(Fields.GAS);

    if (gas) {
      this._gasLimit = Number(gas['gasLimit']);
      this._gasPrice = Number(gas['gasPrice']);
    } else {
      await BrowserStorage.set(
        buildObject(Fields.GAS, this.self)
      );
    }
  }
}
