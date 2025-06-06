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
  vault: string;

  constructor(data: Record<string, unknown>) {
    this.walletType = data.walletType as string;
    this.vault = data.vault as string;
    this.walletName = data.walletName as string;
    this.authType = data.authType as string;
    this.walletAddress = data.walletAddress as string;
    this.accounts = (data.accounts as Record<string, unknown>[]).map(
      (a) => new Account(a)
    );
    this.selectedAccount = data.selectedAccount as number;
    this.tokens = (data.tokens as Record<string, unknown>[]).map(
      (t) => new FToken(t)
    );
    this.settings = new WalletSettings(data.settings as Record<string, unknown>);
    this.defaultChainHash = data.defaultChainHash as number;
  }
}
