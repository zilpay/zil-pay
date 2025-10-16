import type { IChainConfigState } from "background/storage";
import type { AddressCategory } from "config/common";

export interface SetPasswordPayload {
  cipherOrders: CipherOrders[];
  walletIndex: number;
  hashSettings: RequiredHashSettings;
  currentPassword: string;
  newPassword: string;
}

export interface WalletFromPrivateKeyParams {
  key: IKeyPair;
  walletName: string;
  accountName: string;
  chain: IChainConfigState;
  password: string;
  settings: IWalletSettingsState;
}

export interface WalletFromBip39Params {
  mnemonic: string;
  bip39WordList: string[];
  walletName: string;
  accounts: Bip32Account[];
  verifyCheckSum: boolean;
  chain: IChainConfigState;
  password: string;
  passphrase?: string;
  settings: IWalletSettingsState;
}

export interface Bip32Account {
  name: string;
  index: number;
}

export interface AccountFromBip39Params {
  account: Bip32Account;
  walletIndex: number;
}

export interface IKeyPair {
  address: string;
  privateKey: string;
  publicKey: string;
  slip44: number;
}

export interface WalletAddressInfo {
  addr: string;
  accountName: string;
  walletIndex: number;
  walletName: string;
  addrType: AddressType;
  category: AddressCategory;
}

