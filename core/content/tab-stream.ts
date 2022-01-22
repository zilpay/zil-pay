/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { ProxyContentType } from 'types/stream';

import { Message, ReqBody } from 'lib/streem/message';
import { MTypeTab, MTypeTabContent } from 'lib/streem/stream-keys';
import { TabStream } from 'lib/streem/tab-stream';
import { ContentMessage } from 'lib/streem/secure-message';
import { warpMessage } from 'lib/utils/warp-message';
import { httpProvider } from './provider';
import { RPCMethod } from 'config/methods';
import { ErrorMessages } from 'config/errors';
import { PhishingDetect } from './phishing-detect';

export class ContentTabStream {
  readonly #stream: TabStream;

  #phishing = new PhishingDetect();

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
        await this.onSyncAll();
        break;
      case MTypeTab.ADDRESS_CHANGED:
        await new Message(msg).send();
        break;
      case MTypeTab.CONNECT_APP:
        await new Message(msg).send();
        break;
      case MTypeTab.CALL_TO_SIGN_TX:
        await new Message(msg).send();
        break;
      case MTypeTab.SIGN_MESSAGE:
        await new Message(msg).send();
        break;
      case MTypeTab.CONTENT_PROXY_MEHTOD:
        await this.#proxy(msg.payload);
        break;
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

      this.#phishing.phishing = wallet.phishing;
      this.#phishing.http = wallet.http;

      if (wallet) {
        new ContentMessage({
          type: MTypeTab.GET_WALLET_DATA,
          payload: wallet,
        }).send(this.#stream, recipient);
      }

      if (!this.#phishing.checked) {
        await this.#phishing.check();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async #proxy(payload: ProxyContentType) {
    const { params, method, uuid } = payload;
    const recipient = MTypeTabContent.INJECTED;
    let result = {
      error: undefined
    };

    try {
      if (!(method in RPCMethod)) {
        throw new Error(`allow only ${RPCMethod}`);
      }

      const data = await Message.signal(
        MTypeTab.GET_WALLET_DATA
      ).send();
      const wallet = warpMessage(data);

      if (!wallet || !wallet.isEnable) {
        throw ErrorMessages.Disabled;
      } else if (!wallet.isConnect) {
        throw ErrorMessages.Connect;
      }

      const http = method === RPCMethod.GetTransactionStatus ?
        wallet.nativeHttp : wallet.http;
      result = await httpProvider(
        http,
        method,
        params
      );
    } catch (err) {
      result.error = {
        message: (err as Error).message
      };
    }

    if (result.error) {
      return new ContentMessage({
        type: MTypeTab.CONTENT_PROXY_RESULT,
        payload: {
          reject: result['message'],
          uuid
        },
      }).send(this.#stream, recipient);
    }

    return new ContentMessage({
      type: MTypeTab.CONTENT_PROXY_RESULT,
      payload: {
        resolve: result,
        uuid
      }
    }).send(this.#stream, recipient);
  }
}
