import { LocalStream } from 'extension-streams'
import { MTypesInternal, MTypesZilPay, MTypesAuth } from '../../lib/messages/messageTypes'
import { SecureMessage } from '../../lib/messages/messageCall'
import {
  WalletHandler,
  NetworkHandler,
  AccountHandler,
  ZilliqaHandler,
  TransactionHandler
} from './handlers'


export class Background {

  constructor() {
    this._watchInternalMessaging();
  }

  _watchInternalMessaging() {
    LocalStream.watch((request, response) => {
      const message = new SecureMessage(request);
      this._dispenseMessage(response, message);
    });
  }

  async _dispenseMessage(sendResponse, message) {
    if (!message) {
      return null;
    }

    this._authDispenseMessage(sendResponse, message);
    this._popupDispenseMessage(sendResponse, message);
    this._contentDispenseMessage(sendResponse, message);
  }

  _authDispenseMessage(sendResponse, message) {
    switch (message.type) {
      case MTypesAuth.SET_PASSWORD:
        new WalletHandler(message.payload).walletUnlock(sendResponse);
        break;
      
      case MTypesAuth.LOG_OUT:
        WalletHandler.logOut(sendResponse);
        break;

      case MTypesAuth.SET_SEED_AND_PWD:
        new WalletHandler(message.payload).initWallet(sendResponse);
        break;

      default:
        break;
    }
  }

  _popupDispenseMessage(sendResponse, message) {
    switch (message.type) {

      case MTypesInternal.INIT:
        new WalletHandler().initPopup(sendResponse);
        break;

      case MTypesInternal.SET_NET:
        new NetworkHandler(message.payload).changeNetwork(sendResponse);
        break;

      case MTypesAuth.EXPORT_SEED:
        new AccountHandler(message.payload).exportSeedPhrase(sendResponse);
        break;

      case MTypesAuth.EXPORT_PRIV_KEY:
        new AccountHandler(message.payload).exportPrivateKey(sendResponse);
        break;

      case MTypesAuth.IMPORT_PRIV_KEY:
        new AccountHandler(message.payload).importPrivateKey(sendResponse);
        break;

      case MTypesInternal.GET_DECRYPT_SEED:
        new WalletHandler().getRandomSeedPhrase(sendResponse);
        break;

      case MTypesInternal.CHANGE_ACCOUNT:
        new AccountHandler(message.payload).changeAddress(sendResponse);
        break;

      case MTypesInternal.CREATE_ACCOUNT:
        new AccountHandler().createAccountBySeed(sendResponse);
        break;

      case MTypesInternal.GET_ALL_TX:
        TransactionHandler.getTransactionsList(sendResponse);
        break;
    
      case MTypesInternal.UPDATE_BALANCE:
        new AccountHandler().balanceUpdate(sendResponse);
        break;
      
      case MTypesInternal.CONFIG_UPDATE:
        new NetworkHandler(message.payload).changeConfig(sendResponse);
        break;

      case MTypesZilPay.REJECT_CONFIRM_TX:
        TransactionHandler.rmTransactionsConfirm(sendResponse);
        break;

      case MTypesZilPay.CONFIRM_TX:
        new TransactionHandler(message.payload).buildTransaction(sendResponse);
        break;

      case MTypesInternal.ACC_CHANGE_NAME:
        new WalletHandler(message.payload).changeAccountName(sendResponse);
        break;

      case MTypesInternal.CLEAR_HISTORY_TX:
        ZilliqaHandler.rmAllTransactionList(sendResponse);
        break;

      default:
        break;
    }
  }

  _contentDispenseMessage(sendResponse, message) {
    switch (message.type) {
      
      case MTypesZilPay.INIT_DATA:
        ZilliqaHandler.initZilPay(sendResponse);
        break;

      case MTypesZilPay.CALL_SIGN_TX:
        message.payload.domain = message.domain;
        new TransactionHandler(message.payload).callTransaction(sendResponse);
        break;

      default:
        break;
    }
  }

}

export default new Background();
