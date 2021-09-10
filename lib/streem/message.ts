/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */

import { Runtime } from 'lib/runtime';

export interface ReqBody {
  type: string;
  payload?: object;
  domain?: string;
  from?: string;
}

const { window } = globalThis;

/**
 * Message class can send payload or make signal message.
 * @example
 * import { Message } from 'lib/stream/message'
 * const msg = { type: '@example/type', payload: { test: 1} }
 * const message = new Message(msg)
 * message.send().then(() => / Do something... /)
 * or
 * Message.signal('@example/type').send().then(() => / Do something... /)
 */
 export class Message {
  /**
   * Make just signal message.
   */
  public static signal(type: string): Message {
    return new Message({
      type,
      domain: window.document.domain
    });
  }

  protected readonly _body: ReqBody;

  /**
   * Recieve msg object.
   * @param {Object} msg - Message for send.
   */
  constructor(msg: ReqBody) {
    this._body = msg;
  }

  /**
   * Send MessageSelf object.
   */
  public send() {
    return new Promise((resolve) => {
      try {
        Runtime
          .runtime
          .sendMessage(this._body, resolve);
      } catch (err) {
        console.error(this, err);
        window.location.reload();
      }
    })
  }
}