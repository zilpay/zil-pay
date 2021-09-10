/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { IPFS_LIST } from 'config/ipfs-list';
import { Fields } from 'config/fields';
import { BrowserStorage, buildObject } from 'lib/storage';
import { TypeOf } from 'lib/type/type-checker';

export class IPFS {
  private _selected: number;

  public get ipfs() {
    return IPFS_LIST[this._selected];
  }

  public get selected() {
    return this._selected;
  }

  public async set(index: number) {
    if (index > IPFS_LIST.length) {
      throw new Error('out of index');
    }
    this._selected = index;
    await BrowserStorage.set(
      buildObject(Fields.SELECTED_IPFS, String(this._selected))
    );
  }

  public async sync() {
    const selected = Number(await BrowserStorage.get(Fields.SELECTED_IPFS));

    if (!TypeOf.isNumber(selected) || !IPFS_LIST[selected]) {
      this._selected = 0;

      await BrowserStorage.set(
        buildObject(Fields.SELECTED_IPFS, String(this._selected))
      );
    } else {
      this._selected = selected;
    }
  }

  public async reset() {
    this._selected = 0;
    await BrowserStorage.set(
      buildObject(Fields.SELECTED_IPFS, String(this._selected))
    );
  }
}
