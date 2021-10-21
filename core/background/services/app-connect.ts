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
import { NotificationsControl } from './notifications';

export class AppConnectController {
  #identities: AppConnect[] = [];
  #confirm?: AppConnect;

  public get connections() {
    return this.#identities;
  }

  public get confirmApp() {
    return this.#confirm;
  }

  #isUnique(connect: AppConnect) {
    for (const iterator of this.connections) {
      assert(
        iterator.domain.toLowerCase() !== connect.domain.toLowerCase(),
        ErrorMessages.MustBeUnique
      );
    }
  }

  public isConnected(domain: string) {
    return this.#identities.some((a) => a.domain === domain);
  }

  public async add(connect: AppConnect) {
    this.#isUnique(connect);

    this.#identities.push(connect);

    await BrowserStorage.set(
      buildObject(Fields.CONNECT_LIST, this.connections)
    );

    this.#confirm = undefined;
  }

  public async addConfirm(connect: AppConnect) {
    this.#confirm = connect;

    NotificationsControl.counter(1);
    await BrowserStorage.set(
      buildObject(Fields.CONNECT_DAPP, this.confirmApp)
    );
  }

  public async rejectConfirm() {
    this.#confirm = undefined;

    NotificationsControl.counter(0);
    await BrowserStorage.rm(Fields.CONNECT_DAPP);
  }

  public async rm(index: number) {
    delete this.#identities[index];

    this.#identities = this.#identities.filter(Boolean);

    await BrowserStorage.set(
      buildObject(Fields.CONNECT_LIST, this.connections)
    );
  }

  public async reset() {
    this.#identities = [];

    await BrowserStorage.set(
      buildObject(Fields.CONNECT_LIST, this.connections)
    );
  }

  public async sync() {
    const jsonData = await BrowserStorage.get(Fields.CONNECT_LIST);
    const confirm = await BrowserStorage.get(Fields.CONNECT_DAPP);

    try {
      if (confirm) {
        this.#confirm = JSON.parse(String(confirm));

        if (Object.keys(this.#confirm).length > 0) {
          NotificationsControl.counter(1);
        }
      }
    } catch {
      ///
    }

    try {
      this.#identities = JSON.parse(String(jsonData));
    } catch {
      await this.reset();
    }
  }

}
