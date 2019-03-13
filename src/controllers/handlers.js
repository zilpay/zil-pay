import { Wallet } from '@zilliqa-js/account'
import { Loger } from '../lib/logger'
import { Auth } from './auth/main'
import { BlockChainControll } from './zilliqa'
import { TabsMessage } from '../lib/messages/messageCall'
import { MTypesTabs } from '../lib/messages/messageTypes'
import fields from '../config/fields'
import zilConfig from '../config/zil'
import { PromptService } from './services/popup'


const log = new Loger('Background.Handler');

export class Handler {
  constructor() {
    this.auth = new Auth();
  }

  async initPopup(sendResponse) {
    let isLcok;
    let selectednet = Object.keys(zilConfig)[0];
    let config = zilConfig;
    const allData = await this.auth.getAllData();
    const countKeys = Object.keys(fields).length - 1;
    const countKeysData = Object.keys(allData);
    const test = !allData.hasOwnProperty(fields.VAULT) || countKeysData < countKeys;

    if (!allData || test) {
      await this.updateConfig(config, selectednet);
      this.auth.isEnable = false;
      this.auth.isReady = false;

      sendResponse({
        reject: {
          isEnable: this.auth.isEnable,
          isReady: this.auth.isReady,
          config, selectednet
        }
      });
    } else {
      this.auth.isReady = true;

      try {
        this.auth.guard.encryptedSeed = allData.vault;
        isLcok = this.auth.guard.decryptSeed;

        if (!isLcok || isLcok.length < 12) {
          this.auth.isEnable = false;
        } else {
          this.auth.isEnable = true;
        }
      } catch(err) {
        this.auth.isEnable = false;
      }

      sendResponse({
        resolve: {
          data: allData,
          isEnable: this.auth.isEnable,
          isReady: this.auth.isReady
        }
      });
    }
    this._lockStatusUpdateTab();
  }

  async createNewWallet(sendResponse, payload) {
    let balance;
    const { selectednet } = await this.auth.getNet();
    const { config } = await this.auth.getConfig();
    const { PROVIDER } = config[selectednet];
    const blockChain = new BlockChainControll(PROVIDER);
    const { seed, password } = payload;
    const wallet = new Wallet();
    const index = 0;

    this.auth = new Auth(password);
    wallet.addByMnemonic(seed, index);
    balance = await blockChain.getBalance(wallet.defaultAccount.address);

    const account = {
      selectedAddress: index,
      identities: [{
        balance: balance.result,
        address: wallet.defaultAccount.address,
        publicKey: wallet.defaultAccount.publicKey,
        index: index
      }]
    };

    sendResponse(account);

    await this.auth.setWallet(account);
    await this.auth.createVault(seed);

    this.auth.isEnable = true;
    this.auth.isReady = true;
    this._lockStatusUpdateTab();
  }

  async getAccountBySeedIndex(sendResponse) {
    let { wallet, config, selectednet, vault } = await this.auth.getAllData();

    if (!wallet || !wallet.identities || isNaN(wallet.selectedAddress)) {
      sendResponse(null);
    } else {
      this.auth.guard.encryptedSeed = vault;
    }

    const { PROVIDER } = config[selectednet];
    const blockChain = new BlockChainControll(PROVIDER);
    const index = wallet.identities.length;
    
    try {
      const decryptSeed = this.auth.guard.decryptSeed;
      const account = await blockChain.getAccountBySeed(decryptSeed, index);

      wallet.identities.push(account);
      wallet.selectedAddress = index;

      this.auth.setWallet(wallet);
      sendResponse(wallet);
    } catch(err) {
      this.logOut();
    }
  }

  async updateConfig(config, net) {
    this.auth.setConfig(config);
    this.auth.setNet(net);
  }

  async updateNode(payload) {
    if (!payload || Object.keys(payload).length < 1) {
      return null;
    }   
    const { selectedNet } = payload;
    const { config } = await this.auth.getConfig();
    const { PROVIDER } = config[selectedNet];
    const type = MTypesTabs.NETWORK_CHANGED;

    this.auth.setNet(selectedNet);

    new TabsMessage({
      type,
      payload: { PROVIDER }
    }).send();
  }

