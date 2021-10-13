/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { SSN } from 'types/ssn';
import type { ZilliqaControl } from './blockchain';
import assert from 'assert';
import { BrowserStorage, buildObject } from 'lib/storage';
import { Fields } from 'config/fields';
import type { NetworkControl } from './network';
import { TypeOf } from 'lib/type/type-checker';
import { NETWORK } from 'config/network';
import { ErrorMessages } from 'config/errors';
import { Contracts } from 'config/contracts';

export const DEFAULT_SSN = {
  address: Contracts.ZERO_ADDRESS,
  api: NETWORK.mainnet.PROVIDER,
  id: 1,
  name: 'Main',
  ok: true,
  time: 420
};
export class SSnController {
  private readonly _zilliqa: ZilliqaControl;
  private readonly _network: NetworkControl;
  private _ssnList: SSN[] = [DEFAULT_SSN];
  private _selected = 0;

  private get payload() {
    return {
      selected: this._selected,
      list: this._ssnList
    };
  }

  public get ssn() {
    return this._ssnList[this._selected];
  }

  constructor(zilliqa: ZilliqaControl, netwrok: NetworkControl) {
    this._zilliqa = zilliqa;
    this._network = netwrok;
  }

  public async update() {
    const list = await this._zilliqa.getSSnList();

    this._ssnList = list;

    await BrowserStorage.set(
      buildObject(Fields.SSN, this.payload)
    );
  }

  public async select(index: number) {
    assert(index < this._ssnList.length, ErrorMessages.OutOfIndex);

    this._selected = index;

    await BrowserStorage.set(
      buildObject(Fields.SSN, this.payload)
    );

    await this._network.changeConfig({
      ...this._network.config,
      mainnet: {
        ...this._network.config.mainnet,
        PROVIDER: this.ssn.api
      }
    });
  }

  public async reset() {
    this._ssnList = [DEFAULT_SSN];
    this._selected = 0;

    await BrowserStorage.set(
      buildObject(Fields.SSN, this.payload)
    );
  }

  public async sync() {
    const content = await BrowserStorage.get(Fields.SSN);

    try {
      const { list, selected } = JSON.parse(String(content));

      assert(
        TypeOf.isArray(list),
        `list ${ErrorMessages.MustBe} Array`
      );
      assert(
        !isNaN(selected),
        `selected ${ErrorMessages.RequiredParam}`
      );

      this._ssnList = list;
      this._selected = selected;
    } catch(err) {
      await this.reset();
    }
  }

}
