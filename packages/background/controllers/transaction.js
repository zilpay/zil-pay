/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { API } from 'config'

import {
  ZilliqaControl,
  PromptService,
  NotificationsControl
} from '../services'

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

  constructor(payload) {
    this.payload = payload
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

  /**
   * Just send signed tx.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  async sendSignedTx(sendResponse) {
    let resultTx = null
    const zilliqaControl = new ZilliqaControl(
      networkControl.provider
    )

    try {
      const { txParams } = zilliqaControl.transactions.new(this.payload)

      resultTx = await zilliqaControl.signedTxSend(txParams)

      await Transaction.rmTransactionsConfirm()
    } catch (err) {
      sendResponse({ reject: err.message })

      return null
    }

    const { result, req, error } = resultTx

    if (result) {
      let tx = Object.assign(result, req.payload.params[0])

      tx.from = this.payload.from

      await accountControl.zilliqa.addTransactionList(
        tx, networkControl.selected
      )

      sendResponse({ resolve: tx })

      if (this.payload.uuid) {
        Transaction.returnTx(
          { resolve: tx }, this.payload.uuid
        )
      }

      this._transactionListing(tx.TranID)
    } else {
      if (this.payload.uuid) {
        Transaction.returnTx({ reject: error.message }, this.payload.uuid)
      }

      sendResponse({ reject: error.message })
    }
  }

  /**
   * Listing when tx was mined.
   * @param {String} txHash - Tx hash.
   * @param {String} from - Sender address.
   */
  async _transactionListing(txHash, from) {
    const zilliqaControl = new ZilliqaControl(
      networkControl.provider
    )
    const net = `network=${networkControl.selected}`
    const timeInterval = 10000
    const countIntervl = 100
    const title = 'ZilPay Transactions'
    let k = 0

    const interval = setInterval(async() => {
      try {
        const { result } = await zilliqaControl
          .blockchain
          .getPendingTxn(txHash)

        if (result.confirmed) {
          new NotificationsControl({
            url: `${API.EXPLORER}/tx/0x${txHash}?${net}`,
            title: title,
            message: 'Transactions send to shard done.'
          }).create()

          accountControl.zilliqa.updateTransactionList(
            { confirmed: true, error: null },
            txHash,
            networkControl.selected,
            from
          )

          clearInterval(interval)

          return null
        }
      } catch (err) {
        accountControl.zilliqa.updateTransactionList(
          { confirmed: true, error: true },
          txHash,
          networkControl.selected,
          from
        )

        clearInterval(interval)

        return null
      }

      if (k > countIntervl) {
        accountControl.zilliqa.updateTransactionList(
          { confirmed: true, error: true },
          txHash,
          networkControl.selected,
          from
        )

        clearInterval(interval)

        return null
      }

      k++
    }, timeInterval)
  }

  async signSendTx(sendResponse) {
    const zilliqa = new ZilliqaControl(networkControl.provider)

    try {
      const account = await accountControl.getCurrentAccount()
      const payload = await zilliqa.buildTxParams(this.payload, account)
      const { result, req, error } = await zilliqa.singTransaction(payload, account.privateKey)

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

      this._transactionListing(tx.TranID, account.address)

      return sendResponse({ resolve: tx })
    } catch (err) {
      return sendResponse({ reject: err.message })
    }
  }

}
