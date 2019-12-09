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
import {
  TabsMessage,
  MTypesTabs
} from 'lib/stream'
import {
  AccountExporter,
  AccountImporter,
  ZilliqaControl,
  PromptService
} from '../services'
import {
  accountControl,
  networkControl
} from './main'

/**
 * wallet controler for import and export.
 */
export class Wallet {

  constructor(payload) {
    this.payload = payload
  }

  /**
   * Exporting privateKey through user password.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  async exportPrivateKey(sendResponse) {
    let account = null
    const { password } = this.payload
    const accountExporter = new AccountExporter()

    try {
      await accountExporter.auth.setPassword(password)
      const isImported = await accountExporter.isImported()

      if (isImported) {
        account = await accountExporter.exportAccountFromStore()
      } else {
        account = await accountExporter.exportPrivateKeyFromSeed()
      }

      sendResponse({ resolve: account.privateKey })
    } catch (err) {
      sendResponse({ reject: err.message })
    }
  }

  /**
   * Exporting seed words through user password.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  async exportSeedPhrase(sendResponse) {
    let seedPhrase = null
    const { password } = this.payload
    const accountExporter = new AccountExporter()

    try {
      await accountExporter.auth.setPassword(password)

      seedPhrase = await accountExporter.exportSeed()

      sendResponse({ resolve: seedPhrase.decryptSeed })
    } catch (err) {
      sendResponse({ reject: err.message })
    }
  }

  /**
   * Import privateKey and add account to storage.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  async importPrivateKey(sendResponse) {
    let wallet = null
    const { privKey } = this.payload
    const accountImporter = new AccountImporter(accountControl)

    try {
      wallet = await accountImporter.importAccountByPrivateKey(privKey)

      sendResponse({ resolve: wallet })
    } catch (err) {
      sendResponse({ reject: err.message })
    }
  }

  /**
   * Import account via hardware wallet.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  async ImportHwAccount(sendResponse) {
    const accountImporter = new AccountImporter(accountControl)

    try {
      const wallet = await accountImporter.importByHwAccount(this.payload)

      sendResponse({ resolve: wallet })
    } catch (err) {
      sendResponse({ reject: err.message })
    }
  }

  /**
   * Creating account via seed words and set to storage.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  async createAccountBySeed(sendResponse) {
    try {
      const wallet = await accountControl.newAccountBySeed()

      sendResponse({ resolve: wallet })
    } catch (err) {
      sendResponse({ reject: err.message })
    }
  }

  /**
   * Change account via user popup.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  async changeAddress(sendResponse) {
    const wallet = this.payload[FIELDS.WALLET]
    const account = wallet.identities[
      wallet.selectedAddress
    ]
    const type = MTypesTabs.ADDRESS_CHANGED

    await accountControl.walletUpdate(wallet)

    new TabsMessage({
      type,
      payload: account
    }).send()

    if (new TypeChecker(sendResponse).isFunction) {
      sendResponse(true)
    }
  }

  /**
   * Account balance updater.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  async balanceUpdate(sendResponse) {
    const storage = new BrowserStorage()
    const zilliqa = new ZilliqaControl(networkControl.provider)

    let wallet = await storage.get(FIELDS.WALLET)

    try {
      const { address } = wallet.identities[wallet.selectedAddress]
      const { result } = await zilliqa.getBalance(address)

      wallet.identities[wallet.selectedAddress].balance = result

      await accountControl.walletUpdate(wallet)

      sendResponse({ resolve: wallet })
    } catch (err) {
      sendResponse({ reject: err.message })
    }
  }

  /**
   * When DApp make request for accept resolution working with it.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  async connectToDapp(sendResponse) {
    if (this.payload.domain && this.payload.domain.includes('zilpay.xyz')) {
      sendResponse({ resolve: true })
      return null
    }

    try {
      await accountControl.addForConnectDapp(this.payload)

      new PromptService().open()

      sendResponse({ resolve: true })
    } catch (err) {
      sendResponse({ reject: err.message })
    }
  }
}
