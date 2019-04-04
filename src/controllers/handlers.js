import { BrowserStorage } from '../lib/storage'
import { AccountControl } from './services/account/create'
import { NetworkControl } from './services/network/index'
import { AccountExporter } from './services/account/export'
import { AccountImporter } from './services/account/import'
import { MnemonicControl } from './services/auth/mnemonic'
import { NotificationsControl } from './services/browser/notifications'
import { PromptService } from './services/browser/popup'
import { ZilliqaControl } from './services/blockchain/zilliqa'
import fields from '../config/fields'
import zilApi from '../config/api'
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

  async balanceUpdate(sendResponse) {
    const storage = new BrowserStorage();
    const zilliqa = new ZilliqaControl(networkControl.provider);

    let wallet = await storage.get(fields.WALLET);
    wallet = wallet[fields.WALLET];

    try {
      const { address } = wallet.identities[wallet.selectedAddress];
      const { result } = await zilliqa.getBalance(address);
  
      wallet.identities[wallet.selectedAddress].balance = result;
      await accountControl.walletUpdate(wallet);
      sendResponse({ resolve: wallet });
    } catch(err) {
      sendResponse({ reject: err.message });
    }
  }
}

export class ZilliqaHandler {

  static async initZilPay(sendResponse) {
    const storage = new BrowserStorage();
    const provider = networkControl.provider;

    let wallet = await storage.get(fields.WALLET);
    wallet = wallet[fields.WALLET];

    const account = wallet.identities[
      wallet.selectedAddress
    ];
    const data = {
      account, provider,
      isEnable: accountControl.auth.isEnable
    };
    sendResponse(data);
  }

  constructor(payload) {
    this.payload = payload;
  }

}

export class NetworkHandler {

  static getNetwork(sendResponse) {
    const config = networkControl.config;
    const provider = networkControl.provider;
    const data = { config, selectednet, provider };

    if (sendResponse && typeof sendResponse == 'function') {
      sendResponse(data);
    }
    
    return data;
  }

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

  async changeConfig(sendResponse) {
    const config = this.payload[fields.CONFIG];
    
    try {
      await networkControl.changeConfig(config);
      sendResponse({ resolve: true });
    } catch(err) {
      sendResponse({ reject: err.message });
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

  static async getTransactionsList(sendResponse) {
    let transactions;
    const storage = new BrowserStorage();

    try {
      transactions = await storage.get(fields.TRANSACTIONS);
      transactions = transactions[fields.TRANSACTIONS];
    } catch(err) {
      transactions = {};
    }

    if (sendResponse && typeof sendResponse == 'function') {
      sendResponse(transactions);
    }

    return transactions;
  }

  static async rmTransactionsConfirm(sendResponse) {
    const removed = await accountControl.zilliqa.rmForSingTransaction();

    TransactionHandler.returnTx(
      { reject: 'User rejected' },
      removed.uuid
    );

    if (sendResponse && typeof sendResponse == 'function') {
      sendResponse(true);
    }
  }

  constructor(payload) {
    this.payload = payload;
  }

  async callTransaction(sendResponse) {
    const ZilliqaControl = new ZilliqaControl(
      networkControl.provider
    );

    try {
      await ZilliqaControl.addForSingTransaction(
        this.payload
      );
      new PromptService().open();
      sendResponse({ resolve: true });
    } catch(err) {
      sendResponse({ reject: err.message });
    }
  }

  async buildTransaction(sendResponse) {
    let resultTx;
    let seedOrKey;
    let lastNonce;
    const storage = new BrowserStorage();
    const data = await storage.get([
      fields.CONFIRM_TX,
      fields.WALLET,
      fields.TRANSACTIONS
    ]);
    const txList = data[fields.TRANSACTIONS];
    const wallet = data[fields.WALLET];
    const index = wallet.selectedAddress;
    const accountSelected = wallet.identities[index];
    const address = accountSelected.address;

    let transaction = data[fields.CONFIRM_TX].pop();
    transaction.gasLimit = this.payload.gasLimit;
    transaction.gasPrice = this.payload.gasPrice;

    try {
      await accountControl.auth.vaultSync();

      const {
        decryptImported,
        decryptSeed
      } = accountControl.auth.getWallet();

      if (accountSelected.isImport) {
        const [{ privateKey }] = decryptImported.filter(
          acc => acc.index === wallet.selectedAddress
        );
        seedOrKey = privateKey;
      } else {
        seedOrKey = decryptSeed;
      }
      
    } catch(err) {
      sendResponse({ reject: err.message });
      return null;
    }

    const isTxList = txList
      && txList[address]
      && txList[address][networkControl.selected];

    if (isTxList) {
      const lastTx = txList[address][networkControl.selected];
      lastNonce = lastTx[lastTx.length - 1].nonce;
    }

    try {
      const ZilliqaControl = new ZilliqaControl(
        networkControl.provider
      );
      await accountControl.zilliqa.rmForSingTransaction();

      resultTx = await ZilliqaControl.singTransaction(
        transaction,
        seedOrKey,
        index,
        lastNonce,
        networkControl.version
      );
    } catch(err) {
      sendResponse({ reject: err.message });
      return null;
    }

    const { result, req, error } = resultTx;
    
    if (result) {
      let tx = Object.assign(result, req.payload.params[0]);
      tx.from = accountSelected.address;

      await accountControl.zilliqa.addTransactionList(
        tx, networkControl.selected
      );
      
      sendResponse({ resolve: tx });

      if (transaction.uuid) {
        TransactionHandler.returnTx(
          { resolve: tx }, transaction.uuid
        );
      }
      this._transactionListing(tx.TranID);
    } else {
      if (transaction.uuid) {
        this.returnTx({ reject: error.message }, transaction.uuid);
      }
      sendResponse({ reject: error.message });
    }

  }

  async _transactionListing(txHash) {
    const zilliqaControl = new ZilliqaControl(
      networkControl.provider
    );
    const net = networkControl.selected;
    const timeInterval = 4000;
    const countIntervl = 10;
    const title = 'ZilPay Transactions';
    let k = 0;

    const interval = setInterval(
      async () => {
        
        try {
          await zilliqaControl
          .blockchain
          .getTransaction(txHash);
          
          new NotificationsControl({
            url: `${zilApi.EXPLORER[net]}/transactions/${txHash}`,
            title: title,
            message: 'Transactions send to shard done.'
          }).create();

          clearInterval(interval);
        } catch(err) {
          if (k > countIntervl) {

            new NotificationsControl({
              url: `${zilApi.EXPLORER[net]}/transactions/${txHash}`,
              title: title,
              message: 'Transactions not completed'
            }).create();

            clearInterval(interval);
          }
        }

        if (k > countIntervl) {
          clearInterval(interval);
        }

        k++;
      },
      timeInterval
    );
  }

}
