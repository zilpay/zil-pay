import type { Bip32Account } from './account';
import { base64ToUint8Array, uint8ArrayToBase64 } from '../../crypto/b64';
import { generateSalt } from '../../lib/runtime';
import { Account } from './account';
import { FToken } from './ftoken';
import { WalletSettings } from './settings';
import { Session } from '../secure/session';
import { ChainConfig } from './chain';
import { Bip39 } from '../../crypto/bip39';
import { uuid } from '../../crypto/uuid';
import { TypeOf } from 'lib/types';
import { KeyPair } from 'crypto/keypair';
import { uint8ArrayToUtf8, utf8ToUint8Array } from 'lib/utils/utf8';

export enum WalletTypes {
    Ledger,
    SecretPhrase,
    SecretKey,
}

export enum AuthMethod {
    Biometric,
    None,
}

export class Wallet {
  #session: Session;

  uuid: string;
  walletType: WalletTypes;
  walletName: string;
  authType: AuthMethod;
  accounts: Account[];
  selectedAccount: number;
  tokens: FToken[];
  settings: WalletSettings;
  defaultChainHash: number;
  vault: string;

  constructor(data: Record<string, unknown>) {
    this.walletType = data.walletType as WalletTypes;
    this.walletName = data.walletName as string;
    this.authType = data.authType as AuthMethod;
    this.accounts = (data.accounts as Record<string, unknown>[]).map(
      (a) => new Account(a)
    );
    this.selectedAccount = data.selectedAccount as number;
    this.tokens = (data.tokens as Record<string, unknown>[]).map(
      (t) => new FToken(t)
    );
    this.settings = new WalletSettings(data.settings as Record<string, unknown>);
    this.defaultChainHash = data.defaultChainHash as number;
    this.uuid = data.uuid as string;
    this.#session = new Session(this.uuid);

    this.vault = data.vault as string ?? "";
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
    });

    await wallet.encrypt(passwordBytes, keyPair.privateKey);

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
    });
    const passwordBytes = utf8ToUint8Array(password);
    const wordsBytes = utf8ToUint8Array(words);

    wallet.accounts = await Promise.all(bip32Accounts.map((acc) => Account.fromBip39(acc, chain, seed)));
    await wallet.encrypt(passwordBytes, wordsBytes);

    return wallet;
  }

  async decrypt(password: Uint8Array): Promise<Uint8Array | string> {
    const salt = await generateSalt();
    const keychain = await this.settings.hashFnParams.deriveKey(password, salt);
    const ciphertext = base64ToUint8Array(this.vault);
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

    this.vault = uint8ArrayToBase64(cipher);

    return cipher;
  }

  async unlock(password: Uint8Array) {
    const wordsOrKey = await this.decrypt(password);
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

  async clearSession() {
    await this.#session.clearSession();
  }
}
