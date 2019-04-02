import { AccountCreater } from './create'
import { BuildObject } from '../../../lib/storage'
import errorsCode from './errors'
import fields from '../../../config/fields'


export class AccountImporter extends AccountCreater {

  constructor(password) {
    super(password);
  }

  initWallet() {
    throw new Error(errorsCode.DisableMethod);
  }

  newAccountBySeed() {
    throw new Error(errorsCode.DisableMethod);
  }

  async importAccountByPrivateKey(privateKey) {
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
    const index = wallet.identities.length;
    const account = await this._zilliqa.getAccountByPrivateKey(
      privateKey, index
    );

    wallet.selectedAddress = account.index;
    wallet.identities.push({
      index,
      address: account.address,
      balance: account.balance
    });

    decryptImported.forEach(el => {
      if (el.privateKey === privatekey) {
        throw new Error(errorsCode.ImportUniqueWrong);
      } else if (el.index === index) {
        throw new Error(errorsCode.IndexUniqueWrong);
      }
    });
 
    decryptImported.push({
      index, privateKey
    });

    await this._auth.updateImported(decryptImported);
    await this._storage.set(
      new BuildObject(fields.WALLET, wallet)
    );
    
    return account;
  }
  
}

