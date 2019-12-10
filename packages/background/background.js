/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { LocalStream } from 'lib/stream'
import {
  SecureMessage,
  MTypePopup,
  MTypeTab
} from '../../lib/stream'
import {
  Popup,
  Zilliqa,
  Domains,
  Transaction,
  Wallet
} from './controllers'

export class Background {

  constructor() {
    this._watchInternalMessaging()
  }

  _watchInternalMessaging() {
    LocalStream.watch((request, response) => {
      const message = new SecureMessage(request)

      this._dispenseMessage(response, message)
    })
  }

  async _dispenseMessage(sendResponse, message) {
    if (!message) {
      return null
    }

    this._authDispenseMessage(sendResponse, message)
    this._popupDispenseMessage(sendResponse, message)
    this._contentDispenseMessage(sendResponse, message)
  }

  _authDispenseMessage(sendResponse, message) {
    switch (message.type) {
    case MTypePopup.SET_PASSWORD:
      new Popup(message.payload).walletUnlock(sendResponse)
      break

    case MTypePopup.LOG_OUT:
      Popup.logOut(sendResponse)
      break

    case MTypePopup.SET_SEED_AND_PASSWORD:
      new Popup(message.payload).initWallet(sendResponse)
      break

    default:
      break
    }
  }

  _popupDispenseMessage(sendResponse, message) {
    switch (message.type) {

    case MTypePopup.POPUP_INIT:
      new Popup().initPopup(sendResponse)
      break

    case MTypePopup.EXPORT_SEED:
      new Wallet(message.payload).exportSeedPhrase(sendResponse)
      break

    case MTypePopup.EXPORT_PRIVATE_KEY:
      new Wallet(message.payload).exportPrivateKey(sendResponse)
      break

    case MTypePopup.IMPORT_PRIVATE_KEY:
      new Wallet(message.payload).importPrivateKey(sendResponse)
      break

    case MTypePopup.IMPORT_BY_HARDWARE:
      new Wallet(message.payload).ImportHwAccount(sendResponse)
      break

    case MTypePopup.GET_RANDOM_SEED:
      new Popup().getRandomSeedPhrase(sendResponse)
      break

    case MTypePopup.CREATE_ACCOUNT_BY_SEED:
      new Wallet().createAccountBySeed(sendResponse)
      break

    case MTypePopup.UPDATE_BALANCE:
      new Wallet().balanceUpdate(sendResponse)
      break

    case MTypePopup.BUILD_TX_PARAMS:
      new Transaction(message.payload).buildTxParams(sendResponse)
      break

    case MTypePopup.SET_SEED_AND_PASSWORD:
      new Transaction(message.payload).sendSignTx(sendResponse)
      break

    case MTypePopup.DOMAIN_RESOLVE:
      new Domains(message.payload).getUdOwnerByDomain(sendResponse)
      break

    default:
      break
    }
  }

  _contentDispenseMessage(sendResponse, message) {
    switch (message.type) {

    case MTypeTab.GET_WALLET_DATA:
      Zilliqa.initZilPay(sendResponse, message.domain)
      break

    case MTypeTab.CONNECT_APP:
      new Wallet(message.payload).connectToDapp(sendResponse)
      break

    case MTypeTab.CALL_TO_SIGN_TX:
      message.payload.domain = message.domain
      new Transaction(message.payload).callTransaction(sendResponse)
      break

    default:
      break
    }
  }

}
// @TODO list of for delete don't needed func.
// Zilliqa.rmAllTransactionList(sendResponse)
// changeAccountName(sendResponse)
// Transaction(message.payload).buildTransaction(sendResponse)
// Zilliqa(message.payload).connectionToDapp(sendResponse)
// Transaction.rmTransactionsConfirm(sendResponse)
// NetworkHandler(message.payload).changeConfig(sendResponse)
// Wallet(message.payload).changeAddress(sendResponse)
// NetworkHandler(message.payload).changeNetwork(sendResponse)
