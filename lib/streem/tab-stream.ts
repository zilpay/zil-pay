/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */

import type { ReqBody } from './message';
import { MTypeTabContent } from './stream-keys';

/**
 * Used for communication between a web page and an extension's content script.
 */
 export class TabStream {

  private readonly _eventName: string;

  /**
   * Creates a new TabStream.
   * @param {String} eventName - Event type.
   */
  constructor(eventName: string) {
    this._eventName = eventName
  }

  /**
   * Message listener that returns decrypted messages when synced
   */
  public listen(cb: (payload: object) => void) {
    document.addEventListener(this._eventName, (event) => {
      const detail = event['detail'];

      if (detail) {
        cb(JSON.parse(detail));
      }
    });
  }

  /**
   * Message sender which encrypts messages and adds the sender.
   * @param data - The payload to send.
   * @param to - The stream to send messages to.
   */
  public send(data: ReqBody, to: string) {
    data.from = this._eventName;

    if (to in MTypeTabContent) {
      this._dispatch(JSON.stringify(data), to);
    }
  }

  private _dispatch(data: string, to: string) {
    document.dispatchEvent(this._getEvent(data, to));
  }

  /**
   * Helper methods for building and sending events.
   */
  private _getEventInit(detail: string) {
    return {
      detail
    };
  }

  /**
 * No modifly data
 * @param encryptedData - No modifly data
 * @param to - Event name.
 */
 private _getEvent(detail: string, to: string) {
    return new CustomEvent(to, this._getEventInit(detail));
  }
}
