/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { ZilliqaControl } from 'core/background/services/blockchain';
import type { ZRC2Controller } from 'core/background/services/token';
import type { Account, KeyPair, Wallet } from 'types/account';
import type { AuthGuard } from 'core/background/services/guard';
import type { ZRC2Token } from 'types/token';
import { Buffer } from 'buffer';
import assert from 'assert';
import { HDKey } from './hd-key';
import { MnemonicController } from './mnemonic';
import secp256k1 from 'secp256k1/elliptic';
import { getAddressFromPublicKey, toChecksumAddress } from 'lib/utils/address';
import { toBech32Address } from 'lib/utils/bech32';
import { getPubKeyFromPrivateKey } from 'lib/utils/address';
import { BrowserStorage, buildObject } from 'lib/storage';
import { Fields } from 'config/fields';
import { AccountTypes } from 'config/account-type';
import { Contracts } from 'config/contracts';
import { ErrorMessages } from 'config/errors';

export class AccountController {
  public static readonly field0 = 'identities';
  public static readonly field1 = 'selectedAddress';

  private readonly _hdKey = new HDKey();
  private readonly _mnemonic = new MnemonicController();
  private readonly _zilliqa: ZilliqaControl;
  private readonly _guard: AuthGuard;
  private _wallet: Wallet = {
    selectedAddress: 0,
    identities: []
  };

  public get wallet() {
    return this._wallet;
  }

  public get selectedAccount(): undefined | Account {
    if (this.wallet.identities.length === 0) {
      return null;
    }
    if (!this.wallet.identities[this.wallet.selectedAddress]) {
      return null;
    }
    return this.wallet.identities[this.wallet.selectedAddress];
  }

  public get lastIndexPrivKey() {
    return this._wallet
      .identities
      .filter((acc) => acc.type === AccountTypes.privateKey)
      .length;
  }

  public get lastIndexSeed() {
    return this._wallet
      .identities
      .filter((acc) => acc.type === AccountTypes.Seed)
      .length;
  }

  public get lastIndexLedger() {
    return this._wallet
      .identities
      .filter((acc) => acc.type === AccountTypes.Ledger)
      .length;
  }

  constructor(zilliqa: ZilliqaControl, guard: AuthGuard) {
    this._zilliqa = zilliqa;
    this._guard = guard;
  }

  public async remove(index: number) {
    assert(index > 1, ErrorMessages.OutOfIndex);

    delete this._wallet.identities[index];

    if (this.wallet.selectedAddress === index) {
      this.wallet.selectedAddress -= 1;
    }

    await BrowserStorage.set(
      buildObject(Fields.WALLET, this._wallet)
    );
  }

  public async fromSeed(words: string, index = 0): Promise<KeyPair> {
    const path = this._mnemonic.getKey(index);
    const seed = await this._mnemonic.mnemonicToSeed(words);
    const hdKey = this._hdKey.fromMasterSeed(seed);
    const childKey = hdKey.derive(path);

    return childKey.keyPair;
  }

  public fromPrivateKey(privateKey: string): KeyPair {
    const bytes = Buffer.from(privateKey, 'hex');

    assert.equal(bytes.length, 32, 'Private key must be 32 bytes.');
    assert(secp256k1.privateKeyVerify(bytes), 'Invalid private key');

    const pubKey = getPubKeyFromPrivateKey(privateKey);
    const base16 = getAddressFromPublicKey(pubKey);

    return {
      pubKey,
      base16,
      privKey: privateKey
    };
  }

  public async addToken(token: ZRC2Token, balance: string) {
    this.wallet.identities = this.wallet.identities.map((acc) => ({
      ...acc,
      zrc2: {
        ...acc.zrc2,
        [token.base16]: balance
      }
    }));

    await BrowserStorage.set(
      buildObject(Fields.WALLET, this._wallet)
    );
  }

  public async removeToken(token: ZRC2Token) {
    for (let index = 0; index < this.wallet.identities.length; index++) {
      delete this.wallet.identities[index].zrc2[token.base16];
    }

    await BrowserStorage.set(
      buildObject(Fields.WALLET, this._wallet)
    );
  }

  public async migrate() {
    const newWallet = await BrowserStorage.get(Fields.WALLET);
    if (newWallet) return null;
    const oldWallet = await BrowserStorage.get(Fields.OLD_WALLET);
    const identities = oldWallet[AccountController.field0];
    const selectedAddress = oldWallet[AccountController.field1];
    const newIdentities: Account[] = [];
    const vault = this._guard.getWallet();

    for (let i = 0; i < identities.length; i++) {
      const { address, balance, isImport, index, hwType, name, pubKey } = identities[i];
      const newAccount: Account = {
        index,
        pubKey,
        name: name || `Account ${index}`,
        type: AccountTypes.Seed,
        base16: toChecksumAddress(address),
        bech32: toBech32Address(address),
        zrc2: {
          [Contracts.ZERO_ADDRESS]: balance
        },
        nft: {}
      };

      if (hwType === 'ledger') {
        newAccount.type = AccountTypes.Ledger;
        newAccount.name = `Ledger ${index}`;
      } else if (isImport) {
        const { privateKey } = vault.decryptImported.find(
          (el) => el.index === index
        );
        newAccount.privKey = this._guard.encryptPrivateKey(privateKey);
        newAccount.type = AccountTypes.privateKey;
        newAccount.name = `Imported ${index}`;
        newAccount.pubKey = getPubKeyFromPrivateKey(privateKey);
      } else {
        const { pubKey } = await this.fromSeed(vault.decryptSeed, index);

        newAccount.pubKey = pubKey;
      }

      newIdentities.push(newAccount);
    }

    this._wallet.selectedAddress = selectedAddress;
    this._wallet.identities = newIdentities;

    await BrowserStorage.set(
      buildObject(Fields.WALLET, this._wallet)
    );
  }

  public async sync() {
    const walletJson = await BrowserStorage.get(Fields.WALLET);

    try {
      const wallet = JSON.parse(String(walletJson));

      this._wallet = wallet;
    } catch {
      //
    }
  }

  public async addAccount(keyPair: KeyPair, zrc2Controller: ZRC2Controller) {
    const { privKey, pubKey, base16 } = keyPair;
    const bech32 = toBech32Address(base16);
    const balances = await zrc2Controller.getBalance(base16);

    console.log(balances);
  }

  private async _add(account: Account) {
    await this._checkAccount(account);

    this._wallet
      .identities
      .push(account);
    this._wallet
      .selectedAddress = this.wallet.identities.length - 1;

    await BrowserStorage.set(
      buildObject(Fields.WALLET, this._wallet)
    );

    return this.wallet;
  }

  private async _checkAccount(account: Account) {
    await this.sync();

    const isUnique = this.wallet.identities.some(
      (acc) => (acc.base16 === account.base16)
    );
    const isIndex = this.wallet.identities.some(
      (acc) => (acc.index === account.index) && (acc.type === account.type)
    );

    assert(!isUnique, 'Account must be unique');
    assert(!isIndex, 'Incorect index and account type');
  }
}
