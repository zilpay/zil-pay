/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { TabStream } from 'lib/streem/tab-stream';
import type { Params } from 'types/zilliqa';
import type { Subject } from './subject';

import { uuidv4 } from 'lib/crypto/uuid';
import { MTypeTab, MTypeTabContent } from 'lib/streem/stream-keys';
import { ContentMessage } from 'lib/streem/secure-message';

export class HTTPProvider {
  #stream: TabStream;
  #subject: Subject;

  constructor(stream: TabStream, subject: Subject) {
    this.#stream = stream;
    this.#subject = subject;
  }

  public send(method: string, ...params: Params) {
    const type = MTypeTab.CONTENT_PROXY_MEHTOD;
    const recipient = MTypeTabContent.CONTENT;
    const uuid = uuidv4();

    // Send to content.js
    new ContentMessage({
      type,
      payload: {
        params,
        method,
        uuid
      }
    }).send(this.#stream, recipient);

    return new Promise((resolve, reject) => {
      const sub = this.#subject.on((msg) => {
        if (msg.type !== MTypeTab.CONTENT_PROXY_RESULT) return;
        if (!msg.payload || !msg.payload.uuid) return;
        if (msg.payload.uuid !== uuid) return;

        if (msg.payload && msg.payload.error) {
          sub();
          return reject(msg.payload.error);
        }

        delete msg.payload.uuid;

        return resolve(msg.payload);
      });
    })
  }
}

