/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { Message, ReqBody } from 'lib/streem/message';
import { MTypeTab, MTypeTabContent } from 'lib/streem/stream-keys';
import { TabStream } from 'lib/streem/tab-stream';
import { ContentMessage } from 'lib/streem/secure-message';
import { warpMessage } from 'lib/utils/warp-message';

export class ContentTabStream {
  readonly #stream: TabStream;

  public get stream() {
    return this.#stream;
  }

  constructor() {
    this.#stream = new TabStream(MTypeTabContent.CONTENT);
    this.#stream.listen((msg) => this.#listener(msg));
    this.onSyncAll();
  }

  #listener(msg: ReqBody) {
    if (!msg) return null;

    msg.domain = window.document.domain;

    switch (msg.type) {
      default:
        break;
    }
  }

  async onSyncAll() {
    // Get the some data { address, net, nodeURL }.
    const recipient = MTypeTabContent.INJECTED;

    try {
      const data = await Message.signal(
        MTypeTab.GET_WALLET_DATA
      ).send();
      const wallet = warpMessage(data);

      new ContentMessage({
        type: MTypeTab.GET_WALLET_DATA,
        payload: wallet,
      }).send(this.#stream, recipient);
    } catch (err) {
      console.error(err);
    }
  }
}
