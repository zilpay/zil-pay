/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { FIELDS, API } from 'config'
import {
  ZilliqaControl,
  PromptService,
  NotificationsControl
} from '../services'
import { BrowserStorage } from 'lib/storage'
import { TypeChecker } from 'lib/type'
import {
  accountControl,
  networkControl
} from './main'
import {
  TabsMessage,
  MTypesTabs
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
    const type = MTypesTabs.TX_RESULT

    payload.uuid = uuid

    new TabsMessage({
      type, payload
    }).send()
  }

  /**
   * Get full tx list history.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  static async getTransactionsList(sendResponse) {
    let transactions = null
    const storage = new BrowserStorage()

    try {
      transactions = await storage.get(FIELDS.TRANSACTIONS)
    } catch (err) {
      transactions = {}
    }

    if (new TypeChecker(sendResponse).isFunction) {
      sendResponse(transactions)
    }

    return transactions
  }

  /**
   * When user rejected tx through popup.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  static async rmTransactionsConfirm(sendResponse) {
    const removed = await accountControl.zilliqa.rmForSingTransaction()

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
   * Send tx to node through jsonRPC.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  async buildTransaction(sendResponse) {
    let resultTx = null
    let seedOrKey = null
    let lastNonce = null
    const storage = new BrowserStorage()
    const data = await storage.get([
      FIELDS.CONFIRM_TX,
      FIELDS.WALLET,
      FIELDS.TRANSACTIONS
    ])
    const txList = data[FIELDS.TRANSACTIONS]
    const wallet = data[FIELDS.WALLET]
    const index = wallet.selectedAddress
    const accountSelected = wallet.identities[index]
    const address = accountSelected.address
    const accountID = accountSelected.index

    let transaction = data[FIELDS.CONFIRM_TX].pop()

    // Set custom gasLimit, gasPrice.
    transaction.gasLimit = this.payload.gasLimit || transaction.gasLimit
    transaction.gasPrice = this.payload.gasPrice || transaction.gasPrice

    try {
      await accountControl.auth.vaultSync()

      const { decryptImported, decryptSeed } = accountControl.auth.getWallet()

      if (accountSelected.isImport) {
        const { privateKey } = decryptImported.find(
          acc => acc.index === accountID
        )

        seedOrKey = privateKey
      } else {
        seedOrKey = decryptSeed
      }

      if (!seedOrKey) {
        throw new Error('Account Fail')
      }
    } catch (err) {
      sendResponse({ reject: err.message })

      return null
    }

    const isTxList = txList
      && txList[address]
      && txList[address][networkControl.selected]

    if (isTxList) {
      const lastTx = txList[address][networkControl.selected]

      lastNonce = lastTx[lastTx.length - 1].nonce
    }

    try {
      const zilliqaControl = new ZilliqaControl(
        networkControl.provider
      )

      resultTx = await zilliqaControl.singTransaction(
        transaction,
        seedOrKey,
        accountID,
        lastNonce
      )
    } catch (err) {
      sendResponse({ reject: err.message })

      return null
    }

    const { result, req, error } = resultTx

    if (result) {
      await accountControl.zilliqa.rmForSingTransaction()

      let tx = result

      tx.from = accountSelected.address

      if (req && req.payload && req.payload.params && req.payload.params[0]) {
        Object.assign(tx, req.payload.params[0])
      }

      await accountControl.zilliqa.addTransactionList(
        tx, networkControl.selected
      )

      sendResponse({ resolve: tx })

      if (transaction.uuid) {
        Transaction.returnTx(
          { resolve: tx }, transaction.uuid
        )
      }

      this._transactionListing(tx.TranID)
    } else {
      if (transaction.uuid) {
        Transaction.returnTx({ reject: error.message }, transaction.uuid)
      }

      sendResponse({ reject: error.message })
    }
  }

  /**
   * Just build tx don't send to node.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  async buildTxParams(sendResponse) {
    const zilliqaControl = new ZilliqaControl(
      networkControl.provider
    )
    const address = this.payload.from
    const storage = new BrowserStorage()
    let lastNonce = 0
    let transactionsHistory = await storage.get(FIELDS.TRANSACTIONS)

    if (transactionsHistory && transactionsHistory[address]) {
      const lastTx = transactionsHistory[address][networkControl.selected]

      if (lastTx.length > 0 && transactionsHistory[lastTx.length - 1]) {
        lastNonce = transactionsHistory[lastTx.length - 1].nonce
      }
    }

    try {
      const { txParams } = await zilliqaControl.buildTxParams(
        this.payload.txParams,
        address,
        lastNonce,
        ''
      )

      txParams.amount = txParams.amount.toString()
      txParams.gasLimit = txParams.gasLimit.toString()
      txParams.gasPrice = txParams.gasPrice.toString()

      sendResponse({ resolve: txParams })
    } catch (err) {
      sendResponse({ reject: err.message })
    }
  }

  /**
   * Just send signed tx.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  async sendSignedTx(sendResponse) {
    let resultTx
    const zilliqaControl = new ZilliqaControl(
      networkControl.provider
    )

    try {
      const { txParams } = await zilliqaControl.transactions.new(this.payload)

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

}
