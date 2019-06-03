import { AccountControl } from './create'
import { BuildObject } from '../../../../lib/storage'
import { ZilliqaControl } from '../blockchain/zilliqa'
import errorsCode from './errors'
import fields from '../../../../config/fields'


export class AccountImporter extends AccountControl {

  constructor(accountControl) {
    super();
    this.auth = accountControl.auth;
  }

  initWallet() {
    throw new Error(errorsCode.DisableMethod);
  }

  newAccountBySeed() {
    throw new Error(errorsCode.DisableMethod);
  }

  async importByHwAccount(payload) {
    let wallet = await this._storage.get(fields.WALLET);
    wallet = wallet[fields.WALLET];

    wallet.identities.forEach(account => {
      if (account.address == payload.pubAddr) {
        throw new Error(errorsCode.ImportUniqueWrong);
      }
    });

    this.zilliqa = new ZilliqaControl(this.network.provider);

    const { result } = await this.zilliqa.getBalance(payload.pubAddr);

    wallet.identities.push({
      balance: result,
      address: payload.pubAddr,
      hwIndex: payload.hwIndex,
      hwType: payload.hwType,
      name: `${payload.hwType} ${payload.hwIndex}`
    });
    wallet.selectedAddress = wallet.identities.length - 1;

    await this._storage.set(
      new BuildObject(fields.WALLET, wallet)
    );

    return wallet;
  }

  async importAccountByPrivateKey(privateKey) {
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

    const index = wallet.identities.length;
    const account = await this.zilliqa.getAccountByPrivateKey(
      privateKey, index
    );

    wallet.selectedAddress = wallet.identities.length;
    wallet.identities.push({
      index,
      address: account.address,
      balance: account.balance,
      isImport: true
    });

    decryptImported.forEach(el => {
      if (el.privateKey === account.privateKey) {
        throw new Error(errorsCode.ImportUniqueWrong);
      } else if (el.index === account.index) {
        throw new Error(errorsCode.IndexUniqueWrong);
      }
    });
 
    decryptImported.push({
      index, privateKey
    });

    await this.auth.updateImported(decryptImported);
    await this._storage.set(
      new BuildObject(fields.WALLET, wallet)
    );
    
    return wallet;
  }
  
}

