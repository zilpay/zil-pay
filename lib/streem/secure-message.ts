/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */

import type { ReqBody } from './message';
import type { TabStream } from './tab-stream';

/**
 * Can send encrypted msg.
 */
 export class ContentMessage {
  private readonly _body: ReqBody;

  constructor(msg: ReqBody) {
    this._body = msg;
  }

  /**
   * Method for send message.
   */
  public sendTabStream(stream: TabStream, recipient: string) {
    const seralized = JSON.stringify(this._body);
    const deserialized = JSON.parse(seralized);

    stream.send(deserialized, recipient);
  }

}
