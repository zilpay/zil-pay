/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { TypeChecker } from 'lib/type'
import { networkControl, socketControl } from './main'
import { TabsMessage, MTypeTab } from 'lib/stream'

/**
 * Network actions for popup.
 */
export class Network {

  /**
   * When user change selected network through popup.
   * @param {String} selectednet - Network string.
   */
  async changeNetwork(selectednet) {
    if (!new TypeChecker(selectednet).isString) {
      return null
    }

    let payload = null
    const type = MTypeTab.NETWORK_CHANGED

    try {
      await networkControl.netwrokSync()
      await networkControl.changeNetwork(selectednet)

      payload = {
        provider: networkControl.provider,
        net: networkControl.selected
      }
    } catch (err) {
      payload = { reject: err.message }
    } finally {
      new TabsMessage({ type, payload }).send()

      await socketControl.stop()
      await socketControl.start()
    }
  }

}
