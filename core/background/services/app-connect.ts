/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { AppConnect } from 'types/app-connect';
import assert from 'assert';
import { ErrorMessages } from 'config/errors';
import { BrowserStorage, buildObject } from 'lib/storage';
import { Fields } from 'config/fields';

export class AppConnectController {
  private _identities: AppConnect[] = [];

  public get connections() {
    return this._identities;
  }

  private _isUnique(connect: AppConnect) {
    for (const iterator of this.connections) {
      assert(
        iterator.domain.toLowerCase() !== connect.domain.toLowerCase(),
        ErrorMessages.MustBeUnique
      );
    }
  }

  public async add(connect: AppConnect) {
    this._isUnique(connect);

    this._identities.push(connect);

    await BrowserStorage.set(
      buildObject(Fields.CONNECT_LIST, this.connections)
    );
  }

  public async rm(index: number) {
    delete this._identities[index];

    await BrowserStorage.set(
      buildObject(Fields.CONNECT_LIST, this.connections)
    );
  }

  public async reset() {
    this._identities = [];

    await BrowserStorage.set(
      buildObject(Fields.CONNECT_LIST, this.connections)
    );
  }

  public async sync() {
    const jsonData = await BrowserStorage.get(Fields.CONNECT_LIST);

    try {
      this._identities = JSON.parse(String(jsonData));
    } catch {
      await this.reset();
    }
  }

}
