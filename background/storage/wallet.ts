import type { Bip32Account, IAccountState } from './account';
import { base64ToUint8Array, uint8ArrayToBase64 } from '../../crypto/b64';
import { generateSalt } from '../../lib/runtime';
import { Account } from './account';
import { FToken, type IFTokenState } from './ftoken';
import { WalletSettings, type IWalletSettingsState } from './settings';
import { Session } from '../secure/session';
import { ChainConfig } from './chain';
import { Bip39 } from '../../crypto/bip39';
import { uuid } from '../../crypto/uuid';
import { TypeOf } from 'lib/types';
import { KeyPair } from 'crypto/keypair';
import { uint8ArrayToUtf8, utf8ToUint8Array } from 'lib/utils/utf8';
import { HistoricalTransaction, type IHistoricalTransactionState } from 'background/rpc/history_tx';
import { ConfirmState, type IConfirmState } from './confirm';
import { AuthMethod, WalletTypes } from 'config/wallet';

export interface IWalletState {
  uuid: string;
  walletType: WalletTypes;
  walletName: string;
  authType: AuthMethod;
  accounts: IAccountState[];
  selectedAccount: number;
  tokens: IFTokenState[];
  history: IHistoricalTransactionState[];
  confirm: IConfirmState[];
  settings: IWalletSettingsState;
  defaultChainHash: number;
  vault?: string;
}

export class Wallet implements IWalletState {
  #session: Session;
  #vault: string;

  uuid: string;
  walletType: WalletTypes;
  walletName: string;
  authType: AuthMethod;
  accounts: Account[];
  selectedAccount: number;
  tokens: FToken[];
  history: HistoricalTransaction[];
  confirm: ConfirmState[];
  settings: WalletSettings;
  defaultChainHash: number;

  constructor(data: IWalletState) {
    this.walletType = data.walletType as WalletTypes;
    this.walletName = data.walletName as string;
    this.authType = data.authType as AuthMethod;
    this.accounts = (data.accounts).map(
      (a) => new Account(a)
    );
    this.selectedAccount = data.selectedAccount as number;
    this.tokens = (data.tokens).map(
      (t) => new FToken(t)
    );
    this.settings = new WalletSettings(data.settings);
    this.defaultChainHash = data.defaultChainHash as number;
    this.uuid = data.uuid as string;
    this.history = TypeOf.isArray(data.history) ? data.history.map((h) => new HistoricalTransaction(h)) : [];
    this.confirm = TypeOf.isArray(data.confirm) ? data.confirm.map((c) => new ConfirmState(c)) : [];
    this.#session = new Session(this.uuid);

    this.#vault = data.vault as string ?? "";
  }

  static async fromPrivateKey(
    keyPair: KeyPair,
    walletName: string,
    accountName: string,
    settings: WalletSettings,
    chain: ChainConfig,
    password: string,
  ) {
    const passwordBytes = utf8ToUint8Array(password);
    const account = await Account.fromPrivateKey(keyPair.privateKey, chain, accountName);
    const wallet = new Wallet({
      settings,
      walletName,
      walletType: WalletTypes.SecretKey,
      selectedAccount: 0,
      tokens: chain.ftokens,
      defaultChainHash: chain.hash(),
      uuid: uuid(),
      accounts: [account],
      authType: AuthMethod.None,
      history: [],
      confirm: [],
    });

    await wallet.encrypt(passwordBytes, keyPair.privateKey);
    await wallet.setSession(keyPair.privateKey);

    return wallet;
  }

