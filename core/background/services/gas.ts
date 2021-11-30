/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { ZilliqaControl } from 'core/background/services/blockchain';

import assert from 'assert';
import { BrowserStorage, buildObject } from 'lib/storage';
import { Gas } from 'config/gas';
import { Fields } from 'config/fields';
import { toLi } from 'lib/filters/gas-to-fee';
import { ErrorMessages } from 'config/errors';
import { TypeOf } from 'lib/type/type-checker';

export class GasController {
  readonly #zilliqa: ZilliqaControl;
  #gasLimit = Gas.gasLimit;
  #gasPrice = Gas.gasPrice;
  #multiplier = 1;

  public get gasLimit() {
    return this.#gasLimit;
  }

  public get gasPrice() {
    return this.#gasPrice * this.multiplier;
  }

  public get multiplier() {
    return this.#multiplier;
  }

  public get self() {
    return {
      gasLimit: this.gasLimit,
      gasPrice: this.gasPrice,
      multiplier: this.multiplier
    }
  }

  constructor(zilliqa: ZilliqaControl) {
    this.#zilliqa = zilliqa;
  }

  public async setMultiplier(multiplier: number) {
    assert(TypeOf.isNumber(multiplier), ErrorMessages.IncorrectFormat);
    assert(multiplier !== 0, ErrorMessages.CannotBeZero);

    this.#multiplier = multiplier;

    await BrowserStorage.set(
      buildObject(Fields.GAS, this.self)
    );
  }

  public async reset() {
    const min = await this.#zilliqa.getMinimumGasPrice();

    this.#gasPrice = Number(toLi(min));
    this.#multiplier = 1;

    await BrowserStorage.set(
      buildObject(Fields.GAS, this.self)
    );
  }

  public async sync() {
    const gas = await BrowserStorage.get(Fields.GAS);

    try {
      const l = Number(gas['gasLimit']);
      const p = Number(gas['gasPrice']);
      const m = Number(gas['multiplier']);

      assert(Boolean(l), ErrorMessages.RequiredParam);
      assert(Boolean(p), ErrorMessages.RequiredParam);
      assert(Boolean(m), ErrorMessages.RequiredParam);

      this.#gasLimit = l;
      this.#gasPrice = p;
      this.#multiplier = m;
    } catch {
      await BrowserStorage.set(
        buildObject(Fields.GAS, this.self)
      );
    }
  }
}
