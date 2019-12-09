/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { FIELDS } from 'config'
import { TypeChecker } from 'lib/type'
import { networkControl } from './main'
import {
  TabsMessage,
  MTypesTabs
} from 'lib/stream'

/**
 * Network actions for popup.
 */
export class Network {

  constructor(payload) {
    this.payload = payload
  }

  /**
   * When user change selected network through popup.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  async changeNetwork(sendResponse) {
    let payload = null
    const selectednet = this.payload[FIELDS.SELECTED_NET]
    const type = MTypesTabs.NETWORK_CHANGED

    try {
      await networkControl.netwrokSync()
      await networkControl.changeNetwork(selectednet)

      payload = {
        provider: networkControl.provider,
        net: networkControl.selected
      }
    } catch (err) {
      payload = { reject: err.message }
    }

    new TabsMessage({ type, payload }).send()

    if (new TypeChecker(sendResponse).isFunction) {
      sendResponse(networkControl.status)
    }
  }

  /**
   * When user change network config through popup.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  async changeConfig(sendResponse) {
    const config = this.payload[FIELDS.CONFIG]

    try {
      await networkControl.changeConfig(config)

      sendResponse({ resolve: true })
    } catch (err) {
      sendResponse({ reject: err.message })
    }
  }

}
