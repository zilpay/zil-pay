/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { localStream } from 'lib/streem/local-stream';
import { MTypeTabContent } from 'lib/streem/stream-keys';
import { ContentMessage } from 'lib/streem/secure-message';
import { ContentTabStream } from './tab-stream';

export function startStream() {
  const tabStream = new ContentTabStream();

  localStream((req, sendResponse) => {
    const msg = new ContentMessage(req);

    if (!msg.type || !msg.payload) {
      sendResponse({
        reject: 'type and payload is required.'
      });
      return null;
    }

    const type = msg.type;
    const recipient = MTypeTabContent.INJECTED;

    new ContentMessage({
      type,
      payload: msg.payload
    }).send(tabStream.stream, recipient);

    sendResponse({});
  });
}
