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
    await this.auth.vaultSync();

    const { decryptSeed } = await this.auth.getWallet();

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

    let wallet = await this._storage.get(fields.WALLET);
    wallet = wallet[fields.WALLET];

    const index = wallet.identities[wallet.selectedAddress].index;
    const account = await this.zilliqa.getAccountBySeed(
      decryptSeed, index
    );

    if (wallet.identities[wallet.selectedAddress].isImport) {
      throw new Error(errorsCode.AccountIsImported);
    }
    
    return {
      index,
      privateKey: account.privateKey 
    };
  }

  async exportAccountFromStore() {
    await this.auth.vaultSync();

    const { decryptImported } = await this.auth.getWallet();

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

    let wallet = await this._storage.get(fields.WALLET);

    wallet = wallet[fields.WALLET];

    const accountID = wallet.identities[wallet.selectedAddress].index;
    const account = decryptImported.find(
      acc =>  acc.index === accountID
    );
        
    if (!account) {
      throw new Error(errorsCode.WrongIndex);
    }

    return account;
  }

  async exportSeed() {
    await this.auth.vaultSync();

    return await this.auth.getWallet();
  }

  async isImported() {
    let wallet = await this._storage.get(fields.WALLET);
    wallet = wallet[fields.WALLET];
    const account = wallet.identities[wallet.selectedAddress];
    return !!account.isImport;
  }
}
