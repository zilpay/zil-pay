/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { UnstoppableDomains } from 'packages/background/services'

/**
 * Crypro domains controller.
 */
export class Domains {

  constructor(payload) {
    this.payload = payload
    this.unstoppableDomains = new UnstoppableDomains()
  }

  async getUdOwnerByDomain(sendResponse) {
    const { domain } = this.payload

    try {
      if (!domain) {
        throw new Error('Incorrect domain name.')
      }

      const resolve = await this.unstoppableDomains.getAddressByDomain(domain)

      sendResponse({ resolve })
    } catch (err) {
      sendResponse({ reject: err.message })
    }
  }
}
