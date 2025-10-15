import type { IChainConfigState } from "background/storage";
import type { Bip32Account } from "background/storage";
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

