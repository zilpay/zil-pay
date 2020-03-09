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
// import { BrowserStorage } from 'lib/storage'
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
   */
  async _transactionListing(txHash) {
    const zilliqaControl = new ZilliqaControl(
      networkControl.provider
    )
    const net = `network=${networkControl.selected}`
    const timeInterval = 4000
    const countIntervl = 100
    const title = 'ZilPay Transactions'
    let k = 0

    const interval = setInterval(
      async() => {

        try {
          await zilliqaControl
            .blockchain
            .getTransaction(txHash)

          new NotificationsControl({
            url: `${API.EXPLORER}/tx/0x${txHash}?${net}`,
            title: title,
            message: 'Transactions send to shard done.'
          }).create()

          clearInterval(interval)

          return null
        } catch (err) {
          if (k > countIntervl) {
            clearInterval(interval)
            return null
          }
        }

        if (k > countIntervl) {
          clearInterval(interval)
        }

        k++
      },
      timeInterval
    )
  }

  async signSendTx(sendResponse) {
    // 1. Detect Account.
    // 2. Detect Signature.
    // 3. If has signature send via ZilliqaControl.
    // 4. if hasn't signature try will to sign via detected account.
    //
    // 5. Tx has been sent.
    // 5.1 call callback `sendResponse`.
    // 5.2 Tx will be add to storage with `padding` status.
    // 5.3 Tx call to listing for awaiting prey.
    // 5.4 Tx has been mined out.
    // 5.5 Tx will add to storage with result status.
    // 5.6 Show notification that tx has been mined out.
    return sendResponse({ reject: 'fail sign' })
    // return sendResponse({ resolve: this.payload })
  }

}
