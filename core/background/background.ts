/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { ZIlPayBackground } from 'core/background/wallet/bg-zilpay';
import { MTypePopup, MTypeTab } from 'lib/streem/stream-keys';
import { Runtime } from 'lib/runtime';

export function startBackground(core: ZIlPayBackground) {
  Runtime.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (sender.id !== Runtime.runtime.id) {
      sendResponse();
      return null
    }
    switch (msg.type) {
      case MTypePopup.SET_THEME:
        core.settings.changeTheme(msg.payload.theme, sendResponse);
        return true;
      case MTypePopup.RESET_THEME:
        core.settings.resetTheme(sendResponse);
        return true;
      case MTypePopup.CHANGE_CURRENCY:
        core.settings.changeCurrency(msg.payload.currency, sendResponse);
        return true;
      case MTypePopup.RESET_CURRENCY:
        core.settings.resetCurrency(sendResponse);
        return true;
      case MTypePopup.LEDGER_LOAD_ACCOUNT:
        core.wallet.loadLedgerAccount(msg.payload, sendResponse);
        return true;
      case MTypePopup.ADD_CONTACT:
        core.contacts.addContact(msg.payload.contact, sendResponse);
        return true;
      case MTypePopup.RM_CONTACT:
        core.contacts.removeContact(msg.payload.index, sendResponse);
        return true;
      case MTypeTab.GET_WALLET_DATA:
        core.apps.showWalletData(msg.domain, sendResponse);
        return true;
      case MTypeTab.CONNECT_APP:
        core.apps.addConfirm(msg.payload, sendResponse);
        return true;
      case MTypePopup.RM_APP:
        core.apps.removeApp(msg.payload.index, sendResponse);
        return true;
      case MTypePopup.CLEAR_APPS:
        core.apps.clearApps(sendResponse);
        return true;
      case MTypePopup.USER_RESPONSE_DAPP:
        core.apps.userResponse(msg.payload.confirmed, sendResponse);
        return true;
      case MTypeTab.CALL_TO_SIGN_TX:
        core.transaction.addConfirm(msg.payload, sendResponse);
        return true;
      case MTypeTab.SIGN_MESSAGE:
        /// add sign message controller for core.
        return true;
      case MTypePopup.SELECT_ACCOUNT:
        core.wallet.selectAccount(msg.payload.index, sendResponse);
        return true;
      case MTypePopup.EXPORT_QR_CODE:
        core.wallet.exportAccountQRCode(msg.payload.index, sendResponse);
        return true;
      case MTypePopup.SELECT_NETWORK:
        core.netwrok.select(msg.payload.net, sendResponse);
        return true;
      case MTypePopup.RESET_NETWROK:
        core.netwrok.reset(sendResponse);
        return true;
      case MTypePopup.SET_NET_CONFIG:
        core.netwrok.changeConfig(msg.payload, sendResponse);
        return true;
      case MTypePopup.UPDATE_SSN_LIST:
        core.netwrok.updateSSN(sendResponse);
        return true;
      case MTypePopup.SELECT_SSN:
        core.netwrok.selectFromSSN(msg.payload, sendResponse);
        return true;
      case MTypePopup.GET_ZRC2_TOKEN_INFO:
        core.zrc2.getZRC2Info(msg.payload.address, sendResponse);
        return true;
      case MTypePopup.RM_TOKEN:
        core.zrc2.removeToken(msg.payload.index, sendResponse);
        return true;
      case MTypePopup.RM_ACCOUNT:
        core.wallet.removeAccount(sendResponse);
        return true;
      case MTypePopup.ADD_ZRC2_TOKEN:
        core.zrc2.addZRC2(msg.payload, sendResponse);
        return true;
      case MTypePopup.GET_WALLET_STATE:
        core.popup.initPopup(sendResponse);
        return true;
      case MTypePopup.EXPORT_SEED:
        core.wallet.exportSeedPhrase(msg.payload.password, sendResponse);
        return true;
      case MTypePopup.ENCRYPT_WALLET:
        core.wallet.exportEncrypted(sendResponse);
        return true;
      case MTypePopup.EXPORT_PRIVATE_KEY:
        core.wallet.exportPrivateKey(msg.payload.password, sendResponse);
        return true;
      case MTypePopup.IMPORT_PRIVATE_KEY:
        core.wallet.importPrivateKey(msg.payload, sendResponse);
        return true;
      case MTypePopup.IMPORT_KEYSTORE:
        /// TODO: make a keystore method in core.
        return true;
      case MTypePopup.GET_RANDOM_SEED:
        core.popup.randomizeWords(msg.payload.length, sendResponse);
        return true;
      case MTypePopup.GET_ACCOUNT_NONCE:
        core.transaction.getNextNonce(sendResponse);
        return true;
      case MTypePopup.CREATE_ACCOUNT_BY_SEED:
        core.wallet.createAccountBySeed(msg.payload.name, sendResponse);
        return true;
      case MTypePopup.UPDATE_BALANCE:
        core.wallet.balanceUpdate(sendResponse);
        return true;
      case MTypePopup.SIGN_AND_SEND:
        core.transaction.signSendTx(
          msg.payload.index,
          msg.payload.params,
          sendResponse
        );
        return true;
      case MTypePopup.DOMAIN_RESOLVE:
        core.ud.getOwner(msg.payload.domain, sendResponse);
        return true;
      case MTypePopup.REJECT_CONFIRM_TX:
        core.transaction.rmConfirm(msg.payload.index, sendResponse);
        return true;
      case MTypePopup.REJECT_ALL_CONFIRM_TXNS:
        core.transaction.rejectAll(sendResponse);
        return true;
  
      case MTypePopup.CONFIRM_SIGN_MSG:
        /// TODO: add sign message stuff for core.
        break;
      case MTypePopup.SET_PASSWORD:
        core.popup.unlock(msg.payload.password, sendResponse);
        return true;
      case MTypePopup.LOG_OUT:
        core.popup.logout(sendResponse);
        return true;
      case MTypePopup.SET_SEED_AND_PASSWORD:
        core.popup.initSeedWallet(msg.payload, sendResponse);
        return true;
      default:
        sendResponse();
        return false;
    }
  });
}
