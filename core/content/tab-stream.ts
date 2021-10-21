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
import { httpProvider } from './provider';
import { RPCMethod } from 'config/methods';

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

  async #listener(msg: ReqBody) {
    if (!msg) return null;

    msg.domain = window.document.domain;

    switch (msg.type) {
      case MTypeTab.GET_WALLET_DATA:
        this.onSyncAll();
        break;
      case MTypeTab.ADDRESS_CHANGED:
        new Message(msg).send();
        break;
      case MTypeTab.CONNECT_APP:
        new Message(msg).send();
        break;
      case MTypeTab.CALL_TO_SIGN_TX:
        new Message(msg).send();
        break;
      case MTypeTab.SIGN_MESSAGE:
        new Message(msg).send();
        break;
      case MTypeTab.CONTENT_PROXY_MEHTOD:
        await this.#proxy(msg.payload);
        break
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

  async #proxy(payload: any) {
    const { params, method, uuid } = payload;
    const recipient = MTypeTabContent.INJECTED;
    let result = {};

    try {
      if (!(method in RPCMethod)) {
        throw new Error(`allow only ${RPCMethod}`);
      }

      const data = await Message.signal(
        MTypeTab.GET_WALLET_DATA
      ).send();
      const wallet = warpMessage(data);
      const http = method === RPCMethod.GetTransactionStatus ?
        wallet['nativeHttp'] : wallet['http'];
      // if (!wallet['isEnable']) {
      //   throw new Error('DISABLED');
      // } else if (!wallet['isConnect']) {
      //   throw new Error('CONNECT');
      // }

      result = await httpProvider(
        http,
        method,
        params
      );
    } catch (err) {
      console.error(err);
      result['error'] = err.message || err;
    }

    new ContentMessage({
      type: MTypeTab.CONTENT_PROXY_RESULT,
      payload: {
        ...result,
        uuid
      },
    }).send(this.#stream, recipient);
  }
}
