import { validation } from '@zilliqa-js/util'
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

  async exportSeed(sendResponse, payload) {
    if (!this.auth.isReady || !this.auth.isEnable) {
      throw new Error(`isReady: ${this.auth.isReady}, isEnable: ${this.auth.isEnable}`);
    }

    try {
      const vault = await this.auth.getEncryptedSeed();
      const { password } = payload;
      this.auth = new Auth(password, vault);
      this.auth.isEnable = true;
      const decryptSeed = this.auth.guard.decryptSeed;
      sendResponse({ resolve: decryptSeed });
    } catch(err) {
      sendResponse({ reject: 'password wrong' });
    }
  }

  async exportPrivKey(sendResponse, payload) {
    let { wallet, config, selectednet, vault } = await this.auth.getAllData();

    if (!this.auth.isReady || !this.auth.isEnable) {
      throw new Error(`isReady: ${this.auth.isReady}, isEnable: ${this.auth.isEnable}`);
    }
    if (!wallet || !wallet.identities || isNaN(wallet.selectedAddress)) {
      sendResponse(null);
    } else {
      this.auth.guard.encryptedSeed = vault;
    }

    try {
      const { PROVIDER } = config[selectednet];
      const index = wallet.identities.length;
      const { password } = payload;
      this.auth = new Auth(password, vault);
      this.auth.isEnable = true;
      const decryptSeed = this.auth.guard.decryptSeed;
      const blockChain = new BlockChainControll(PROVIDER);
      await blockChain.getAccountBySeed(decryptSeed, index);
      sendResponse({ resolve: blockChain.wallet.defaultAccount.privateKey });
    } catch(err) {
      sendResponse({ reject: 'password wrong' });
    }
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

  async addAccountByPrivateKey(sendResponse, payload) {
    let account;
    const { privKey } = payload;

    if (!validation.isPrivateKey(privKey)) {
      sendResponse({ reject: 'it is not privateKey' });
      return null;
    }
    
    let { config, selectednet, wallet, importedvault } = await this.auth.get([
      fields.WALLET, fields.CONFIG, fields.SELECTED_NET, fields.VAULT_IMPORTED
    ]);
    const { PROVIDER } = config[selectednet];
    const blockChain = new BlockChainControll(PROVIDER);
    
    try {
      blockChain.wallet.addByPrivateKey(privKey);
      account = blockChain.wallet.defaultAccount;
      
      const { result } = await blockChain.getBalance(account.address);
      const index = wallet.identities.length;
      const forEnryptData = {
        index,
        privateKey: blockChain.wallet.defaultAccount.privateKey
      };
      let deryptImportedvault = this.auth.guard.decryptObject(importedvault);
      
      account = {
        index,
        balance: result,
        address: blockChain.wallet.defaultAccount.address,
        publicKey: blockChain.wallet.defaultAccount.publicKey,
        isImport: true
      };
      wallet.identities.push(account);
      wallet.selectedAddress = index;

      if (!deryptImportedvault) {
        deryptImportedvault = [forEnryptData];
      } else {
        deryptImportedvault.forEach(el => {
          if (el.privateKey == forEnryptData.privateKey) {
            throw new Error('account must be unique');
          }
        });

        deryptImportedvault.push(forEnryptData);
      }
             
      await this.auth.setImportedVault(
        this.auth.guard.encryptObject(deryptImportedvault)
      );
      await this.auth.setWallet(wallet);

      sendResponse({ resolve: wallet });
    } catch(err) {
      sendResponse({ reject: err.message });
    }
  }

  updateConfig(config, net) {
    this.auth.setConfig(config);
    this.auth.setNet(net);
  }

  async updateNode(sendResponse, payload) {
    if (!payload || Object.keys(payload).length < 1) {
      return null;
    }
    const { selectednet } = payload;
    const { config } = await this.auth.getConfig();
    const { PROVIDER } = config[selectednet];
    const type = MTypesTabs.NETWORK_CHANGED;

    await this.auth.setNet(selectednet);
    sendResponse(true);

    new TabsMessage({
      type,
      payload: { PROVIDER }
    }).send();
  }

  async walletUpdate(sendResponse, payload) {
    await this.auth.setWallet(payload.wallet);
    sendResponse(true);
    const account = payload.wallet.identities[
      payload.wallet.selectedAddress
    ];
    const type = MTypesTabs.ADDRESS_CHANGED;

    new TabsMessage({
      type,
      payload: account
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
    let account = wallet.identities[
      wallet.selectedAddress
    ];

    if (typeof sendResponse == 'function') {
      sendResponse(account);
    }
    return account;
  }

  async getProvider(sendResponse) {
    const { config } = await this.auth.getConfig();
    const { selectednet } = await this.auth.getNet();
    const { PROVIDER } = config[selectednet];

    if (typeof sendResponse == 'function') {
      sendResponse({ config, selectednet, PROVIDER });
    }
    
    return PROVIDER;
  }

  async zilPayInit(sendResponse) {
    const provider = await this.getProvider();
    const account = await this.getAddress();
    const data = {
      account, provider,
      isEnable: this.auth.isEnable
    };
    sendResponse(data);
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

  async singCreateTransaction(sendResponse, payload) {
    if (!this.auth.isReady || !this.auth.isEnable) {
      throw new Error(`isReady: ${this.auth.isReady}, isEnable: ${this.auth.isEnable}`);
    }

    const { confirm } = await this.auth.getConfirm();
    const {
      wallet,
      config,
      selectednet,
      vault,
      importedvault
    } = await this.auth.getAllData();
    
    if (!wallet || !wallet.identities || isNaN(wallet.selectedAddress)) {
      sendResponse(null);
    } else {
      this.auth.guard.encryptedSeed = vault;
    }
    
    const { PROVIDER, MSG_VERSION } = config[selectednet];
    const blockChain = new BlockChainControll(PROVIDER);
    let txForConfirm = confirm.pop();

    txForConfirm.gasLimit = payload.gasLimit;
    txForConfirm.gasPrice = payload.gasPrice;

    try {
      let seedOrPrivateKey;

      if (wallet.identities[wallet.selectedAddress]['isImport']) {
        const deryptImportedvault = this.auth.guard.decryptObject(importedvault);
        const account = deryptImportedvault.filter(el => el.index === wallet.selectedAddress)[0];
        if (!account) {
          throw new Error('account fail');
        }
        seedOrPrivateKey = account.privateKey;
      } else {
        seedOrPrivateKey = this.auth.guard.decryptSeed;
      }

      await this.auth.setConfirm(confirm);

      const { result, req, error } = await blockChain.singCreateTransaction(
        txForConfirm,
        seedOrPrivateKey,
        wallet.selectedAddress,
        MSG_VERSION
      );

      if (result) {
        let tx = Object.assign(result, req.payload.params[0]);
        tx.from = blockChain.wallet.defaultAccount.address;

        this.auth.setTx(tx, selectednet);

        if (txForConfirm.uuid) {
          this.returnTx({ resolve: tx }, txForConfirm.uuid);
        }
        
        sendResponse({ resolve: tx });
      } else {
        if (txForConfirm.uuid) {
          this.returnTx({ reject: error.message }, txForConfirm.uuid);
        }
        sendResponse({ reject: error.message });
      }
    } catch(err) {
      if (txForConfirm.uuid) {
        this.returnTx({ reject: err.message }, txForConfirm.uuid);
      }
      
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
    const txForConfirm = confirm.pop();
    
    await this.auth.setConfirm(confirm);

    this.returnTx(
      { reject: 'User rejected' },
      txForConfirm.uuid
    );
    
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

  returnTx(payload, uuid) {
    const type = MTypesTabs.TX_RESULT;

    payload.uuid = uuid;
     
    new TabsMessage({
      type, payload
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