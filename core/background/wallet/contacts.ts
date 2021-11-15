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
  readonly #core: ZIlPayCore;

  constructor(core: ZIlPayCore) {
    this.#core = core;
  }

  public async addContact(contact: Contact, sendResponse: StreamResponse) {
    try {
      await this.#core.contacts.add(contact);

      sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async removeContact(index: number, sendResponse: StreamResponse) {
    try {
      await this.#core.contacts.rm(index);

      sendResponse({
        resolve: this.#core.state
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }

  public async clear(sendResponse: StreamResponse) {
    try {
      await this.#core.contacts.reset();

      sendResponse({
        resolve: this.#core.contacts.contacts
      });
    } catch (err) {
      sendResponse({
        reject: err.message
      });
    }
  }
}
