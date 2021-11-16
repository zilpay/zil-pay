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
import { LEDGER_USB_VENDOR_ID } from 'config/ledger';

export class LedgerWebHID {
  #transport?: Transport;
  #interface?: LedgerInterface;

  public get interface() {
    return this.#interface;
  }

  public async isSupported() {
    const isHid = await TransportWebHID.isSupported();
    assert(isHid, ErrorMessages.WebHidNotSupported);
  }

  public async getHidTransport() {
    await this.isSupported();

    let devices = [];
    devices = await window.navigator.hid.getDevices({
      filters: [{ vendorId: LEDGER_USB_VENDOR_ID }]
    });
    if (devices.length === 0) {
      devices = await window.navigator.hid.requestDevice({
        filters: [{ vendorId: LEDGER_USB_VENDOR_ID }]
      });
    }
    const userApprovedWebHidConnection = devices.some(
      (device) => device.vendorId === Number(LEDGER_USB_VENDOR_ID),
    );

    assert(userApprovedWebHidConnection, ErrorMessages.NoFoundDeviced);

    if (this.#transport) {
      return this.#transport;
    }
    
    this.#transport = await TransportWebHID.create();

    return this.#transport;
  }

  public async init() {
    await this.getHidTransport();

    this.#interface = new LedgerInterface(this.#transport);

    return this.#interface;
  }
}
