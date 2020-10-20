/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { API, FIELDS, DEFAULT, DEFAULT_TOKEN } from 'config'

import {
  ZilliqaControl,
  PromptService,
  NotificationsControl
} from 'packages/background/services'

import { TypeChecker } from 'lib/type'
import { accountControl, networkControl, socketControl } from './main'
import { TabsMessage, MTypeTab } from 'lib/stream'
import { BrowserStorage, BuildObject } from 'lib/storage'
import { ERROR_MSGS } from 'packages/background/errors'

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
      { reject: ERROR_MSGS.USER_REJECTED },
      removed.uuid
    )

    if (new TypeChecker(sendResponse).isFunction) {
      sendResponse(true)
    }
  }

  static listingBlockchain() {
    socketControl.observer.subscribe(async(block) => {
      const type = MTypeTab.NEW_BLOCK

      new TabsMessage({
        type,
        payload: { block }
      }).send()

      Transaction.checkBlockForTx(block)
    })
  }

  static async checkBlockForTx(block) {
    const type = new TypeChecker(block.TxHashes)
    if (!type.isArray) {
      return null
    }

    const storage = new BrowserStorage()
    const hasPool = block.TxHashes.flat()
    const data = await storage.get([
      FIELDS.TRANSACTIONS,
      FIELDS.SELECTED_NET
    ])
    const selectednet = data[FIELDS.SELECTED_NET]
    const transactions = data[FIELDS.TRANSACTIONS]
    const addresses = Object.keys(transactions)

    for (let index = 0; index < addresses.length; index++) {
      try {
        const address = addresses[index]
        const txns = transactions[address][selectednet]

        if (!txns || txns.length === 0) {
          continue
        }

        transactions[address][selectednet] = txns.map((tx) => {
          const hash = tx.TranID

          if (tx.confirmed) {
            return tx
          }

          if (hasPool.includes(hash)) {
            Transaction.makeNotificationConfirm(tx)
            tx.confirmed = true
          }

          return tx
        })
      } catch (err) {
        continue
      }
    }

    await storage.set(
      new BuildObject(FIELDS.TRANSACTIONS, transactions)
    )
  }

  static makeNotificationReject(tx) {
    new NotificationsControl({
      url: `${API.EXPLORER}/tx/0x${tx.TranID}?network=${networkControl.selected}`,
      title: 'ZilPay rejected',
      message: tx.Info
    }).create()
  }

  static makeNotificationConfirm(tx) {
    new NotificationsControl({
      url: `${API.EXPLORER}/tx/0x${tx.TranID}?network=${networkControl.selected}`,
      title: 'ZilPay confirmed',
      message: tx.Info
    }).create()
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
      const time = 500

      // If hasn't not confirmed tx.
      if (!currentTransaction.some((tx) => !tx.confirmed)) {
        return null
      }

      const checkList = currentTransaction.map(async(tx) => {
        if (tx.confirmed) {
          return tx
        } else if (tx.timestamp && (new Date().getTime() - new Date(tx.timestamp).getTime()) < time) {
          return tx
        }

        const result = await zilliqaControl.blockchain.getPendingTxn(tx.TranID)
        const blockForskel = Number(socketControl.blockNumber) - Number(tx.block)
        let block = tx.block
        let error = null

        if (result.confirmed) {
          Transaction.makeNotificationConfirm(tx)

          block = socketControl.blockNumber
        } else if (!result.confirmed && blockForskel >= DEFAULT.DS_PER_TX_BLOCKS) {
          Transaction.makeNotificationReject(tx)

          error = true
          result.confirmed = true
        }

        return {
          ...tx,
          block,
          error,
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
      const zilliqaControl = new ZilliqaControl(
        networkControl.provider
      )

      await zilliqaControl.addForSingTransaction(this.payload)

      new PromptService().open()

      return sendResponse({ resolve: true })
    } catch (err) {
      return sendResponse({ reject: err.message })
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
        block: block.result,
        symbol: this.payload.symbol || null,
        decimals: this.payload.decimals || null
      }

      if (req && req.payload && req.payload.params && req.payload.params[0]) {
        tx = {
          ...tx,
          ...req.payload.params[0]
        }
      }

      if (this.payload.symbol && this.payload.symbol !== DEFAULT_TOKEN.symbol) {
        tx.amount = JSON.parse(this.payload.data).params[1].value
      }

      if (this.payload.cancel) {
        await accountControl.zilliqa.cancelTx(tx, networkControl.selected)
      } else {
        await accountControl.zilliqa.addTransactionList(tx, networkControl.selected)
      }

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
