/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */

import { MTypeTab, MTypeTabContent } from "lib/streem/stream-keys";
import { TabStream } from "lib/streem/tab-stream";
import { Subject } from 'lib/streem/subject';
import { ContentMessage } from 'lib/streem/secure-message';

export class Handler {
  public readonly stream = new TabStream(MTypeTabContent.INJECTED);
  public readonly subject = new Subject();

  constructor() {
    this.stream.listen((msg) => {
      this.subject.emit(msg);
    });
  }

  public initialized() {
    const type = MTypeTab.GET_WALLET_DATA;
    const recipient = MTypeTabContent.CONTENT;

    new ContentMessage({
      type,
      payload: {}
    }).send(this.stream, recipient);
  }
}
