import { Auth } from '../auth/index'
import { ZilliqaControll } from '../blockchain/zilliqa'
import { NetworkControl } from '../network/index'
import { BrowserStorage, BuildObject } from '../../../lib/storage'
import fields from '../../../config/fields'
import errorsCode from './errors'
import errors from '../auth/errors';


export class AccountCreater {

  constructor(password) {
    this._storage = new BrowserStorage();
    this._network = new NetworkControl();
    this._zilliqa = new ZilliqaControll(this._network.provider);
    this._auth = new Auth();
    this._auth.setPassword(password);
    this._password = password;
  }

  async initWallet(decryptSeed) {
    if (typeof decryptSeed !== 'string' || decryptSeed.length < 12) {
      throw new Error(errors.WrongDecryptSeed);
    }

    const selectedAddress = 0;
    const account = await this._zilliqa.getAccountBySeed(
      decryptSeed, selectedAddress
    );
    const encryptedWallet = this._auth._guard.encrypt(decryptSeed);
    const importedWallet = this._auth._guard.encryptJson([]);
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

    let { wallet } = await this._storage.get(fields.WALLET);
    const account = await this._zilliqa.getAccountBySeed(
      decryptSeed, wallet.identities.length
    );
    wallet.selectedAddress = account.index;
    wallet.identities.push({
      address: account.address,
      balance: account.balance,
      index: account.index
    });

    await this._storage.set([
      new BuildObject(fields.WALLET, wallet)
    ]);
    
    return account; 
  }

  async newAccountByPrivateKey(privatekey) {
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

    const index = decryptImported.length;
    const account = await this._zilliqa.getAccountByPrivateKey(
      privatekey, index
    );

    decryptImported.forEach(el => {
      if (el.privateKey === privatekey) {
        throw new Error(errorsCode.ImportUniqueWrong);
      } else if (el.index === index) {
        throw new Error(errorsCode.IndexUniqueWrong);
      }
    });
 
    decryptImported.push(account);

    await this._auth.updateImported(decryptImported);
    
    return account;
  }

}