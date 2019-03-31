import { Auth } from '../auth/index'
import { ZilliqaControll } from '../blockchain/zilliqa'
import { NetworkControl } from '../network/index'
import { BrowserStorage, BuildObject } from '../../../lib/storage'
import fields from '../../../config/fields'
import errorsCode from './errors'


export class AccountCreater {

  constructor(password) {
    this._storage = new BrowserStorage();
    this._network = new NetworkControl();
    this._zilliqa = new ZilliqaControll(this._network.provider);
    this._auth = new Auth();
    this._auth.setPassword(password);
    this._password = password;
  }

  async newAccountBySeed(mnemonicSeed, startingIndex=0) {
    const forStorage = [];
    const account = await this._zilliqa.getAccountBySeed(
      mnemonicSeed, startingIndex
    );
    const identitiesAccount = {
      address: account.address,
      balance: account.balance,
      index: account.index
    };

    let vault = await this._storage.get(fields.VAULT);
    let wallet = await this._storage.get(fields.WALLET);

    try {
      wallet = wallet[fields.WALLET];
      if (!wallet) throw new Error();
      wallet.identities.push(identitiesAccount);
    } catch(err) {
      wallet = { identities: [identitiesAccount] };
    }

    wallet.selectedAddress = startingIndex;
    forStorage.push(new BuildObject(fields.WALLET, wallet));
    
    try {
      vault = vault[fields.VAULT];
      if (!vault) throw new Error();
    } catch(err) {
      vault = Auth.encryptWallet(
        mnemonicSeed, [], this._password
      ).encryptSeed;
      forStorage.push(new BuildObject(fields.VAULT, vault));
    }

    await this._storage.set(forStorage);

    return account;
  }

  async newAccountBySeed0(decryptSeed=null, startingIndex=0) {
    await this._auth.vaultSync();

    if (!this._auth.isReady) {
      throw new Error(
        errorsCode.WalletIsNotReady + this._auth.isReady
      );
    }

    if (!decryptSeed) {
      const decryptWallet = await this._auth.getWallet();
      decryptSeed = decryptWallet.decryptSeed;
    }

    const account = await this._zilliqa.getAccountBySeed(
      decryptSeed, startingIndex
    );
    const identitiesAccount = {
      address: account.address,
      balance: account.balance,
      index: account.index
    };
    

  }

  async newAccountByPrivateKey(privatekey, index=0) {
    const account = await this._zilliqa.getAccountByPrivateKey(
      privatekey, index
    );
    await this._auth.vaultSync();

    if (!this._auth.isReady) {
      throw new Error(
        errorsCode.WalletIsNotReady + this._auth.isReady
      );
    }

    const { decryptImported } = await this._auth.getWallet();

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