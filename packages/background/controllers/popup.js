/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { FIELDS, ZILLIQA } from 'config'
import { MnemonicControl } from 'packages/background/services'
import { BrowserStorage } from 'lib/storage'
import { TypeChecker } from 'lib/type'
import {
  accountControl,
  networkControl,
  socketControl
} from './main'
import {
  TabsMessage,
  MTypeTab
} from 'lib/stream'
import { Transaction } from 'packages/background/controllers'
import { Zilliqa } from './zilliqa'
import { PromptService } from 'packages/background/services'

/**
 * Popup controler.
 */
export class Popup {

  /**
   * Send new status about wallet to content.js > inpage.js.
   */
  static async walletStatusUpdate() {
    const isEnable = accountControl.auth.isEnable
    const isReady = accountControl.auth.isReady
    const type = MTypeTab.LOCK_STAUS
    let selectedAccount = null

    if (isEnable) {
      const storage = new BrowserStorage()
      const wallet = await storage.get(FIELDS.WALLET)

      if (!wallet || !wallet.identities || wallet.identities.length === 0) {
        return null
      }

      selectedAccount = wallet.identities[wallet.selectedAddress]
    }

    if (isEnable && isReady) {
      socketControl.start()
    } else {
      socketControl.stop()
    }

    return new TabsMessage({
      type,
      payload: {
        isEnable,
        isReady,
        account: selectedAccount
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

  static async installedWallet(){
    await accountControl.auth.vaultSync()
    await networkControl.netwrokSync()

    if (!accountControl.auth.isReady && !accountControl.auth.isEnable) {
      new PromptService().openTab()
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

    if (accountControl.auth.isEnable) {
      new Transaction().checkAllTransaction()
    }

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

      await Zilliqa.addDefaultTokens()

      sendResponse({ resolve: wallet })
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

  async setDataFromPopup(sendResponse) {
    const storage = new BrowserStorage()

    try {
      await storage.set([this.payload])

      sendResponse({ resolve: true })
    } catch (err) {
      sendResponse({ reject: false })
    }
  }
}
