/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { ReqBody } from './message';
import { Runtime } from 'lib/runtime';

/**
 * TabsMessage is class for send messages for any tabs.
 * @example
 * import { TabsMessage } from 'lib/stream/message'
 * const msg = { type: '@/tab/example', payload: {} }
 * new TabsMessage(msg)
 *   .send()
 *   .then(() => / Do something... /)
 */
export class TabsMessage {
  private readonly _body: ReqBody;

  static tabs(): Promise<chrome.tabs.Tab[]> {
    return new Promise(resolve => {
      Runtime.tabs.query({}, resolve);
    })
  }

  /**
   * Recieve msg object.
   */
  constructor(msg: ReqBody) {
    this._body = msg;
  }

  /**
   * Send msg for tabs.
   */
  public async send() {
    // Get all active tabs.
    const tabs = await TabsMessage.tabs();

    try {
      for (let index = 0; index < tabs.length; index++) {
        const tab = tabs[index];
        const seralized = JSON.stringify(this._body);
        const deserialized = JSON.parse(seralized);

        // Sending to each tabs(pages)
        Runtime.tabs.sendMessage(tab.id, deserialized);
      }
    } catch (err) {
      // If not tabs with injected script.
    }
  }

}