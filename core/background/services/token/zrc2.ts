/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { ZRC2Token } from 'types/token';
import type { ZilliqaControl } from 'core/background/services/blockchain';
import type { NetworkControl } from 'core/background/services/network';
import assert from 'assert';
import { Contracts } from 'config/contracts';
import { BrowserStorage, buildObject } from 'lib/storage';
import { Fields } from 'config/fields';
import { TypeOf } from 'lib/type/type-checker';
import { NETWORK } from 'config/network';
import { ErrorMessages } from 'config/errors';

const [mainnet, testnet, custom] = Object.keys(NETWORK);

const ZIL = {
  base16: Contracts.ZERO_ADDRESS,
  bech32: 'zil1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq9yf6pz',
  decimals: 12,
  name: 'Zilliqa',
  symbol: 'ZIL'
}
const ZLP = {
  base16: Contracts.ZIlPay,
  bech32: 'zil1l0g8u6f9g0fsvjuu74ctyla2hltefrdyt7k5f4',
  decimals: 18,
  name: 'ZilPay wallet',
  symbol: 'ZLP'
};
const INIT = {
  [mainnet]: [ZIL, ZLP],
  [testnet]: [ZIL],
  [custom]: [ZIL]
}

export class ZRC2Controller {
  private readonly _netwrok: NetworkControl;
  private readonly _zilliqa: ZilliqaControl;
  private _identities: ZRC2Token[] = [];

  public get identities() {
    return this._identities;
  }
  public get field() {
    return `${Fields.TOKENS}/${this._netwrok.selected}`;
  }

  constructor(netwrok: NetworkControl, zilliqa: ZilliqaControl) {
    this._netwrok = netwrok;
    this._zilliqa = zilliqa;
  }

  public async getToken(address: string) {
  }

  public async sync() {
    const jsonList = await BrowserStorage.get(this.field);

    try {
      const list = JSON.parse(String(jsonList));

      if (!list || !TypeOf.isArray(list)) {
        return this.reset();
      }

      this._identities = list;
    } catch {
      await this.reset();
    }
  }

  public async reset() {
    const init = INIT[this._netwrok.selected];
    this._identities = init;
    await BrowserStorage.set(
      buildObject(this.field, this.identities)
    );
  }

  private _isUnique(token: ZRC2Token) {
    for (let index = 0; index < this._identities.length; index++) {
      const element = this._identities[index];
      assert(element.base16 !== token.base16, ErrorMessages.MustBeUnique);
      assert(element.bech32 !== token.bech32, ErrorMessages.MustBeUnique);
      assert(element.name !== token.name, ErrorMessages.MustBeUnique);
    }
  }
}
