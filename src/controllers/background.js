import { LocalStream } from 'extension-streams'
import { MTypesInternal, MTypesZilPay, MTypesAuth } from '../lib/messages/messageTypes'
import { SecureMessage } from '../lib/messages/messageCall'
import { Handler } from './handlers'
import { Loger } from '../lib/logger'


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
        this.walletUnlock(sendResponse, message.payload);
        break;
      
      case MTypesAuth.LOG_OUT:
        this.logOut();
        break;

      case MTypesAuth.SET_SEED_AND_PWD:
        this.createNewWallet(sendResponse, message.payload);
        break;

      default:
        return null;
    }
  }

  _popupDispenseMessage(sendResponse, message) {
    switch (message.type) {

      case MTypesInternal.INIT:
        this.initPopup(sendResponse);
        break;

      case MTypesInternal.SET_NET:
        this.updateNode(message.payload);
        break;

      case MTypesInternal.GET_DECRYPT_SEED:
        sendResponse({ resolve: this.auth.mnemonic.getRandomSeed });
        break;

      case MTypesZilPay.GET_CONFIRM_TX:
        this.auth.getConfirm().then(sendResponse);
        break;

      case MTypesInternal.CHANGE_ACCOUNT:
        this.walletUpdate(sendResponse, message.payload);
        break;

      case MTypesInternal.CREATE_ACCOUNT:
        this.getAccountBySeedIndex(sendResponse);
        break;

      case MTypesInternal.GET_ALL_TX:
        this.auth.getTxs().then(sendResponse);
        break;
    
      case MTypesInternal.UPDATE_BALANCE:
        this.balanceUpdate(sendResponse);
        break;

      case MTypesZilPay.REJECT_CONFIRM_TX:
        this.rmConfirmTx(sendResponse);
        break;

      case MTypesZilPay.CONFIRM_TX:
        this.singCreateTransaction(sendResponse);
        break;

      default:
        return null;
    }
  }

  _contentDispenseMessage(sendResponse, message) {
    switch (message.type) {
      
      case MTypesZilPay.CALL_SIGN_TX:
        this.addConfirmTx(message.payload);
        break;

      case MTypesInternal.GET_NETWORK:
        this.getProvider(sendResponse);
        break;
      
      case MTypesInternal.GET_ADDRESS:
        this.getAddress(sendResponse);
        break;
      
      case MTypesInternal.SIGN_SEND_TRANSACTION:
        this.signSendTransaction(sendResponse, message.payload);
        break;
    

      default:
        return null;
    }
  }

}

export default new Background();