  static async fromBip39(
    words: string,
    verifyCheckSum: boolean,
    walletName: string,
    bip32Accounts: Bip32Account[],
    settings: WalletSettings,
    chain: ChainConfig,
    password: string,
    wordList: string[],
    passphrase?: string
  ) {
    if (verifyCheckSum) {
      await Bip39.validateMnemonic(words, wordList);
    }

    const seed = await Bip39.mnemonicToSeed(words, passphrase);
    const wallet = new Wallet({
      settings,
      walletName,
      walletType: WalletTypes.SecretPhrase,
      selectedAccount: 0,
      tokens: chain.ftokens,
      defaultChainHash: chain.hash(),
      uuid: uuid(),
      accounts: [],
      authType: AuthMethod.None,
      history: [],
      confirm: [],
    });
    const passwordBytes = utf8ToUint8Array(password);
    const wordsBytes = utf8ToUint8Array(words);

    wallet.accounts = await Promise.all(bip32Accounts.map((acc) => Account.fromBip39(acc, chain, seed)));
    await wallet.encrypt(passwordBytes, wordsBytes);
    await wallet.setSession(words);


    return wallet;
  }

  async decrypt(password: Uint8Array): Promise<Uint8Array | string> {
    const salt = await generateSalt();
    const keychain = await this.settings.hashFnParams.deriveKey(password, salt);
    const ciphertext = base64ToUint8Array(this.#vault);
    const decrypted = await keychain.decrypt(ciphertext, this.settings.cipherOrders);

    if (this.walletType == WalletTypes.SecretKey) {      
      return decrypted;
    } else if (this.walletType == WalletTypes.SecretPhrase) {
      return uint8ArrayToUtf8(decrypted);
    } else {
      throw new Error("unknown wallet type");
    }
  }

  async encrypt(password: Uint8Array, plaintext: Uint8Array) : Promise<Uint8Array>{
    const salt = await generateSalt();
    const keychain = await this.settings.hashFnParams.deriveKey(password, salt);
    const cipher = await keychain.encrypt(plaintext, this.settings.cipherOrders);

    this.#vault = uint8ArrayToBase64(cipher);

    return cipher;
  }

  async unlock(password: Uint8Array) {
    const wordsOrKey = await this.decrypt(password);
    await this.setSession(wordsOrKey);
  }

  async revealKeypair(accountIndex: number, chain: ChainConfig): Promise<KeyPair> {
    if (chain.hash() !== this.defaultChainHash) {
      throw new Error("invlid chain");
    }

    switch (this.walletType) {
      case WalletTypes.SecretPhrase:
        const seed = await this.#session.getVault();
        return KeyPair.fromSeed(seed, chain.slip44, accountIndex);
      case WalletTypes.SecretKey:
        const privateKey = await this.#session.getVault();
        return KeyPair.fromPrivateKey(privateKey, chain.slip44);
      default:
        throw new Error(`Invalid wallet type ${WalletTypes[this.walletType]}`);
    }
  }

  async revealMnemonic(password: Uint8Array, chain: ChainConfig): Promise<string> {
    if (chain.hash() !== this.defaultChainHash) {
      throw new Error("invlid chain");
    }

    switch (this.walletType) {
      case WalletTypes.SecretPhrase:
        const words = await this.decrypt(password);

        return String(words);
      default:
        throw new Error(`Invalid wallet type ${WalletTypes[this.walletType]}`);
    }
  }

  async setSession(wordsOrKey: string | Uint8Array) {
    const sessionTime = this.settings.sessionTime;

    if (TypeOf.isString(wordsOrKey)) {
      const seed = await Bip39.mnemonicToSeed(String(wordsOrKey));

      await this.#session.setSession(sessionTime, seed);
    } else if (wordsOrKey instanceof Uint8Array) {
      await this.#session.setSession(sessionTime, wordsOrKey);
    } else {
      throw new Error("unk vault");
    }
  }

  async clearSession() {
    await this.#session.clearSession();
  }

  get vault() {
    return this.#vault;
  }

  toJSON(): IWalletState {
    return {
      uuid: this.uuid,
      walletType: this.walletType,
      walletName: this.walletName,
      authType: this.authType,
      accounts: this.accounts.map(a => a.toJSON()),
      selectedAccount: this.selectedAccount,
      tokens: this.tokens.map(t => t.toJSON()),
      history: this.history.map(h => h.toJSON() as unknown as IHistoricalTransactionState),
      confirm: this.confirm.map(c => c.toJSON()),
      settings: this.settings.toJSON(),
      defaultChainHash: this.defaultChainHash,
      vault: this.#vault,
    };
  }
}
