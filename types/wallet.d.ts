import type { IChainConfigState } from 'background/storage';

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
  walletName: string;
  accountName: string;
  chain: IChainConfigState;
  password: string;
  settings: IWalletSettingsState;
}

export interface IKeyPair {
  address: string;
  privateKey: string;
  publicKey: string;
  slip44: number;
};
