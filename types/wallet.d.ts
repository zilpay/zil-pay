export interface SetPasswordPayload {
  cipherOrders: CipherOrders[];
  walletIndex: number;
  hashSettings: RequiredHashSettings;
  currentPassword: string;
  newPassword: string;
}

export interface WalletFromPrivateKeyParams {
  key: string;
  walletName: string;
  accountName: string;
  hashSettings: RequiredHashSettings;
  chainHash: number;
  password: string;
  settings: IWalletSettingsState;
}
