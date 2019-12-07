/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import extension from 'extensionizer'

import { Message } from './message'

/**
 * TabsMessage is class for send messages for any tabs.
 * @example
 * import { TabsMessage } from 'lib/stream/message'
 * const msg = { type: '@/tab/example', payload: {} }
 * new TabsMessage(msg)
 *   .send()
 *   .then(() => / Do something... /)
 */
export class TabsMessage extends Message {

  /**
   * @returns {Promise<Object>} - {title, url, favIconUrl, id}.
   */
  static tabs() {
    return new Promise(resolve => {
      extension.tabs.query({ active: true }, resolve)
    })
  }

  /**
   * Recieve msg object.
   * @param {Object} msg - Message for send.
   */
  constructor(msg) {
    super(msg)
  }

  /**
   * Send msg for tabs.
   */
  async send () {
    const self = this
    // Get all active tabs.
    const tabs = await TabsMessage.tabs()

    try {
      for (let index = 0; index < tabs.length; index++) {
        const tab = tabs[index]

        // Sending to each tabs(pages)
        extension.tabs.sendMessage(tab.id, self)
      }
    } catch(err) {
      // If not tabs with injected script.
    }
  }

}
