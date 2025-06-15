import type { Bip32Account } from './account';
import { utils } from 'aes-js';
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
import { DerivationPath } from 'crypto/bip49';
import { deriveFromPrivateKeyPublicKey, derivePrivateKey, type KeyPair } from 'crypto/bip32';

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
    const passwordBytes = utils.utf8.toBytes(password);
    const wordsBytes = utils.utf8.toBytes(words);

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
      return utils.utf8.fromBytes(decrypted);
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

    if (this.walletType == WalletTypes.SecretKey) {
      const vault = await this.#session.getVault();
      const hdPath = new DerivationPath(chain.slip44, accountIndex);
      const privateKey = await derivePrivateKey(vault, hdPath.getPath());
      const pubKey = await deriveFromPrivateKeyPublicKey(privateKey, chain.slip44);

      return { privateKey, pubKey };
    }

    if (this.walletType == WalletTypes.SecretKey) {
      const vault = await this.#session.getVault();
    } 

    throw new Error(`invalid Wallet type ${WalletTypes[this.walletType]}`);
  }

  async revealMnemonic(password: Uint8Array) {}
}
