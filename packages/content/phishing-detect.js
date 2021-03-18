/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import extension from 'extensionizer'
import HTTPProvider from './provider'
import {
  Message,
  MTypeTab
} from 'lib/stream'

const { window } = global

export class PhishingDetect {
  constructor() {
    this.host = window.location.host
    this.contract = 'c51a6786ec357e0984d9f2a9ff0a39506ecf0787'
    this.field = 'domains'
    this.url = extension.extension.getURL('phishing.html')

    this._check()
  }

  async _check() {
    try {
      const userData = await Message.signal(
        MTypeTab.GET_WALLET_DATA
      ).send()

      const httpProvider = new HTTPProvider(userData.provider)
      const method = 'GetSmartContractSubState'
      const params = [
        this.contract,
        this.field,
        [this.host]
      ]
      const { result } = await httpProvider.send(method, params)

      if (result && result[this.field]) {
        window.location.replace(this.url)
      }
    } catch {
      //
    }
  }
}
