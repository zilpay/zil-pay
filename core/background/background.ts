/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { ZIlPayBackground } from 'core/background/wallet/bg-zilpay';
import type { ReqBody } from 'lib/streem/message';

import { localStream, SendResponse } from 'lib/streem/local-stream';
import { MTypePopup, MTypeTab } from 'lib/streem/stream-keys';

export function startBackground(core: ZIlPayBackground) {
  const authDispenseMessage = async (msg: ReqBody, sendResponse: SendResponse) => {
    switch (msg.type) {
      case MTypePopup.SET_PASSWORD:
        await core.popup.unlock(msg.payload.password, sendResponse);
        break;
      case MTypePopup.LOG_OUT:
        await core.popup.logout(sendResponse);
        break;
      case MTypePopup.SET_SEED_AND_PASSWORD:
        core.popup.initSeedWallet(msg.payload, sendResponse);
        break;
      default:
        break;
      }
  };
  const popupDispenseMessage = async (msg: ReqBody, sendResponse: SendResponse) => {
    switch (msg.type) {
      case MTypePopup.SELECT_ACCOUNT:
        await core.wallet.selectAccount(msg.payload.index, sendResponse);
        break;
      case MTypePopup.SELECT_NETWORK:
        await core.netwrok.select(msg.payload.net, sendResponse);
        break
      case MTypePopup.UPDATE_SSN_LIST:
        await core.netwrok.updateSSN(sendResponse);
        break;
      case MTypePopup.GET_ZRC2_TOKEN_INFO:
        core.zrc2.getZRC2Info(msg.payload.address, sendResponse);
        break;
      case MTypePopup.RM_TOKEN:
        core.zrc2.removeToken(msg.payload.index, sendResponse);
        break;
      case MTypePopup.ADD_ZRC2_TOKEN:
        core.zrc2.addZRC2(msg.payload, sendResponse);
        break;
      case MTypePopup.GET_WALLET_STATE:
        core.popup.initPopup(sendResponse);
        break;
      case MTypePopup.EXPORT_SEED:
        await core.wallet.exportSeedPhrase(sendResponse);
        break;
      case MTypePopup.ENCRYPT_WALLET:
        core.wallet.exportEncrypted(sendResponse);
        break;
      case MTypePopup.EXPORT_PRIVATE_KEY:
        await core.wallet.exportPrivateKey(sendResponse);
        break;
      case MTypePopup.IMPORT_PRIVATE_KEY:
        await core.wallet.importPrivateKey(msg.payload, sendResponse);
        break;
      case MTypePopup.IMPORT_KEYSTORE:
        /// TODO: make a keystore method in core.
        break;
      case MTypePopup.GET_RANDOM_SEED:
        core.popup.randomizeWords(msg.payload.length, sendResponse);
        break
      case MTypePopup.GET_ACCOUNT_NONCE:
        await core.transaction.getNextNonce(sendResponse);
        break;
      case MTypePopup.CREATE_ACCOUNT_BY_SEED:
        await core.wallet.createAccountBySeed(msg.payload.name, sendResponse);
        break;
      case MTypePopup.UPDATE_BALANCE:
        await core.wallet.balanceUpdate(sendResponse);
        break;
      case MTypePopup.SIGN_AND_SEND:
        await core.transaction.signSendTx(
          msg.payload.index,
          msg.payload.params,
          sendResponse
        );
        break;
      case MTypePopup.DOMAIN_RESOLVE:
        await core.ud.getOwner(msg.payload.domain, sendResponse);
        break;
      case MTypePopup.REJECT_CONFIRM_TX:
        await core.transaction.rmConfirm(msg.payload.index, sendResponse);
        break;
      case MTypePopup.REJECT_ALL_CONFIRM_TXNS:
        await core.transaction.rejectAll(sendResponse);
        break;
  
      case MTypePopup.CONFIRM_SIGN_MSG:
        /// TODO: add sign message stuff for core.
        break
      default:
        break
      }
  };
  const contentDispenseMessage = async (msg: ReqBody, sendResponse: SendResponse) => {
    switch (msg.type) {
      case MTypeTab.GET_WALLET_DATA:
        /// TODO: add get wallet data for inpage.js
        break;
      case MTypeTab.CONNECT_APP:
        await core.apps.addConfirm(msg.payload, sendResponse);
        break;
      case MTypeTab.IS_CONNECTED_APP:
        /// TODO: add info about connection app.
        break
      case MTypeTab.CALL_TO_SIGN_TX:
        await core.transaction.addConfirm(msg.payload, sendResponse);
        break;
  
      case MTypeTab.SIGN_MESSAGE:
        /// add sign message controller for core.
        break;
      default:
        break
      }
  };

  localStream(async(req, sendResponse) => {
    if (!req || req.type) {
      return null;
    }

    try {
      await authDispenseMessage(req, sendResponse);
      await popupDispenseMessage(req, sendResponse);
      await contentDispenseMessage(req, sendResponse);
    } catch (err) {
      console.error(err);
    }
  });
}
