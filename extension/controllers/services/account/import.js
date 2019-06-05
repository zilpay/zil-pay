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
      index: payload.hwIndex,
      hwType: payload.hwType,
      pubKey: payload.publicKey
    });
    wallet.selectedAddress = wallet.identities.length - 1;

    await this._storage.set(
      new BuildObject(fields.WALLET, wallet)
    );

    return wallet;
  }

  async importAccountByPrivateKey(privateKey) {
    await this.auth.vaultSync();

    let { decryptImported } = await this.auth.getWallet();

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

    wallet.identities.forEach(acc => {
      if (acc.address == account.address) {
        throw new Error(errorsCode.ImportUniqueWrong);
      }
    });
    const isSome = decryptImported.filter(
      acc => acc.index == account.index || acc.privateKey === account.privateKey
    ).length > 0;

    wallet.selectedAddress = wallet.identities.length;
    wallet.identities.push({
      index,
      address: account.address,
      balance: account.balance,
      isImport: true
    });
    
    if (isSome) {
      decryptImported.map(acc => {
        if (acc.index == account.index || acc.privateKey === account.privateKey) {
          acc = { index, privateKey }
        }
      });
    } else {
      decryptImported.push({ index, privateKey });
    }
 
    await this.auth.updateImported(decryptImported);
    await this._storage.set(
      new BuildObject(fields.WALLET, wallet)
    );
    
    return wallet;
  }
  
}

