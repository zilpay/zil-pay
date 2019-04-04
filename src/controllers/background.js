import { LocalStream } from 'extension-streams'
import { MTypesInternal, MTypesZilPay, MTypesAuth } from '../lib/messages/messageTypes'
import { SecureMessage } from '../lib/messages/messageCall'
import { Handler } from './handlers'
import { Loger } from '../lib/logger'
import {
  WalletHandler,
  NetworkHandler,
  AccountHandler
} from './handlers_2.0'


const log = new Loger('Background');

export class Background extends Handler  {

  constructor() {
    super();
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

      case MTypesZilPay.GET_CONFIRM_TX:
        this.auth.getConfirm().then(sendResponse);
        break;

      case MTypesInternal.CHANGE_ACCOUNT:
        new AccountHandler(message.payload).changeAddress(sendResponse);
        break;

      case MTypesInternal.CREATE_ACCOUNT:
        new AccountHandler().createAccountBySeed(sendResponse);
        break;

      case MTypesInternal.GET_ALL_TX:
        this.auth.getTxs().then(sendResponse);
        break;
    
      case MTypesInternal.UPDATE_BALANCE:
        new AccountHandler().balanceUpdate(sendResponse);
        break;
      
      case MTypesInternal.CONFIG_UPDATE:
        new NetworkHandler(message.payload).changeConfig(sendResponse);
        break;

      case MTypesZilPay.REJECT_CONFIRM_TX:
        this.rmConfirmTx(sendResponse);
        break;

      case MTypesZilPay.CONFIRM_TX:
        this.singCreateTransaction(sendResponse, message.payload);
        break;

      default:
        break;
    }
  }

  _contentDispenseMessage(sendResponse, message) {
    switch (message.type) {
      
      case MTypesZilPay.INIT_DATA:
        this.zilPayInit(sendResponse);
        break;

      case MTypesZilPay.CALL_SIGN_TX:
        this.addConfirmTx(message.payload);
        sendResponse(true);
        break;

      case MTypesInternal.GET_NETWORK:
        this.getProvider(sendResponse);
        break;
      
      case MTypesInternal.GET_ADDRESS:
        this.getAddress(sendResponse);
        break;

      default:
        break;
    }
  }

}

export default new Background();
