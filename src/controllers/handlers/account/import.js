import { AccountCreater } from './create'
import errorsCode from './errors'


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

    const index = decryptImported.length;
    const account = await this._zilliqa.getAccountByPrivateKey(
      privateKey, index
    );

    decryptImported.forEach(el => {
      if (el.privateKey === privatekey) {
        throw new Error(errorsCode.ImportUniqueWrong);
      } else if (el.index === index) {
        throw new Error(errorsCode.IndexUniqueWrong);
      }
    });
 
    decryptImported.push({
      index, privateKey,
      balance: account.balance,
      address: account.address
    });

    await this._auth.updateImported(decryptImported);
    
    return account;
  }
  
}

