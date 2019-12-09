/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { LocalStream } from 'extension-streams'
import { MTypesInternal, MTypesZilPay, MTypesAuth, MTypesSecure } from '../../lib/messages/messageTypes'
import { SecureMessage } from '../../lib/messages/messageCall'
import {
  WalletHandler,
  AccountHandler,
  ZilliqaHandler,
  TransactionHandler,
  UnstoppableDomainsHandler,
} from './handlers'

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
    case MTypesAuth.SET_PASSWORD:
      new WalletHandler(message.payload).walletUnlock(sendResponse)
      break

    case MTypesAuth.LOG_OUT:
      WalletHandler.logOut(sendResponse)
      break

    case MTypesAuth.SET_SEED_AND_PWD:
      new WalletHandler(message.payload).initWallet(sendResponse)
      break

    default:
      break
    }
  }

  _popupDispenseMessage(sendResponse, message) {
    switch (message.type) {

    case MTypesInternal.INIT:
      new WalletHandler().initPopup(sendResponse)
      break

    case MTypesAuth.EXPORT_SEED:
      new AccountHandler(message.payload).exportSeedPhrase(sendResponse)
      break

    case MTypesAuth.EXPORT_PRIV_KEY:
      new AccountHandler(message.payload).exportPrivateKey(sendResponse)
      break

    case MTypesAuth.IMPORT_PRIV_KEY:
      new AccountHandler(message.payload).importPrivateKey(sendResponse)
      break

    case MTypesAuth.IMPORT_BY_HW:
      new AccountHandler(message.payload).ImportHwAccount(sendResponse)
      break

    case MTypesInternal.GET_DECRYPT_SEED:
      new WalletHandler().getRandomSeedPhrase(sendResponse)
      break

    case MTypesInternal.CREATE_ACCOUNT:
      new AccountHandler().createAccountBySeed(sendResponse)
      break

    case MTypesInternal.GET_ALL_TX:
      TransactionHandler.getTransactionsList(sendResponse)
      break

    case MTypesInternal.UPDATE_BALANCE:
      new AccountHandler().balanceUpdate(sendResponse)
      break

    case MTypesZilPay.BUILD_TX_PARAMS:
      new TransactionHandler(message.payload).buildTxParams(sendResponse)
      break

    case MTypesZilPay.SEND_SIGN_TX:
      new TransactionHandler(message.payload).sendSignTx(sendResponse)
      break

    case MTypesInternal.GET_UD_OWNER:
      new UnstoppableDomainsHandler(message.payload).getUdOwnerByDomain(sendResponse)
      break

    default:
      break
    }
  }

  _contentDispenseMessage(sendResponse, message) {
    switch (message.type) {

    case MTypesZilPay.INIT_DATA:
      ZilliqaHandler.initZilPay(sendResponse, message.domain)
      break

    case MTypesSecure.CONNECT:
      new AccountHandler(message.payload).connectToDapp(sendResponse)
      break

    case MTypesZilPay.CALL_SIGN_TX:
      message.payload.domain = message.domain
      new TransactionHandler(message.payload).callTransaction(sendResponse)
      break

    default:
      break
    }
  }

}
// @TODO list of for delete don't needed func.
// ZilliqaHandler.rmAllTransactionList(sendResponse)
// changeAccountName(sendResponse)
// TransactionHandler(message.payload).buildTransaction(sendResponse)
// ZilliqaHandler(message.payload).connectionToDapp(sendResponse)
// TransactionHandler.rmTransactionsConfirm(sendResponse)
// NetworkHandler(message.payload).changeConfig(sendResponse)
// AccountHandler(message.payload).changeAddress(sendResponse)
// NetworkHandler(message.payload).changeNetwork(sendResponse)
