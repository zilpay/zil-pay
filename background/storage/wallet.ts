import { utils } from 'aes-js';
import { base64ToUint8Array, uint8ArrayToBase64 } from '../../crypto/b64';
import { generateSalt } from '../../lib/runtime';
import { Account } from './account';
import { FToken } from './ftoken';
import { WalletSettings } from './settings';
import { Session } from '../secure/session';
import { ChainConfig } from './chain';
import { Bip32Account } from './account';
import { Bip39 } from '../../crypto/bip39';

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
    this.vault = data.vault as string;
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
  }

  async fromBip39(
    words: string,
    verifyCheckSum: boolean,
    walletName: string,
    accounts: Bip32Account[],
    settings: WalletSettings,
    chain: ChainConfig,
    wordList: string[],
    passphrase?: string
  ) {
    if (verifyCheckSum) {
      await Bip39.validateMnemonic(words, wordList);
    }

    const seed = await Bip39.mnemonicToSeed(words, passphrase);
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
}
