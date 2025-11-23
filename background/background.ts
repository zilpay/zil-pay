import { MTypePopup } from "config/stream";
import type { GlobalState } from "./state";
import { Runtime } from "lib/runtime";
import { LegacyZilliqaTabMsg } from "lib/streem";

export function startBackground(pcore: Promise<GlobalState>) {
  Runtime.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
    if (sender.id !== Runtime.runtime.id) {
      sendResponse(null);
      return true;
    }

    const core = await pcore;

    switch (msg.type) {
      // tokens
      case MTypePopup.FT_UPDATE_RATES:
        core.token.updateRates(msg.payload.walletIndex, sendResponse);
        return true;
      case MTypePopup.NFT_GET_META:
        core.token.fetchNFTMetadata(
          msg.payload.contract,
          msg.payload.walletIndex,
          sendResponse,
        );
        return true;

      // wallet
      case MTypePopup.GET_GLOBAL_STATE:
        core.wallet.getGlobalState(sendResponse);
        return true;
      case MTypePopup.SET_GLOBAL_STATE:
        core.wallet.setGlobalState(msg.payload, sendResponse);
        return true;
      case MTypePopup.GEN_BIP39:
        core.wallet.genBip39Words(
          msg.payload.count,
          msg.payload.wordList,
          sendResponse,
        );
        return true;
      case MTypePopup.ADD_NEXT_BIP39_ACCOUNT:
        core.wallet.addAccountFromBip39(msg.payload, sendResponse);
        return true;
      case MTypePopup.ADD_LEDGER_ACCOUNT:
        core.wallet.addLedgerAccount(msg.payload.walletIndex, msg.payload.account, sendResponse);
        return true;
      case MTypePopup.SELECT_ACCOUNT:
        core.wallet.selectAccount(
          msg.payload.walletIndex,
          msg.payload.accountIndex,
          sendResponse,
        );
        return true;
      case MTypePopup.DESTROY_WALLET:
        core.wallet.removeWallet(
          msg.payload.walletIndex,
          msg.payload.password,
          sendResponse,
        );
        return true;
      case MTypePopup.DESTROY_ACCOUNT:
        core.wallet.removeAccountByAddress(
          msg.payload.addr,
          msg.payload.walletIndex,
          sendResponse,
        );
        return true;
      case MTypePopup.VALIDATE_BIP39_CHECK_SUM:
        core.wallet.validateBip39CheckSum(
          msg.payload.phrase,
          msg.payload.wordList,
          sendResponse,
        );
        return true;
      case MTypePopup.GEN_KEYPAIR:
        core.wallet.genKeyPair(msg.payload.slip44, sendResponse);
        return true;
      case MTypePopup.FROM_PRIV_KEY:
        core.wallet.keyPairFromPrivateKey(
          msg.payload.slip44,
          msg.payload.key,
          sendResponse,
        );
        return true;
      case MTypePopup.WALLET_FROM_PRIVATE_KEY:
        core.wallet.walletFromPrivateKey(msg.payload, sendResponse);
        return true;
      case MTypePopup.FROM_LEDGER_HW:
        core.wallet.walletFromLedger(msg.payload, sendResponse);
        return true;
      case MTypePopup.WALLET_FROM_WATCHED_ACCOUNT:
        core.wallet.walletFromWatchAccount(msg.payload, sendResponse);
        return true;
      case MTypePopup.WALLET_FROM_BIP39:
        core.wallet.walletFromBip39(msg.payload, sendResponse);
        return true;
      case MTypePopup.UNLOCK_WALLET:
        core.wallet.unlockWallet(
          msg.payload.password,
          msg.payload.walletIndex,
          sendResponse,
        );
        return true;
      case MTypePopup.LOG_OUT:
        core.wallet.logoutWallet(msg.payload.walletIndex, sendResponse);
        return true;
      case MTypePopup.REVEAL_BIP39:
        core.wallet.exportbip39Words(
          msg.payload.password,
          msg.payload.walletIndex,
          sendResponse,
        );
        return true;
      case MTypePopup.REVEAL_KEY:
        core.wallet.exportKeyPair(
          msg.payload.password,
          msg.payload.walletIndex,
          msg.payload.accountIndex,
          sendResponse,
        );
        return true;
      case MTypePopup.GET_ALL_ACCOUNTS_BY_CHAIN:
        core.wallet.getAllAddressesByChain(
          msg.payload.walletIndex,
          msg.payload.accountIndex,
          sendResponse,
        );
        return true;

      // provider
      case MTypePopup.WALLET_BALANCE_UPDATE:
        core.provider.balanceUpdate(msg.payload.walletIndex, sendResponse);
        return true;
      case MTypePopup.SWICH_CHAIN:
        core.provider.swichNetwork(
          msg.payload.walletIndex,
          msg.payload.chainIndex,
          sendResponse,
        );
        return true;
      case MTypePopup.FT_GET_META:
        core.provider.fetchFtokenMeta(
          msg.payload.contract,
          msg.payload.walletIndex,
          sendResponse,
        );
        return true;
      case MTypePopup.REMOVE_CHAIN:
        core.provider.removeChain(msg.payload.chainHash, sendResponse);
        return true;

      // transactions
      case MTypePopup.BUILD_TOKEN_TRANSFER:
        core.transaction.buildTokenTransfer(msg.payload, sendResponse);
        return true;
      case MTypePopup.GEN_RLP_TX:
        core.transaction.genRLPTx(
          msg.payload.confirmIndex,
          msg.payload.walletIndex,
          msg.payload.accountIndex,
          sendResponse,
          msg.payload.path,
        );
        return true;
      case MTypePopup.ESTIMATE_GAS:
        core.transaction.estimateGas(
          msg.payload.confirmIndex,
          msg.payload.walletIndex,
          msg.payload.accountIndex,
          sendResponse,
        );
        return true;
      case MTypePopup.SIGN_TX_AND_SEND:
        core.transaction.signTxAndbroadcastJsonRPC(
          msg.payload.confirmIndex,
          msg.payload.walletIndex,
          msg.payload.accountIndex,
          sendResponse,
          msg.payload.signature,
        );
        return true;
      case MTypePopup.CHECK_TRANSACTIONS_HISTORY:
        core.transaction.updateTransactionsHistory(
          msg.payload.walletIndex,
          sendResponse,
        );
        return true;
      case MTypePopup.REJECT_CONFIRM:
        core.transaction.reject(
          msg.payload.index,
          msg.payload.walletIndex,
          sendResponse,
        );
        return true;

      // content web3
      case MTypePopup.WEB3_GET_SLIP44:
        core.wallet.getCurrentSlip44(sendResponse);
        return true;

      // connections
      case MTypePopup.CONNECT_APP:
        core.connect.callConnect(msg, sendResponse);
        return true;
      case MTypePopup.DISCONNECT_WALLET:
        core.connect.disconectWallet(
          msg.payload.domain,
          msg.payload.walletIndex,
          sendResponse,
        );
        return true;
      case MTypePopup.RESPONSE_TO_DAPP:
        core.connect.responseConnect(
          msg.payload.uuid,
          msg.payload.walletIndex,
          msg.payload.approve,
          msg.payload.permissions,
          sendResponse,
        );
        return true;

      // EVM wbe3
      case MTypePopup.EVM_REQUEST:
        core.evm.handleRequest(msg, sendResponse);
        return true;
      case MTypePopup.EVM_RESPONSE_ADD_ETHEREUM_CHAIN:
        core.evm.addEthereumChainResponse(
          msg.payload.uuid,
          msg.payload.walletIndex,
          msg.payload.approve,
          sendResponse,
        );
        return true;
      case MTypePopup.EVM_RESPONSE_PERSONAL_MESSAGE:
        core.evm.responseToSignPersonalMessageEVM(
          msg.payload.uuid,
          msg.payload.walletIndex,
          msg.payload.accountIndex,
          msg.payload.approve,
          sendResponse,
          msg.payload.signature,
        );
        return true;
      case MTypePopup.EVM_RESPONSE_WATCH_ASSET:
        core.evm.addEthereumWatchAssetResponse(
          msg.payload.uuid,
          msg.payload.walletIndex,
          msg.payload.approve,
          sendResponse,
        );
        return true;
      case MTypePopup.EVM_RESPONSE_TYPED_MESSAGE:
        core.evm.responseToSignTypedDataEVM(
          msg.payload.uuid,
          msg.payload.walletIndex,
          msg.payload.accountIndex,
          msg.payload.approve,
          sendResponse,
          msg.payload.signature,
        );
        return true;

      // Legacy Web3
      case LegacyZilliqaTabMsg.GET_WALLET_DATA:
        core.zilpayLegacyWeb3.getData(msg.domain, sendResponse);
        return true;
      case LegacyZilliqaTabMsg.CONTENT_PROXY_MEHTOD:
        core.zilpayLegacyWeb3.jsonRPCProxy(
          msg.domain,
          msg.payload,
          sendResponse,
        );
        return true;
      case LegacyZilliqaTabMsg.SIGN_MESSAGE:
        core.zilpayLegacyWeb3.signMessage(
          msg.uuid,
          msg.domain,
          msg.payload.content,
          msg.payload.title,
          msg.icon,
          sendResponse,
        );
        return true;
      case LegacyZilliqaTabMsg.CALL_TO_SIGN_TX:
        core.zilpayLegacyWeb3.signTx(
          msg.uuid,
          msg.domain,
          msg.payload,
          msg.title,
          msg.icon,
          sendResponse,
        );
        return true;
      case LegacyZilliqaTabMsg.SING_MESSAGE_RES:
        core.zilpayLegacyWeb3.signMessageRes(
          msg.payload.uuid,
          msg.payload.walletIndex,
          msg.payload.accountIndex,
          msg.payload.approve,
          sendResponse,
          msg.payload.signature,
        );
        return true;

      default:
        sendResponse(null);
        return true;
    }
  });
}
