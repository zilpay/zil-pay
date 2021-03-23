/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { API, FIELDS, DEFAULT_TOKEN } from 'config'

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

    await networkControl.netwrokSync()
    const storage = new BrowserStorage()
    const hasPool = block.TxHashes.flat()
    const transactions = await storage.get(
      FIELDS.TRANSACTIONS
    )
    const selectednet = networkControl.selected
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
            tx.confirmed = true
            tx.Info = 'Confirmed'
            Transaction.makeNotification(tx)
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

  static makeNotification(tx) {
    new NotificationsControl({
      url: `${API.EXPLORER}/tx/0x${tx.TranID}?network=${networkControl.selected}`,
      title: 'ZilPay',
      message: tx.Info
    }).create()
  }

  constructor(payload) {
    this.payload = payload
    this.storage = new BrowserStorage()
  }

  /**
   * Just check all txs for confirmed.
   */
  async checkAllTransaction() {
    await networkControl.netwrokSync()

    const zilliqaControl = new ZilliqaControl(networkControl.provider)
    const data = await this.storage.get([
      FIELDS.TRANSACTIONS,
      FIELDS.WALLET
    ])
    const wallet = data[FIELDS.WALLET]
    const net = networkControl.selected
    const selectedAccount = wallet.identities[wallet.selectedAddress]
    let transactions = data[FIELDS.TRANSACTIONS]
    let rejectQueue = false

    if (!transactions || Object.keys(transactions).length === 0) {
      return null
    }

    try {
      const currentTransaction = transactions[selectedAccount.address][net]

      // If hasn't not confirmed tx.
      if (!currentTransaction || !currentTransaction.some((tx) => !tx.confirmed)) {
        return null
      }

      const checkList = currentTransaction.map(async(tx) => {
        if (tx.confirmed) {
          return tx
        } else if (rejectQueue) {
          tx.Info = 'Queue rejected'
          tx.error = true
          tx.nonce = 0
          tx.confirmed = true

          Transaction.makeNotification(tx)

          return tx
        }

        try {
          const result = await zilliqaControl.blockchain.getTransactionStatus(tx.TranID)

          switch (result.status) {
          case 1:
            return tx
          case 2:
            tx.Info = result.statusMessage
            tx.block = result.epochUpdated
            tx.confirmed = true

            Transaction.makeNotification(tx)
            return tx
          case 3:
            tx.Info = result.statusMessage
            tx.block = result.epochUpdated
            tx.confirmed = result.success

            Transaction.makeNotification(tx)

            return tx
          default:
            rejectQueue = true
            tx.Info = result.statusMessage
            tx.error = true
            tx.confirmed = true
            tx.nonce = 0
            Transaction.makeNotification(tx)

            return tx
          }
        } catch (err) {
          return tx
        }
      })
      const provens = await Promise.all(checkList)

      transactions[selectedAccount.address][net] = provens

      await this.storage.set(
        new BuildObject(FIELDS.TRANSACTIONS, transactions)
      )
    } catch (err) {
      console.log(err)
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

  /**
   * Calculate nonce counter.
   * @param {Function} sendResponse - CallBack funtion for return response to sender.
   */
  async calculateNonce(sendResponse) {
    await networkControl.netwrokSync()

    try {
      const network = networkControl.selected
      const account = await accountControl.getCurrentAccount()
      const zilliqa = new ZilliqaControl(networkControl.provider)
      let { nonce } = await zilliqa.getBalance(account.address)
      const transactions = await this.storage.get(FIELDS.TRANSACTIONS)
      const historyTx = transactions
        && transactions[account.address]
        && transactions[account.address][network]
      const hasPendingTx = historyTx && historyTx
        .filter((tx) => Boolean(!tx.error && !tx.confirmed))
        .sort((txA, txB) => txA.nonce - txB.nonce)

      if (hasPendingTx && hasPendingTx.length !== 0) {
        const lastTx = hasPendingTx.pop()
        const pendingTx = await zilliqa.getPendingTxn(lastTx.TranID)

        if (!pendingTx.confirmed && Number(lastTx.nonce) > Number(nonce)) {
          nonce = lastTx.nonce
        }
      }

      nonce++

      if (new TypeChecker(sendResponse).isFunction) {
        sendResponse({
          resolve: nonce
        })
      }

      return nonce
    } catch (err) {
      if (new TypeChecker(sendResponse).isFunction) {
        sendResponse({
          reject: err.message
        })
      } else {
        throw new Error(err.message)
      }
    }
  }

  async signSendTx(sendResponse) {
    await networkControl.netwrokSync()

    try {
      if (!new TypeChecker(this.payload.nonce).isInt) {
        this.payload.nonce = await this.calculateNonce()
      }
    } catch {
      //
    }

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