  async walletUpdate(sendResponse, payload) {
    await this.auth.setWallet(payload.wallet);
    sendResponse(true);
    const { address } = payload.wallet.identities[
      payload.wallet.selectedAddress
    ];
    const type = MTypesTabs.ADDRESS_CHANGED;

    new TabsMessage({
      type,
      payload: { address }
    }).send();
  }

  async balanceUpdate(sendResponse) {
    let { wallet, config, selectednet } = await this.auth.getAllData();
    
    if (!wallet || !wallet.identities || isNaN(wallet.selectedAddress)) {
      sendResponse(null);
    }

    const { PROVIDER } = config[selectednet];
    const blockChain = new BlockChainControll(PROVIDER);
    const { address } = wallet.identities[wallet.selectedAddress];
    const { result } = await blockChain.getBalance(address);

    wallet.identities[wallet.selectedAddress].balance = result;

    this.auth.setWallet(wallet);

    sendResponse(wallet);
  }

  async getAddress(sendResponse) {
    const { wallet } = await this.auth.getWallet();
    if (!wallet || !wallet.identities || isNaN(wallet.selectedAddress)) {
      sendResponse(null);
    } else {
      sendResponse(
        wallet.identities[
          wallet.selectedAddress
        ]['address']
      );
    }
  }

  async getProvider(sendResponse) {
    const { config } = await this.auth.getConfig();
    const { selectednet } = await this.auth.getNet();
    const { PROVIDER } = config[selectednet];

    sendResponse({ config, selectednet, PROVIDER });
    
    return PROVIDER;
  }

  async walletUnlock(sendResponse, payload) {
    const { password } = payload;
    const status = await this.auth.verificationPassword(password);
    if (status) {
      this.auth = new Auth(password);
    }
    this.auth.isEnable = status;
    sendResponse(status);
    this._lockStatusUpdateTab();
  }

  async singCreateTransaction(sendResponse) {
    if (!this.auth.isReady || !this.auth.isEnable) {
      throw new Error(`isReady: ${this.auth.isReady}, isEnable: ${this.auth.isEnable}`);
    }

    const { confirm } = await this.auth.getConfirm();
    const { wallet, config, selectednet, vault } = await this.auth.getAllData();
    
    if (!wallet || !wallet.identities || isNaN(wallet.selectedAddress)) {
      sendResponse(null);
    } else {
      this.auth.guard.encryptedSeed = vault;
    }
    
    const { PROVIDER, MSG_VERSION } = config[selectednet];
    const blockChain = new BlockChainControll(PROVIDER);

    this.rmConfirmTx(null);

    try {
      const { result, req, error } = await blockChain.singCreateTransaction(
        confirm.pop(),
        this.auth.guard.decryptSeed,
        wallet.selectedAddress,
        MSG_VERSION
      );

      if (result) {
        let tx = Object.assign(result, req.payload.params[0]);
        tx.from = blockChain.wallet.defaultAccount.address
        this.auth.setTx(tx);
        sendResponse({ resolve: tx });
      } else {
        sendResponse({ reject: error.message });
      }
      
    } catch(err) {
      sendResponse({ reject: err.message });
      log.error(err.message);
    }
  }

  async addConfirmTx(data) {
    const tab = await TabsMessage.tabs();
    await this.auth.setConfirm(data);    
    new PromptService(tab).open();
  }
  async rmConfirmTx(sendResponse) {
    const { confirm } = await this.auth.getConfirm();
    confirm.pop();
    await this.auth.setConfirm(confirm);
    if (typeof sendResponse == 'function') {
      sendResponse(true);
    }
  }

  async _lockStatusUpdateTab() {
    const type = MTypesTabs.LOCK_STAUS;
    
    return await new TabsMessage({
      type,
      payload: {
        isEnable: this.auth.isEnable,
        isReady: this.auth.isReady
      }
    }).send();
  }

  logOut() {
    this.auth = new Auth();
    this.auth.isReady = true;
    this.auth.isEnable = false;
    this._lockStatusUpdateTab();
    // window.chrome.runtime.reload();
  }


}