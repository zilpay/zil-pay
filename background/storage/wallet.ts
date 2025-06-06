import { Account } from './account';
import { FToken } from './ftoken';
import { WalletSettings } from './settings';

export class Wallet {
  walletType: string;
  walletName: string;
  authType: string;
  walletAddress: string;
  accounts: Account[];
  selectedAccount: number;
  tokens: FToken[];
  settings: WalletSettings;
  defaultChainHash: number;

  constructor(data: {
    walletType: string;
    walletName: string;
    authType: string;
    walletAddress: string;
    accounts: Account[];
    selectedAccount: number;
    tokens: FToken[];
    settings: WalletSettings;
    defaultChainHash: number;
  }) {
    this.walletType = data.walletType;
    this.walletName = data.walletName;
    this.authType = data.authType;
    this.walletAddress = data.walletAddress;
    this.accounts = data.accounts;
    this.selectedAccount = data.selectedAccount;
    this.tokens = data.tokens;
    this.settings = data.settings;
    this.defaultChainHash = data.defaultChainHash;
  }
}
