/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { FIELDS } from 'config'
import { BrowserStorage, BuildObject } from 'lib/storage'
import { TypeChecker } from 'lib/type'
import { TabsMessage, MTypeTab } from 'lib/stream'
import {
  AccountExporter,
  AccountImporter,
  ZilliqaControl,
  PromptService
} from 'packages/background/services'
import { accountControl, networkControl } from './main'
import { Transaction } from './transaction'
import { ERROR_MSGS } from 'packages/background/errors'

const { Promise } = global

/**
 * wallet controler for import and export.
 */
export class Wallet {

  constructor(payload) {
    this.payload = payload
  }

  async confirmSignMsg(sendResponse) {
    await networkControl.netwrokSync()

    try {
      const zilliqa = new ZilliqaControl(networkControl.provider)
      const payload = await zilliqa.rmForSingTransaction()

      if (this.payload.signature) {
        Transaction.returnTx({
          resolve: {
            ...payload,
            ...this.payload
          }
        }, this.payload.uuid)

        return sendResponse({ resolve: this.payload.signature })
      }

      const account = await accountControl.getCurrentAccount()
      const signature = await zilliqa.signMessage(payload.message, account)

      Transaction.returnTx({
        resolve: signature
      }, payload.uuid)

      return sendResponse({ resolve: signature })
    } catch (err) {
      sendResponse({ reject: err.message })
    }
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
        account = await accountExporter.exportAccountFromStore(password)
      } else {
        account = await accountExporter.exportPrivateKeyFromSeed(password)
      }

      sendResponse({ resolve: account })
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
    const { privKey } = this.payload
    const accountImporter = new AccountImporter(accountControl)

    try {
      const wallet = await accountImporter.importAccountByPrivateKey(privKey)

      sendResponse({ resolve: wallet })
    } catch (err) {
      sendResponse({ reject: err.message })
    }
  }

  async importKeyStore(sendResponse) {
    const accountImporter = new AccountImporter(accountControl)
    const { content, name, password } = this.payload

    try {
      const wallet = await accountImporter.importAccountByKeyStore(
        content, name, password
      )

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

      if (new TypeChecker(sendResponse).isFunction) {
        sendResponse({ resolve: wallet })
      } else {
        return wallet
      }
    } catch (err) {
      if (new TypeChecker(sendResponse).isFunction) {
        sendResponse({ reject: err.message })
      } else {
        throw new Error(err.message)
      }
    }
  }

  /**
   * When has been any change account.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  async changeWallet(sendResponse) {
    if (!new TypeChecker(this.payload.identities).isArray) {
      return null
    } else if (!new TypeChecker(this.payload.selectedAddress).isInt) {
      return null
    }

    const account = this.payload.identities[
      this.payload.selectedAddress
    ]
    const type = MTypeTab.ADDRESS_CHANGED
    const storage = new BrowserStorage()

    if (!account) {
      return null
    }

    try {
      await storage.set(new BuildObject(FIELDS.WALLET, this.payload))

      new TabsMessage({
        type,
        payload: account
      }).send()

      sendResponse({ resolve: this.payload })

      new Transaction().checkAllTransaction()
    } catch (err) {
      sendResponse({ reject: err.message })
    }
  }

  /**
   * Account balance updater.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  async balanceUpdate(sendResponse) {
    await networkControl.netwrokSync()

    const storage = new BrowserStorage()
    const zilliqa = new ZilliqaControl(networkControl.provider)
    let { wallet, tokens } = await storage.get([
      FIELDS.WALLET,
      FIELDS.SELECTED_COIN,
      FIELDS.TOKENS
    ])
    const account = wallet.identities[wallet.selectedAddress]

    if (!wallet || !wallet.identities || wallet.identities.length === 0) {
      wallet = await this.createAccountBySeed()
    }

    try {
      const { address } = wallet.identities[wallet.selectedAddress]
      const { balance } = await zilliqa.getBalance(address)
      const selectedTokens = tokens[networkControl.selected]

      wallet.identities[wallet.selectedAddress].balance = balance

      if (!selectedTokens || selectedTokens.length === 0) {
        await storage.set(new BuildObject(FIELDS.WALLET, wallet))

        return sendResponse({ resolve: { tokens, wallet } })
      }

      const awaiterTokens = selectedTokens.map(async(el) => {
        const address = el.proxy_address ? el.proxy_address : el.address
        const balance = await zilliqa.getZRCBalance(address, account)

        el.balance = balance

        return el
      })

      tokens[networkControl.selected] = await Promise.all(awaiterTokens)

      await storage.set([
        new BuildObject(FIELDS.TOKENS, tokens),
        new BuildObject(FIELDS.WALLET, wallet)
      ])

      sendResponse({ resolve: { tokens, wallet } })
    } catch (err) {
      console.warn(err)
      sendResponse({ reject: err.message })
    }
  }

  /**
   * When DApp make request for accept resolution working with it.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  async connectToDapp(sendResponse) {
    const isConnect = await accountControl.isConnection(this.payload.domain)
    const { isEnable } = accountControl.auth

    if (isConnect && isEnable) {
      const storage = new BrowserStorage()
      const wallet = await storage.get(FIELDS.WALLET)
      const account = wallet.identities[wallet.selectedAddress]
      const type = MTypeTab.RESPONSE_TO_DAPP
      const payload = {
        ...this.payload,
        account,
        confirm: true
      }

      new TabsMessage({ type, payload }).send()

      return sendResponse({ resolve: true })
    }

    try {
      await accountControl.addForConnectDapp(this.payload)

      new PromptService().open()

      sendResponse({ resolve: true })
    } catch (err) {
      sendResponse({ reject: err.message })
    }
  }

  /**
   * When popup confirm or reject dApp.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  async isConnectionDapp(sendResponse) {
    let payload = this.payload
    const storage = new BrowserStorage()
    const type = MTypeTab.RESPONSE_TO_DAPP

    if (!this.payload || !this.payload.confirm || !this.payload.uuid) {
      if (new TypeChecker(sendResponse).isFunction) {
        sendResponse(true)
      }

      return new TabsMessage({ type, payload }).send()
    }

    const wallet = await storage.get(FIELDS.WALLET)
    const account = wallet.identities[wallet.selectedAddress]

    payload = {
      ...payload,
      account
    }

    new TabsMessage({ type, payload }).send()

    if (new TypeChecker(sendResponse).isFunction) {
      sendResponse(true)
    }
  }

  async signMessage(sendResponse) {
    const isConnect = await accountControl.isConnection(this.payload.domain)

    if (!isConnect) {
      sendResponse({ reject: ERROR_MSGS.CONNECT })

      return Transaction.returnTx(
        { reject: ERROR_MSGS.CONNECT },
        this.payload.uuid
      )
    } else if (!accountControl.auth.isEnable || !accountControl.auth.isReady) {
      sendResponse({ reject: ERROR_MSGS.DISABLED })

      return Transaction.returnTx(
        { reject: ERROR_MSGS.DISABLED },
        this.payload.uuid
      )
    }

    try {
      await networkControl.netwrokSync()

      const zilliqa = new ZilliqaControl(networkControl.provider)

      await zilliqa.addForSignMessage(this.payload)

      new PromptService().open()

      return sendResponse({ resolve: true })
    } catch (err) {
      sendResponse({ reject: err.message })

      return Transaction.returnTx({
        reject: err.message
      }, this.payload.uuid)
    }
  }
}
