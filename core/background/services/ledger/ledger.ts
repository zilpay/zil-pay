/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type Transport from '@ledgerhq/hw-transport';

import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import assert from 'assert';

import { ErrorMessages } from 'config/errors';
import { LedgerInterface } from './interface';
import { LedgerU2F } from './ledger-u2f';
import { LEDGER_USB_VENDOR_ID, LEDGER_PRODUCT_ID_U2F } from 'config/ledger';

export class LedgerWebHID {
  #transport?: Transport;
  #interface?: LedgerInterface | LedgerU2F;

  public get interface() {
    return this.#interface;
  }

  public async isSupported() {
    const isHid = await TransportWebHID.isSupported();
    assert(isHid, ErrorMessages.WebHidNotSupported);
  }

  public async getHidTransport(productId: number) {
    await this.isSupported();

    let devices = [];
    devices = await window.navigator.hid.getDevices({
      filters: [{
        productId,
        vendorId: LEDGER_USB_VENDOR_ID
      }]
    });
    const [device] = devices.filter((d) => d.productId === productId);

    assert(Boolean(device), ErrorMessages.NoFoundDeviced);

    if (this.#transport) {
      await this.#transport.close();
    }

    this.#transport = await TransportWebHID.open(device);;

    return this.#transport;
  }

  public async init(productId: number) {
    if (productId === LEDGER_PRODUCT_ID_U2F) {
      if (!(this.#interface instanceof LedgerU2F)) {
        this.#interface = new LedgerU2F();
        await this.#interface.init();
      }
    } else {
      await this.getHidTransport(productId);
      this.#interface = new LedgerInterface(this.#transport);
    }

    return this.#interface;
  }
}
