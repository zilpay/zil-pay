/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { networkControl, socketControl } from './main'
import { TabsMessage, MTypeTab } from 'lib/stream'
import { Transaction } from './transaction'
import { Zilliqa } from './zilliqa'

/**
 * Network actions for popup.
 */
export class Network {

  /**
   * @param {Object} payload - Message payload.
   */
  constructor(payload) {
    this.payload = payload
  }

  /**
   * When user change selected network through popup.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  async changeNetwork(sendResponse) {
    const { selectednet } = this.payload

    let payload = null
    const type = MTypeTab.NETWORK_CHANGED

    try {
      await networkControl.netwrokSync()
      await networkControl.changeNetwork(selectednet)
      await Zilliqa.addDefaultTokens()

      payload = {
        provider: networkControl.provider,
        net: networkControl.selected
      }

      sendResponse({ resolve: selectednet })

      new TabsMessage({ type, payload }).send()
      new Transaction().checkAllTransaction()
    } catch (err) {
      sendResponse({ reject: err.message })
    } finally {
      await socketControl.stop()
      await socketControl.start()
    }
  }

}
