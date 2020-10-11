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
  Message,
  MTypePopup,
  MTypeTab
} from 'lib/stream'
import {
  Popup,
  Zilliqa,
  Domains,
  Transaction,
  Wallet, Network
} from './controllers'

export class Background {

  constructor() {
    this._watchInternalMessaging()
    Transaction.listingBlockchain()
    new Transaction().checkAllTransaction()
    Zilliqa.addDefaultTokens()
  }

  _watchInternalMessaging() {
    LocalStream.watch((request, response) => {
      const message = new Message(request)

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

    case MTypePopup.SET_PROXY_STORAGE:
      new Popup(message.payload).setDataFromPopup(sendResponse)
      break

    case MTypePopup.PUT_WALLET:
      new Wallet(message.payload).changeWallet(sendResponse)
      break

    case MTypePopup.SET_NETWORK:
      new Network(message.payload).changeNetwork(sendResponse)
      break

    case MTypePopup.GET_TOKEN_INFO:
      new Zilliqa(message.payload).getZRCTokenInfo(sendResponse)
      break

    case MTypePopup.RM_TOKEN:
      new Zilliqa(message.payload).rmZRCToken(sendResponse)
      break

    case MTypePopup.INIT_TOKEN:
      new Zilliqa(message.payload).toDefaulTokens(sendResponse)
      break

    case MTypePopup.SET_TOKEN:
      new Zilliqa(message.payload).addZRCToken(sendResponse)
      break

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

    case MTypePopup.IMPORT_KEYSTORE:
      new Wallet(message.payload).importKeyStore(sendResponse)
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

    case MTypePopup.SIGN_AND_SEND:
      new Transaction(message.payload).signSendTx(sendResponse)
      break

    case MTypePopup.DOMAIN_RESOLVE:
      new Domains(message.payload).getUdOwnerByDomain(sendResponse)
      break

    case MTypePopup.REJECT_CONFIRM_TX:
      Transaction.rmTransactionsConfirm(sendResponse)
      break

    case MTypePopup.CONFIRM_SIGN_MSG:
      new Wallet(message.payload).confirmSignMsg(sendResponse)
      break

    case MTypePopup.BUILD_TX_PARAMS:
      new Transaction(message.payload).buildTxParams(sendResponse)
      break

    case MTypePopup.GET_GAS_PRICE:
      new Zilliqa().getMinGasPrice(sendResponse)
      break

    case MTypePopup.GET_TOKEN_RATE:
      new Zilliqa().getZilSwapTokens(sendResponse)
      break

    default:
      break
    }
  }

  _contentDispenseMessage(sendResponse, message) {
    switch (message.type) {

    case MTypeTab.GET_WALLET_DATA:
      Zilliqa.initInpage(sendResponse, message.domain)
      break

    case MTypeTab.CONNECT_APP:
      new Wallet(message.payload).connectToDapp(sendResponse)
      break

    case MTypeTab.RESPONSE_TO_DAPP:
      new Wallet(message.payload).isConnectionDapp(sendResponse)
      break

    case MTypeTab.CALL_TO_SIGN_TX:
      message.payload.domain = message.domain
      new Transaction(message.payload).callTransaction(sendResponse)
      break

    case MTypeTab.SIGN_MESSAGE:
      message.payload.domain = message.domain
      new Wallet(message.payload).signMessage(sendResponse)
      break

    default:
      break
    }
  }

}
