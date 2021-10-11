/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { Contact } from 'types/contact';
import assert from 'assert';
import { ErrorMessages } from 'config/errors';
import { BrowserStorage, buildObject } from 'lib/storage';
import { Fields } from 'config/fields';

export class ContactController {
  private _identities: Contact[] = [];

  public get contacts() {
    return this._identities;
  }

  private _isUnique(connect: Contact) {
    for (const iterator of this.contacts) {
      assert(
        iterator.name.toLowerCase() !== connect.name.toLowerCase(),
        `name ${ErrorMessages.MustBeUnique}`
      );
      assert(
        iterator.address.toLowerCase() !== connect.address.toLowerCase(),
        `address ${ErrorMessages.MustBeUnique}`
      );
    }
  }

  public async add(connect: Contact) {
    this._isUnique(connect);

    this._identities.push(connect);

    await BrowserStorage.set(
      buildObject(Fields.CONTACTS, this.contacts)
    );
  }

  public async rm(index: number) {
    delete this._identities[index];

    await BrowserStorage.set(
      buildObject(Fields.CONTACTS, this.contacts)
    );
  }

  public async reset() {
    this._identities = [];

    await BrowserStorage.set(
      buildObject(Fields.CONTACTS, this.contacts)
    );
  }

  public async sync() {
    const jsonData = await BrowserStorage.get(Fields.CONTACTS);

    try {
      this._identities = JSON.parse(String(jsonData));
    } catch {
      await this.reset();
    }
  }

}
