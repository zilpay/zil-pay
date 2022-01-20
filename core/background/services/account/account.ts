/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
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
import { fromBech32Address, toBech32Address } from 'lib/utils/bech32';
import { getPubKeyFromPrivateKey } from 'lib/utils/address';
import { BrowserStorage, buildObject } from 'lib/storage';
import { Fields } from 'config/fields';
import { AccountTypes } from 'config/account-type';
import { Contracts } from 'config/contracts';
import { ErrorMessages } from 'config/errors';
import { MTypeTab } from 'lib/streem/stream-keys';
import { TabsMessage } from 'lib/streem/tabs-message';

export class AccountController {
  public static readonly field0 = 'identities';
  public static readonly field1 = 'selectedAddress';

  public readonly mnemonic = new MnemonicController();

  readonly #hdKey = new HDKey();
  readonly #guard: AuthGuard;

  #zrc2: ZRC2Controller;
  #wallet: Wallet = {
    selectedAddress: 0,
    identities: []
  };

  public get wallet() {
    return this.#wallet;
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
    return this.#wallet
      .identities
      .filter((acc) => acc.type === AccountTypes.PrivateKey)
      .length;
  }

  public get lastIndexSeed() {
    return this.#wallet
      .identities
      .filter((acc) => acc.type === AccountTypes.Seed)
      .length;
  }

  public get lastIndexLedger() {
    return this.#wallet
      .identities
      .filter((acc) => acc.type === AccountTypes.Ledger)
      .length;
  }

  constructor(guard: AuthGuard) {
    this.#guard = guard;
  }

  public initZRC(rc2Controller: ZRC2Controller) {
    this.#zrc2 = rc2Controller;
  }

  public async remove(index: number) {
    const account = this.wallet.identities[index];
    assert(Boolean(account), ErrorMessages.OutOfIndex);
    assert(!(account.index === 0 && account.type === AccountTypes.Seed), ErrorMessages.OutOfIndex);

    delete this.#wallet.identities[index];

    this.#wallet.identities = this.#wallet.identities.filter(Boolean);

    if (this.wallet.selectedAddress === index) {
      this.wallet.selectedAddress -= 1;
    }

    await this.#trigger();
    await BrowserStorage.set(
      buildObject(Fields.WALLET, this.#wallet)
    );
  }

  public async fromSeed(words: string, index = 0): Promise<KeyPair> {
    const path = this.mnemonic.getKey(index);
    const seed = await this.mnemonic.mnemonicToSeed(words);
    const hdKey = this.#hdKey.fromMasterSeed(seed);
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
      buildObject(Fields.WALLET, this.#wallet)
    );
  }

  public getAccount(index: number) {
    assert(index <= this.wallet.identities.length - 1, ErrorMessages.OutOfIndex);
    return this.wallet.identities[index];
  }

  public async getKeyPair(index = this.wallet.selectedAddress): Promise<KeyPair> {
    const account = this.wallet.identities[index];
    switch (account.type) {
      case AccountTypes.Seed:
        const seed = this.#guard.getSeed();
        const keyPair = await this.fromSeed(seed, account.index);
        return keyPair;
      case AccountTypes.PrivateKey:
        const encryptedPriveLey = this.selectedAccount.privKey;
        const privateKey = this.#guard.decryptPrivateKey(encryptedPriveLey);
        return {
          pubKey: this.selectedAccount.pubKey,
          privKey: privateKey,
          base16: this.selectedAccount.base16
        };
      case AccountTypes.Ledger:
        throw new Error(ErrorMessages.CannotExportLedger);
    }
  }

  public async removeToken(token: ZRC2Token) {
    for (let index = 0; index < this.wallet.identities.length; index++) {
      delete this.wallet.identities[index].zrc2[token.base16];
    }

    await BrowserStorage.set(
      buildObject(Fields.WALLET, this.#wallet)
    );
  }

  public async migrate() {
    const newWallet = await BrowserStorage.get(Fields.WALLET);
    if (newWallet) return;
    let oldWallet = await BrowserStorage.get(Fields.OLD_WALLET);
    if (!oldWallet) return;
    try {
      oldWallet = JSON.parse(String(oldWallet));
    } catch {
      //
    }
    const identities = oldWallet[AccountController.field0];
    const selectedAddress = oldWallet[AccountController.field1];
    const newIdentities: Account[] = [];
    const vault = this.#guard.getWallet();

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
        newAccount.privKey = this.#guard.encryptPrivateKey(privateKey);
        newAccount.type = AccountTypes.PrivateKey;
        newAccount.name = `Imported ${index}`;
        newAccount.pubKey = getPubKeyFromPrivateKey(privateKey);
      } else {
        const { pubKey } = await this.fromSeed(vault.decryptSeed, index);

        newAccount.pubKey = pubKey;
      }

      newIdentities.push(newAccount);
    }

    this.#wallet.selectedAddress = selectedAddress;
    this.#wallet.identities = newIdentities;

    await BrowserStorage.set(
      buildObject(Fields.WALLET, this.#wallet)
    );
  }

  public async sync() {
    const walletJson = await BrowserStorage.get(Fields.WALLET);

    try {
      const wallet = JSON.parse(String(walletJson));

      this.#wallet = wallet;
    } catch {
      //
    }
  }

  public async reset() {
    this.#wallet.identities = [];
    this.#wallet.selectedAddress = 0;
    await BrowserStorage.set(
      buildObject(Fields.WALLET, this.#wallet)
    );
  }

  public async addAccountFromSeed(seed: string, name: string) {
    const index = this.lastIndexSeed;
    const { pubKey, base16 } = await this.fromSeed(seed, index);
    const bech32 = toBech32Address(base16);
    const type = AccountTypes.Seed;
    const zrc2 = await this.#zrc2.getBalance(base16);
    const account: Account = {
      name,
      bech32,
      index,
      base16,
      type,
      pubKey,
      zrc2,
      nft: {}
    };
    await this._add(account);
    return account;
  }

  public async balanceUpdate() {
    const zrc2 = await this.#zrc2.getBalance(this.selectedAccount.base16);
    
    this.#wallet.identities[this.#wallet.selectedAddress].zrc2 = zrc2;

    await BrowserStorage.set(
      buildObject(Fields.WALLET, this.wallet)
    );

    return this.wallet;
  }

  public async addAccountFromPrivateKey(privKey: string, name: string) {
    const index = this.lastIndexPrivKey;
    const { pubKey, base16 } = this.fromPrivateKey(privKey);
    const bech32 = toBech32Address(base16);
    const type = AccountTypes.PrivateKey;
    const encryptedPrivateKey = this.#guard.encryptPrivateKey(privKey);
    const zrc2 = await this.#zrc2.getBalance(base16);
    const account: Account = {
      name,
      bech32,
      index,
      base16,
      type,
      pubKey,
      privKey: encryptedPrivateKey,
      zrc2,
      nft: {}
    };    
    await this._add(account);
    return account;
  }

  public async addLedgerAccount(pubKey: string, bech32: string, index: number, name: string, productId: number) {
    const base16 = fromBech32Address(bech32);
    const type = AccountTypes.Ledger;
    const zrc2 = await this.#zrc2.getBalance(base16);
    const account: Account = {
      name,
      bech32,
      index,
      base16,
      type,
      pubKey,
      zrc2,
      productId,
      nft: {}
    };
    await this._add(account);
    return account;
  }

  public async select(index: number) {
    assert(index < this.wallet.identities.length, ErrorMessages.OutOfIndex);

    this.#wallet.selectedAddress = index;

    await this.#trigger();

    await BrowserStorage.set(
      buildObject(Fields.WALLET, this.#wallet)
    );

    return this.selectedAccount;
  }

  public async changeAccountName(index: number, name: string) {
    this.#wallet.identities[index].name = name;

    await BrowserStorage.set(
      buildObject(Fields.WALLET, this.#wallet)
    );
  }

  private async _add(account: Account) {
    await this.#checkAccount(account);

    this.#wallet
      .identities
      .push(account);
    this.#wallet
      .selectedAddress = this.wallet.identities.length - 1;

    await this.#trigger();
    await BrowserStorage.set(
      buildObject(Fields.WALLET, this.#wallet)
    );

    return this.wallet;
  }

  async #checkAccount(account: Account) {
    await this.sync();

    const isUnique = this.wallet.identities.some(
      (acc) => (acc.base16 === account.base16)
    );

    assert(!isUnique, 'Account must be unique');
  }

  async #trigger() {
    await new TabsMessage({
      type: MTypeTab.ADDRESS_CHANGED,
      payload: {
        account: {
          base16: this.selectedAccount.base16,
          bech32: this.selectedAccount.bech32
        }
      }
    }).send();
  }
}
