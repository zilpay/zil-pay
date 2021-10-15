/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { StreamResponse } from 'types/stream';
import type { ZIlPayCore } from './core';
import type { Contact } from 'types/contact';

export class ZilPayContacts {
  private readonly _core: ZIlPayCore;

  constructor(core: ZIlPayCore) {
    this._core = core;
  }

  public async addContact(contact: Contact, sendResponse: StreamResponse) {
    try {
      await this._core.contacts.add(contact);

      sendResponse({
        resolve: this._core.contacts.contacts
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public requestConnections(sendResponse: StreamResponse) {
    try {
      sendResponse({
        resolve: this._core.contacts.contacts
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async removeContact(index: number, sendResponse: StreamResponse) {
    try {
      await this._core.contacts.rm(index);

      sendResponse({
        resolve: this._core.contacts.contacts
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async clear(sendResponse: StreamResponse) {
    try {
      await this._core.contacts.reset();

      sendResponse({
        resolve: this._core.contacts.contacts
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }
}
