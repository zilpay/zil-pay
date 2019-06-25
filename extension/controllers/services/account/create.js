import { Auth } from '../auth/index'
import { ZilliqaControl } from '../blockchain/zilliqa'
import { NetworkControl } from '../network/index'
import { BrowserStorage, BuildObject } from '../../../../lib/storage'
import fields from '../../../../config/fields'
import errorsCode from './errors'
import errorsCodeGuard from '../auth/errors'


const MAX_LENGTH_NAME = 20;

export class AccountControl {

  constructor() {
    this._storage = new BrowserStorage();
    this.network = new NetworkControl();
    this.zilliqa = new ZilliqaControl(this.network.provider);
    this.auth = new Auth();
  }

  async initWallet(decryptSeed) {
    /**
     * Initial new wallet by seed phase.
     * @interface decryptSeed: String.
     */
    this.zilliqa = new ZilliqaControl(this.network.provider);

    if (!this.zilliqa.wallet.isValidMnemonic(decryptSeed)) {
      throw new Error(errorsCodeGuard.WrongDecryptSeed);
    } else if (!this.auth._guard) {
      throw new Error(errorsCodeGuard.GuardWrong);
    }

    const selectedAddress = 0;
    const account = await this.zilliqa.getAccountBySeed(
      decryptSeed, selectedAddress
    );
    const encryptedWallet = this.auth._guard.encrypt(decryptSeed);
    const importedWallet = this.auth._guard.encryptJson([]);
    const wallet = {
      selectedAddress,
      identities: [{
        address: account.address,
        balance: account.balance,
        index: account.index
      }]
    };
    
    await this._storage.set([
      new BuildObject(fields.VAULT, encryptedWallet),
      new BuildObject(fields.VAULT_IMPORTED, importedWallet),
      new BuildObject(fields.WALLET, wallet)
    ]);

    return account;
  }

  async newAccountBySeed() {
    /**
     * Create new pair's private Key and public Key via seed phase.
     */
    await this.auth.vaultSync();

    const { decryptSeed } = await this.auth.getWallet();

    // Mandatory authentication test.
    if (!this.auth.isReady) {
      throw new Error(
        errorsCode.WalletIsNotReady + this.auth.isReady
      );
    } else if (!this.auth.isEnable) {
      throw new Error(
        errorsCode.WalletIsNotEnable + this.auth.isEnable
      );
    }

    this.zilliqa = new ZilliqaControl(this.network.provider);

    let { wallet } = await this._storage.get(fields.WALLET);
    
    // Get a new index account, but excluding a hardware wallet
    // and importd by private key.
    const index = wallet.identities.filter(
      el => !el.isImport && !el.hwType
    ).length;
    const account = await this.zilliqa.getAccountBySeed(
      decryptSeed, index
    );
    wallet.selectedAddress = wallet.identities.length;
    wallet.identities.push({
      address: account.address,
      balance: account.balance,
      index: account.index
    });

    await this._storage.set(
      new BuildObject(fields.WALLET, wallet)
    );
    
    return wallet; 
  }

  async walletUpdate(wallet) {
    /**
     * Any update wallet store.
     * @interface wallet: { identities: Array, selectedAddress: number };
     */
    wallet.identities = wallet.identities.filter(acc => !!acc);
    await this._storage.set(
      new BuildObject(fields.WALLET, wallet)
    );
  }

  async changeAccountName(name) {
    /**
     * Create and change account name.
     * @interface name: String.
     */
    if (!name || typeof name !== 'string' || name.length > MAX_LENGTH_NAME) {
      throw new Error(errorsCode.WrongName);
    }

    let wallet = await this._storage.get(fields.WALLET);
    wallet = wallet[fields.WALLET];

    wallet.identities[
      wallet.selectedAddress
    ]['name'] = name;

    await this.walletUpdate(wallet);
  }

  async addForConnectDapp(payload) {
    /**
     * Add to store App info, for confirm access.
     * @interface payload: { domain: String, icon: String, title: String }
     */
    const storage = new BrowserStorage();
    await storage.set(
      new BuildObject(fields.CONNECT_DAPP, payload)
    );
  }

}
