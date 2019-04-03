import { BrowserStorage } from '../lib/storage'
import { AccountControl } from './services/account/create'
import { NetworkControl } from './services/network/index'
import { AccountExporter } from './services/account/export'
import { AccountImporter } from './services/account/import'
import { MnemonicControl } from './services/auth/mnemonic'
import { NotificationsControl } from './services/browser/notifications'
import { PromptService } from './services/browser/popup'
import { ZilliqaControll } from './services/blockchain/zilliqa'
import fields from '../config/fields'
import { TabsMessage } from '../lib/messages/messageCall'
import { MTypesTabs } from '../lib/messages/messageTypes'


var accountControl = new AccountControl();
var networkControl = new NetworkControl();

export class WalletHandler {

  static walletStatusUpdate() {
    const type = MTypesTabs.LOCK_STAUS;
      
    return new TabsMessage({
      type,
      payload: {
        isEnable: accountControl.auth.isEnable,
        isReady: accountControl.auth.isReady
      }
    }).send();
  }

  static logOut(sendResponse) {
    accountControl = new AccountControl();
    WalletHandler.walletStatusUpdate();
    if (sendResponse && typeof sendResponse == 'function') {
      sendResponse(true);
    }
  }

  constructor(payload) {
    this.payload = payload;
  }

  async initPopup(sendResponse) {
    const storage = new BrowserStorage();

    await accountControl.auth.vaultSync();
    await networkControl.netwrokSync();
    
    if (!accountControl.auth.isReady) {
      await networkControl.changeConfig();
      await networkControl.changeNetwork(networkControl.selected);

      sendResponse({
        reject: {
          isEnable: accountControl.auth.isEnable,
          isReady: accountControl.auth.isReady,
          config: networkControl.config,
          selectednet: networkControl.selected,
          networkStatus: networkControl.status
        }
      });
      return null;
    }

    const data = await storage.get([
      fields.CONFIG,
      fields.WALLET,
      fields.SELECTED_NET,
      fields.TRANSACTIONS,
      fields.CONFIRM_TX
    ]);

    try {
      await accountControl.auth.getWallet();
    } catch(err) { }

    sendResponse({
      resolve: {
        data: data,
        isEnable: accountControl.auth.isEnable,
        isReady: accountControl.auth.isReady,
        networkStatus: networkControl.status
      }
    });
    WalletHandler.walletStatusUpdate();
  }

  async initWallet(sendResponse) {
    const { seed, password } = this.payload;
    const storage = new BrowserStorage();

    try {
      await accountControl.auth.setPassword(password);
      await accountControl.initWallet(seed);
      const wallet = await storage.get(fields.WALLET);
      sendResponse({ resolve: wallet[fields.WALLET] });
    } catch(err) {
      sendResponse({ reject: err.message });
    }
    WalletHandler.walletStatusUpdate();
  }

  async walletUnlock(sendResponse) {
    const { password } = this.payload;

    try {
      await accountControl.auth.setPassword(password);
      const status = accountControl.auth.isEnable;
      sendResponse({ resolve: status });
    } catch(err) {
      sendResponse({ reject: false });
    }
    WalletHandler.walletStatusUpdate();
  }

  async getRandomSeedPhrase(sendResponse) {
    const mnemonicControl = new MnemonicControl();
    const randomSeed = mnemonicControl.getRandomSeed;
    if (sendResponse && typeof sendResponse == 'function') {
      sendResponse({ resolve: randomSeed });
    }
    return randomSeed;
  }
}

export class AccountHandler {

  constructor(payload) {
    this.payload = payload;
  }

  async exportPrivateKey(sendResponse) {
    let account;
    const { password } = this.payload;
    const accountExporter = new AccountExporter();
    await accountExporter.auth.setPassword(password);
    const isImported = await accountExporter.isImported();

    if (isImported) {
      account = await accountExporter.exportAccountFromStore();
    } else {
      account = await accountExporter.exportPrivateKeyFromSeed();
    }

    sendResponse({ resolve: account.privateKey });
  }

  async exportSeedPhrase(sendResponse) {
    let seedPhrase;
    const { password } = this.payload;
    const accountExporter = new AccountExporter();
    
    try {
      await accountExporter.auth.setPassword(password);
      seedPhrase = await accountExporter.exportSeed();
      sendResponse({ resolve: seedPhrase.decryptSeed });
    } catch(err) {
      sendResponse({ reject: err.message });
    }
  }

  async importPrivateKey(sendResponse) {
    let wallet;
    const { privKey } = this.payload;
    const accountImporter = new AccountImporter(accountControl);

    try {
      wallet = await accountImporter.importAccountByPrivateKey(privKey);
      sendResponse({ resolve: wallet });
    } catch(err) {
      console.log(err);
      sendResponse({ reject: err.message });
    }
  }

  async createAccountBySeed(sendResponse) {
    try {
      const wallet = await accountControl.newAccountBySeed();
      sendResponse({ resolve: wallet });
    } catch(err) {
      sendResponse({ reject: err.message });
    }
  }

  async changeAddress(sendResponse) {
    const wallet = this.payload[fields.WALLET];
    const account = wallet.identities[
      wallet.selectedAddress
    ];
    const type = MTypesTabs.ADDRESS_CHANGED;

    await accountControl.walletUpdate(wallet);

    new TabsMessage({
      type,
      payload: account
    }).send();

    if (sendResponse && typeof sendResponse == 'function') {
      sendResponse(true);
    }
  }
}

export class ZilliqaHandler {

}

export class NetworkHandler {

  constructor(payload) {
    this.payload = payload;
  }

  async changeNetwork(sendResponse) {
    let payload;
    const { selectednet } = this.payload;
    const type = MTypesTabs.NETWORK_CHANGED;
    
    try {
      await networkControl.netwrokSync();
      await networkControl.changeNetwork(selectednet);
      payload = { provider: networkControl.provider };
    } catch(err) {
      payload = { reject: err.message };
    }

    new TabsMessage({ type, payload }).send();

    if (sendResponse && typeof sendResponse == 'function') {
      sendResponse(networkControl.status);
    }
  }

}

export class TransactionHandler {

  static returnTx(payload, uuid) {
    const type = MTypesTabs.TX_RESULT;

    payload.uuid = uuid;
  
    new TabsMessage({
      type, payload
    }).send();
  }

  constructor(payload) {
    this.payload = payload;
  }

}