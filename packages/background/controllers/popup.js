/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { FIELDS, ZILLIQA } from 'config'
import { MnemonicControl } from '../services'
import { BrowserStorage } from 'lib/storage'
import { TypeChecker } from 'lib/type'
import {
  accountControl,
  networkControl
} from './main'
import {
  TabsMessage,
  MTypeTab
} from 'lib/stream'

/**
 * Popup controler.
 */
export class Popup {

  /**
   * Send new status about wallet to content.js > inpage.js.
   */
  static walletStatusUpdate() {
    const type = MTypeTab.LOCK_STAUS

    return new TabsMessage({
      type,
      payload: {
        isEnable: accountControl.auth.isEnable,
        isReady: accountControl.auth.isReady
      }
    }).send()
  }

  /**
   * Clear session and update wallet status.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  static logOut(sendResponse) {
    accountControl.resetAuth()

    Popup.walletStatusUpdate()

    if (new TypeChecker(sendResponse).isFunction) {
      sendResponse(true)
    }
  }

  /**
   * @param {Object} payload - Message payload.
   */
  constructor(payload) {
    this.payload = payload
  }

  /**
   * When user click to extension show popup and make request for receive wallet data.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  async initPopup(sendResponse) {
    const session = accountControl.auth.verificationTime

    if (!session && session !== null) {
      Popup.logOut()
    }

    await accountControl.auth.vaultSync()
    await networkControl.netwrokSync()

    if (networkControl.status === null) {
      await networkControl.checkProvider()
    }

    if (!accountControl.auth.isReady) {
      await networkControl.changeConfig(ZILLIQA)
      await networkControl.changeNetwork(networkControl.selected)

      sendResponse({
        reject: {
          isEnable: accountControl.auth.isEnable,
          isReady: accountControl.auth.isReady,
          networkStatus: networkControl.status
        }
      })

      return null
    }

    try {
      await accountControl.auth.getWallet()
    } catch (err) {
      /* */
    }

    await accountControl.zilliqa.notificationsCounter()

    sendResponse({
      resolve: {
        isEnable: accountControl.auth.isEnable,
        isReady: accountControl.auth.isReady,
        networkStatus: networkControl.status
      }
    })

    Popup.walletStatusUpdate()
  }

  /**
   * Create new wallet by seed words.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  async initWallet(sendResponse) {
    const { seed, password } = this.payload
    const storage = new BrowserStorage()

    try {
      await accountControl.auth.setPassword(password)
      await accountControl.initWallet(seed)

      const wallet = await storage.get(FIELDS.WALLET)

      sendResponse({ resolve: wallet[FIELDS.WALLET] })
    } catch (err) {
      sendResponse({ reject: err.message })
    }

    Popup.walletStatusUpdate()
  }

  /**
   * Unlock wallet through password.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  async walletUnlock(sendResponse) {
    const { password } = this.payload

    try {
      await accountControl.auth.setPassword(password)

      const status = accountControl.auth.isEnable

      sendResponse({ resolve: status })
    } catch (err) {
      sendResponse({ reject: false })
    }

    Popup.walletStatusUpdate()
  }

  /**
   * Generate random seed words.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  async getRandomSeedPhrase(sendResponse) {
    const mnemonicControl = new MnemonicControl()
    const randomSeed = mnemonicControl.getRandomSeed

    if (new TypeChecker(sendResponse).isFunction) {
      sendResponse({ resolve: randomSeed })
    }

    return randomSeed
  }

  /**
   * Change default account name.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  async changeAccountName(sendResponse) {
    const { name } = this.payload

    try {
      await accountControl.changeAccountName(name)
      sendResponse({ resolve: true })
    } catch (err) {
      sendResponse({ reject: err.message })
    }
  }
}
