import { MTypePopup } from "config/stream";
import type { GlobalState } from "./state";
import { Runtime } from "lib/runtime";

export function startBackground(core: GlobalState) {
  Runtime.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (sender.id !== Runtime.runtime.id) {
      sendResponse(null);
      return true;
    }

    switch (msg.type) {
      case MTypePopup.GET_GLOBAL_STATE:
        core.wallet.getGlobalState(sendResponse);
        return true;
      case MTypePopup.SET_GLOBAL_STATE:
        core.wallet.setGlobalState(msg.payload, sendResponse);
        return true;
      case MTypePopup.GEN_BIP39:
        core.wallet.genBip39Words(msg.payload.count, msg.payload.wordList, sendResponse);
        return true;
      case MTypePopup.VALIDATE_BIP39_CHECK_SUM:
        core.wallet.validateBip39CheckSum(msg.payload.phrase, msg.payload.wordList, sendResponse);
        return true;
      case MTypePopup.GEN_KEYPAIR:
        core.wallet.genKeyPair(msg.payload.slip44, sendResponse);
        return true;
      case MTypePopup.FROM_PRIV_KEY:
        core.wallet.keyPairFromPrivateKey(msg.payload.slip44, msg.payload.key, sendResponse);
        return true;
      case MTypePopup.WALLET_FROM_PRIVATE_KEY:
        core.wallet.walletFromPrivateKey(msg.payload, sendResponse);
        return true;
      case MTypePopup.WALLET_FROM_BIP39:
        core.wallet.walletFromBip39(msg.payload, sendResponse);
        return true;
      case MTypePopup.UNLOCK_WALLET:
        core.wallet.unlockWallet(msg.payload.password, msg.payload.walletIndex, sendResponse);
        return true;
      case MTypePopup.LOG_OUT:
        core.wallet.logoutWallet(msg.payload.walletIndex, sendResponse);
        return true;

      // provider
      case MTypePopup.WALLET_BALANCE_UPDATE:
        core.provider.balanceUpdate(msg.payload.walletIndex, sendResponse);
        return true;
      case MTypePopup.FT_GET_META:
        core.provider.fetchFtokenMeta(msg.payload.contract, msg.payload.walletIndex, sendResponse);
        return true;
      default:
        sendResponse(null);
        return true;
    }
  });
}
