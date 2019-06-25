import fields from '../../../../config/fields'
import { AccountControl } from './create'
import { ZilliqaControl } from '../blockchain/zilliqa'
import errorsCode from './errors'


export class AccountExporter extends AccountControl {
  
  constructor() {
    super();
  }

  initWallet() {
    throw new Error(errorsCode.DisableMethod);
  }

  newAccountBySeed() {
    throw new Error(errorsCode.DisableMethod);
  }

  async exportPrivateKeyFromSeed() {
    /**
     * Export Private Key from seed pashe via index.
     */

    // Sync with storage.
    await this.auth.vaultSync();

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
    // Get the decrypt seed phase.
    const { decryptSeed } = await this.auth.getWallet();

    this.zilliqa = new ZilliqaControl(this.network.provider);

    let wallet = await this._storage.get(fields.WALLET);
    wallet = wallet[fields.WALLET];

    const selectedAccount = wallet.identities[wallet.selectedAddress];

    // Chek account type.
    if (selectedAccount.isImport || selectedAccount.hwType) {
      throw new Error(errorsCode.AccountIsImported);
    }

    const index = selectedAccount.index;
    const account = await this.zilliqa.getAccountBySeed(
      decryptSeed, index
    );
    
    return {
      index,
      privateKey: account.privateKey 
    };
  }

  async exportAccountFromStore() {
    /**
     * Export private key from imported storage.
     */

    // Sync with storage.
    await this.auth.vaultSync();

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

    const { decryptImported } = await this.auth.getWallet();

    this.zilliqa = new ZilliqaControl(this.network.provider);

    let wallet = await this._storage.get(fields.WALLET);
    wallet = wallet[fields.WALLET];

    const accountID = wallet.identities[wallet.selectedAddress].index;
    const account = decryptImported.find(
      // Searching account by index.
      acc =>  acc.index === accountID
    );
        
    if (!account) {
      throw new Error(errorsCode.WrongIndex);
    }

    return account;
  }

  async exportSeed() {
    /**
     * Export seed phase.
     */
    await this.auth.vaultSync();
    return await this.auth.getWallet();
  }

  async isImported() {
    /**
     * Testing function.
     * @returns Boolean.
     */
    let wallet = await this._storage.get(fields.WALLET);
    wallet = wallet[fields.WALLET];
    const account = wallet.identities[wallet.selectedAddress];
    return !!account.isImport;
  }
}
