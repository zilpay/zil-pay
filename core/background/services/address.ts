/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { BrowserStorage, buildObject } from 'lib/storage';
import { Fields } from 'config/fields';
import { Formats } from 'config/formats';
import assert from 'assert';
import { ErrorMessages } from 'config/errors';

export class AddressController {
  #format: Formats = Formats.Bech32;

  public get format() {
    return this.#format;
  }

  public async setFormat(format: Formats) {
    const formats = Object.values(Formats);
    assert(formats.includes(format), ErrorMessages.IncorrectFormat);
    this.#format = format;

    await BrowserStorage.set(
      buildObject(Fields.FORMAT, this.format)
    );
  }

  public async sync() {
    const content = await BrowserStorage.get(Fields.FORMAT);

    if (!Boolean(content)) {
      await this.reset();

      return;
    }

    this.#format = content as Formats;
  }

  public async reset() {
    this.#format = Formats.Bech32;

    await BrowserStorage.set(
      buildObject(Fields.FORMAT, Formats.Bech32)
    );
  }
}
