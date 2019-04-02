import { Auth } from './services/auth/index'
import { BrowserStorage } from '../lib/storage'
import { AccountCreater } from './services/account/create'
import { NetworkControl } from './services/network/index'
import { NotificationsControl } from './services/browser/notifications'
import { PromptService } from './services/browser/popup'
import { ZilliqaControll } from './services/blockchain/zilliqa'
import fields from '../config/fields'


var accountControl;

export class WalletHandler {

  constructor(payload) {
    this.payload = payload;
  }

  async initPopup(sendResponse) {
    const auth = new Auth();
    const net = new NetworkControl();
    const storage = new BrowserStorage();

    await auth.vaultSync();
    await net.netwrokSync();
    
    if (!auth.isReady) {
      await net.changeConfig();
      await net.changeNetwork(net.selected);

      sendResponse({
        reject: {
          isEnable: auth.isEnable,
          isReady: auth.isReady,
          config: net.config,
          selectednet: net.selected
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
      await auth.getWallet();
    } catch(err) { }

    sendResponse({
      resolve: {
        data: data,
        isEnable: auth.isEnable,
        isReady: auth.isReady
      }
    });
  }

  async createNewWallet(sendResponse) {
    const { seed, password } = this.payload;
    const storage = new BrowserStorage();
    accountControl = new AccountCreater(password);
    await accountControl.initWallet(seed);
    const wallet = await storage.get(fields.WALLET);
    sendResponse(wallet[fields.WALLET]);
  }
}

export class AccountHandler {

}

export class ZilliqaHandler {

}

export class NetworkHandler {

}
