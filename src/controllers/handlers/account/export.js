import fields from '../../../config/fields'
import { AccountCreater } from './create'
import errorsCode from './errors'


export class AccountExporter extends AccountCreater {
  
  constructor(password) {
    super(password);
  }

  initWallet() {
    throw new Error(errorsCode.DisableMethod);
  }

  newAccountBySeed() {
    throw new Error(errorsCode.DisableMethod);
  }

  async exportPrivateKeyFromSeed() {
    await this._auth.vaultSync();

    const { decryptSeed } = await this._auth.getWallet();

    if (!this._auth.isReady) {
      throw new Error(
        errorsCode.WalletIsNotReady + this._auth.isReady
      );
    } else if (!this._auth.isEnable) {
      throw new Error(
        errorsCode.WalletIsNotEnable + this._auth.isEnable
      );
    }

    const { wallet } = await this._storage.get(fields.WALLET);
    const account = await this._zilliqa.getAccountBySeed(
      decryptSeed, wallet.selectedAddress
    );
    
    return {
      index: wallet.selectedAddress,
      privateKey: account.privateKey 
    };
  }

  async exportAccountFromStore() {
    await this._auth.vaultSync();

    const { decryptImported } = await this._auth.getWallet();

    if (!this._auth.isReady) {
      throw new Error(
        errorsCode.WalletIsNotReady + this._auth.isReady
      );
    } else if (!this._auth.isEnable) {
      throw new Error(
        errorsCode.WalletIsNotEnable + this._auth.isEnable
      );
    }

    const { wallet } = await this._storage.get(fields.WALLET);
    const [account] = decryptImported.filter(
      el => el.index === wallet.selectedAddress
    );
    
    if (!account) {
      throw new Error(errorsCode.WrongIndex);
    }

    return account;
  }

  async exportSeed() {
    await this._auth.vaultSync();

    return await this._auth.getWallet();
  }
}
