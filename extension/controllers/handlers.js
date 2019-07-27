import { BrowserStorage } from '../../lib/storage'
import { AccountControl } from './services/account/create'
import { NetworkControl } from './services/network/index'
import { AccountExporter } from './services/account/export'
import { AccountImporter } from './services/account/import'
import { MnemonicControl } from './services/auth/mnemonic'
import { NotificationsControl } from './services/browser/notifications'
import { PromptService } from './services/browser/popup'
import { ZilliqaControl } from './services/blockchain/zilliqa'
import fields from '../../config/fields'
import zilApi from '../../config/api'
import { TabsMessage } from '../../lib/messages/messageCall'
import { MTypesTabs } from '../../lib/messages/messageTypes'


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
    const session = accountControl.auth.verificationTime;
    
    if (!session && session !== null) {
      WalletHandler.logOut();
    }

    await accountControl.auth.vaultSync();
    await networkControl.netwrokSync();
    
    if (networkControl.status === null) {
      await networkControl.checkProvider();
    }
    
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
      fields.CONFIRM_TX,
      fields.CONNECT_DAPP
    ]);

    try {
      await accountControl.auth.getWallet();
    } catch(err) {
      /* */
    }

    await accountControl.zilliqa.notificationsCounter();

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

  async changeAccountName(sendResponse) {
    const { name } = this.payload;

    try {
      await accountControl.changeAccountName(name);
      sendResponse({ resolve: true });
    } catch(err) {
      sendResponse({ reject: err.message });
    }
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

    try {
      await accountExporter.auth.setPassword(password);
      const isImported = await accountExporter.isImported();
  
      if (isImported) {
        account = await accountExporter.exportAccountFromStore();
      } else {
        account = await accountExporter.exportPrivateKeyFromSeed();
      }
  
      sendResponse({ resolve: account.privateKey });
    } catch(err) {
      sendResponse({ reject: err.message });
    }
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

  async ImportHwAccount(sendResponse) {
    const accountImporter = new AccountImporter(accountControl);

    try {
      const wallet = await accountImporter.importByHwAccount(this.payload);
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

  async connectToDapp(sendResponse) {
    try {
      await accountControl.addForConnectDapp(this.payload);
      new PromptService().open();
      sendResponse({ resolve: true });
    } catch(err) {
      sendResponse({ reject: err.message });
    }
  }
}

export class ZilliqaHandler {

  static async initZilPay(sendResponse, domain) {
    const storage = new BrowserStorage();
    const provider = networkControl.provider;
    const isConnect = await accountControl.auth.isConnect(domain);

    await networkControl.netwrokSync();
    let wallet = await storage.get(fields.WALLET);
    wallet = wallet[fields.WALLET];

    let account = wallet.identities[
      wallet.selectedAddress
    ];

    if (!isConnect) {
      account = null;
    }
    
    const data = {
      provider, account, isConnect,
      isEnable: accountControl.auth.isEnable,
      net: networkControl.selected
    };
    sendResponse(data);
  }

  static async rmAllTransactionList(sendResponse) {
    await accountControl.zilliqa.rmAllTransactionList();
    if (sendResponse && typeof sendResponse == 'function') {
      sendResponse(true);
    }
  }

  constructor(payload) {
    this.payload = payload;
  }

  async connectionToDapp(sendResponse) {
    let account = null;
    const storage = new BrowserStorage();
    const type = MTypesTabs.CONNECT_TO_DAPP;

    if (this.payload.isConfirm) {
      let wallet = await storage.get(fields.WALLET);
      wallet = wallet[fields.WALLET];
      account = wallet.identities[
        wallet.selectedAddress
      ];
      this.payload.account = { address: account.address };
    }
    
    const payload = this.payload;
    new TabsMessage({ type, payload }).send();

    if (sendResponse && typeof sendResponse == 'function') {
      sendResponse(true);
    }
  }

}

export class NetworkHandler {

  constructor(payload) {
    this.payload = payload;
  }

  async changeNetwork(sendResponse) {
    let payload;
    const selectednet = this.payload[fields.SELECTED_NET];
    const type = MTypesTabs.NETWORK_CHANGED;
    
    try {
      await networkControl.netwrokSync();
      await networkControl.changeNetwork(selectednet);
      payload = {
        provider: networkControl.provider,
        net: networkControl.selected
      };
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
    const zilliqaControl = new ZilliqaControl(
      networkControl.provider
    );

    try {
      await zilliqaControl.addForSingTransaction(
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
    const accountID = accountSelected.index;

    let transaction = data[fields.CONFIRM_TX].pop();
    
    transaction.gasLimit = this.payload.gasLimit || transaction.gasLimit;
    transaction.gasPrice = this.payload.gasPrice || transaction.gasPrice;

    try {
      await accountControl.auth.vaultSync();

      const {
        decryptImported,
        decryptSeed
      } = accountControl.auth.getWallet();

      if (accountSelected.isImport) {
        const { privateKey } = decryptImported.find(
          acc =>  acc.index === accountID
        );
        seedOrKey = privateKey;
      } else {
        seedOrKey = decryptSeed;
      }

      if (!seedOrKey) {
        throw new Error('Account Fail');
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
      const zilliqaControl = new ZilliqaControl(
        networkControl.provider
      );
      resultTx = await zilliqaControl.singTransaction(
        transaction,
        seedOrKey,
        accountID,
        lastNonce
      );
    } catch(err) {
      sendResponse({ reject: err.message });
      return null;
    }
    
    const { result, req, error } = resultTx;
    
    if (result) {
      await accountControl.zilliqa.rmForSingTransaction();
      
      let tx = result;

      tx.from = accountSelected.address;

      if (req && req.payload && req.payload.params && req.payload.params[0]) {
        Object.assign(tx, req.payload.params[0]);
      }
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
        TransactionHandler.returnTx({ reject: error.message }, transaction.uuid);
      }
      sendResponse({ reject: error.message });
    }

  }

  async buildTxParams(sendResponse) {
    const zilliqaControl = new ZilliqaControl(
      networkControl.provider
    );
    const address = this.payload.from;
    const storage = new BrowserStorage();
    let lastNonce = 0;
    let transactionsHistory = await storage.get(fields.TRANSACTIONS);
    transactionsHistory = transactionsHistory[fields.TRANSACTIONS];
    
    if (transactionsHistory && transactionsHistory[address]) {
      const lastTx = transactionsHistory[address][networkControl.selected];
      if (lastTx.length > 0 && transactionsHistory[lastTx.length - 1]) {
        lastNonce = transactionsHistory[lastTx.length - 1].nonce;
      }
    }

    try {
      const { txParams } = await zilliqaControl.buildTxParams(
        this.payload.txParams,
        address,
        lastNonce,
        ''
      );

      txParams.amount = txParams.amount.toString();
      txParams.gasLimit = txParams.gasLimit.toString();
      txParams.gasPrice = txParams.gasPrice.toString();
  
      sendResponse({ resolve: txParams });
    } catch(err) {
      sendResponse({ reject: err.message });
    }
  }

  async sendSignTx(sendResponse) {
    let resultTx;
    const zilliqaControl = new ZilliqaControl(
      networkControl.provider
    );

    try {
      const { txParams } = await zilliqaControl.transactions.new(this.payload);
      resultTx = await zilliqaControl.signedTxSend(txParams);
      await TransactionHandler.rmTransactionsConfirm();
    } catch(err) {
      sendResponse({ reject: err.message });
      return null;
    }

    const { result, req, error } = resultTx;
    
    if (result) {
      let tx = Object.assign(result, req.payload.params[0]);
      tx.from = this.payload.from;

      await accountControl.zilliqa.addTransactionList(
        tx, networkControl.selected
      );
      
      sendResponse({ resolve: tx });

      if (this.payload.uuid) {
        TransactionHandler.returnTx(
          { resolve: tx }, this.payload.uuid
        );
      }
      this._transactionListing(tx.TranID);
    } else {
      if (this.payload.uuid) {
        TransactionHandler.returnTx({ reject: error.message }, this.payload.uuid);
      }
      sendResponse({ reject: error.message });
    }
  }

  async _transactionListing(txHash) {
    const zilliqaControl = new ZilliqaControl(
      networkControl.provider
    );
    zilliqaControl.blockchain.c
    const net = `network=${networkControl.selected}`;
    const timeInterval = 4000;
    const countIntervl = 100;
    const title = 'ZilPay Transactions';
    let k = 0;

    const interval = setInterval(
      async () => {
        
        try {
          await zilliqaControl
          .blockchain
          .getTransaction(txHash);
          
          new NotificationsControl({
            url: `${zilApi.EXPLORER}/tx/0x${txHash}?${net}`,
            title: title,
            message: 'Transactions send to shard done.'
          }).create();

          clearInterval(interval);
          return null;
        } catch(err) {
          if (k > countIntervl) {
            clearInterval(interval);
            return null;
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
