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
  readonly #zilliqa: ZilliqaControl;
  readonly #network: NetworkControl;
  #ssnList: SSN[] = [DEFAULT_SSN];
  #selected = 0;

  public get payload() {
    return {
      selected: this.#selected,
      list: this.#ssnList
    };
  }

  public get ssn() {
    return this.#ssnList[this.#selected];
  }

  constructor(zilliqa: ZilliqaControl, netwrok: NetworkControl) {
    this.#zilliqa = zilliqa;
    this.#network = netwrok;
  }

  public async update() {
    const list = await this.#zilliqa.getSSnList();

    this.#ssnList = list;

    await BrowserStorage.set(
      buildObject(Fields.SSN, this.payload)
    );
  }

  public async select(index: number) {
    assert(TypeOf.isNumber(index), ErrorMessages.IncorrectType);
    assert(index < this.#ssnList.length, ErrorMessages.OutOfIndex);

    this.#selected = index;

    await BrowserStorage.set(
      buildObject(Fields.SSN, this.payload)
    );

    await this.#network.changeConfig({
      ...this.#network.config,
      mainnet: {
        ...this.#network.config.mainnet,
        PROVIDER: this.ssn.api
      }
    });
  }

  public async reset() {
    this.#ssnList = [DEFAULT_SSN];
    this.#selected = 0;

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

      this.#ssnList = list;
      this.#selected = selected;
    } catch(err) {
      await this.reset();
    }
  }

}
