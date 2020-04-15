/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { API, FIELDS } from 'config'

import {
  ZilliqaControl,
  PromptService,
  NotificationsControl
} from 'packages/background/services'

import { TypeChecker } from 'lib/type'
import { accountControl, networkControl, socketControl } from './main'
import { TabsMessage, MTypeTab } from 'lib/stream'
import { BrowserStorage, BuildObject } from 'lib/storage'

const { Promise } = global

/**
 * Get or send tranasctions.
 */
export class Transaction {

  /**
   * When user confirm tx through popup.
   * @param {Object} payload - signed tx.
   * @param {String} uuid - tx id.
   */
  static returnTx(payload, uuid) {
    const type = MTypeTab.TX_RESULT

    payload.uuid = uuid

    new TabsMessage({
      type,
      payload
    }).send()
  }

  /**
   * When user rejected tx through popup.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  static async rmTransactionsConfirm(sendResponse) {
    const removed = await accountControl
      .zilliqa
      .rmForSingTransaction()

    Transaction.returnTx(
      { reject: 'User rejected' },
      removed.uuid
    )

    if (new TypeChecker(sendResponse).isFunction) {
      sendResponse(true)
    }
  }

  static listingBlockchain() {
    socketControl.observer.subscribe(async() => {
      new Transaction().checkAllTransaction()
    })
  }

  constructor(payload) {
    this.payload = payload
  }

  /**
   * Just check all txs for confirmed.
   */
  async checkAllTransaction() {
    await networkControl.netwrokSync()

    const storage = new BrowserStorage()
    const zilliqaControl = new ZilliqaControl(networkControl.provider)
    const data = await storage.get([
      FIELDS.TRANSACTIONS,
      FIELDS.WALLET,
      FIELDS.SELECTED_NET
    ])

    try {
      let transactions = data[FIELDS.TRANSACTIONS]
      const wallet = data[FIELDS.WALLET]
      const net = data[FIELDS.SELECTED_NET]
      const selectedAccount = wallet.identities[wallet.selectedAddress]
      const currentTransaction = transactions[selectedAccount.address][net]

      // If hasn't not confirmed tx.
      if (!currentTransaction.some((tx) => !tx.confirmed)) {
        return null
      }

      const checkList = currentTransaction.map(async(tx) => {
        if (tx.confirmed) {
          return tx
        }

        const { result } = await zilliqaControl.blockchain.getPendingTxn(tx.TranID)

        if (result.confirmed) {
          new NotificationsControl({
            url: `${API.EXPLORER}/tx/0x${tx.TranID}?network=${networkControl.selected}`,
            title: 'ZilPay Transactions',
            message: tx.Info
          }).create()
        }

        return {
          ...tx,
          block: socketControl.blockNumber,
          confirmed: result.confirmed
        }
      })
      const provens = await Promise.all(checkList)

      transactions[selectedAccount.address][net] = provens

      await storage.set(
        new BuildObject(FIELDS.TRANSACTIONS, transactions)
      )
    } catch (err) {
      return null
    }
  }

  /**
   * When DApp call the any tx.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  async callTransaction(sendResponse) {
    const zilliqaControl = new ZilliqaControl(
      networkControl.provider
    )

    try {
      await zilliqaControl.addForSingTransaction(
        this.payload
      )

      new PromptService().open()

      sendResponse({ resolve: true })
    } catch (err) {
      sendResponse({ reject: err.message })
    }
  }

  async signSendTx(sendResponse) {
    await networkControl.netwrokSync()

    try {
      const zilliqa = new ZilliqaControl(networkControl.provider)
      const account = await accountControl.getCurrentAccount()
      const payload = await zilliqa.buildTxParams(this.payload, account)
      const { result, req, error } = await zilliqa.singTransaction(payload, account)

      if (!result || error) {
        if (this.payload.uuid) {
          Transaction.returnTx({ reject: error.message }, this.payload.uuid)
        }

        return sendResponse({ reject: error.message })
      }

      const block = await zilliqa.blockchain.getCurrentMiniEpoch()
      let tx = {
        ...result,
        from: account.address,
        confirmed: false,
        block: block.result
      }

      if (req && req.payload && req.payload.params && req.payload.params[0]) {
        tx = {
          ...tx,
          ...req.payload.params[0]
        }
      }

      await accountControl.zilliqa.addTransactionList(tx, networkControl.selected)

      if (this.payload.uuid) {
        await accountControl.zilliqa.rmForSingTransaction()

        Transaction.returnTx({ resolve: tx }, this.payload.uuid)
      }

      return sendResponse({ resolve: tx })
    } catch (err) {
      return sendResponse({ reject: err.message })
    }
  }

  /**
   * Build TxParams object.
   * @param {Function} sendResponse
   */
  async buildTxParams(sendResponse) {
    await networkControl.netwrokSync()

    try {
      const zilliqa = new ZilliqaControl(networkControl.provider)
      const account = await accountControl.getCurrentAccount()
      const { txParams } = await zilliqa.buildTxParams(this.payload, account)

      txParams.amount = String(txParams.amount)
      txParams.gasLimit = String(txParams.gasLimit)
      txParams.gasPrice = String(txParams.gasPrice)

      return sendResponse({ resolve: txParams })
    } catch (err) {
      return sendResponse({ reject: err.message })
    }
  }

}
