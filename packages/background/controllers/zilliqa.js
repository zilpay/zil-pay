/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { FIELDS } from 'config'
import { BrowserStorage } from 'lib/storage'
import { TypeChecker } from 'lib/type'
import { accountControl, networkControl } from './main'

export class Zilliqa {

  /**
   * Call when inpage script has been loaded.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   * @param {String} domain - Tab domain name.
   */
  static async initInpage(sendResponse, domain) {
    await networkControl.netwrokSync()

    const storage = new BrowserStorage()
    const provider = networkControl.provider
    const isConnect = await accountControl.isConnection(domain)

    let wallet = await storage.get(FIELDS.WALLET)

    let account = wallet.identities[
      wallet.selectedAddress
    ]

    if (!isConnect) {
      account = null
    }

    const data = {
      provider,
      account,
      isConnect,
      isEnable: accountControl.auth.isEnable,
      net: networkControl.selected
    }

    sendResponse(data)
  }

  /**
   * Clear stored tx.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  static async rmAllTransactionList(sendResponse) {
    await accountControl.zilliqa.rmAllTransactionList()

    if (new TypeChecker(sendResponse).isFunction) {
      sendResponse(true)
    }
  }

  constructor(payload) {
    this.payload = payload
  }

}
