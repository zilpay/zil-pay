import { ChainConfig } from './chain';
import { Wallet } from './wallet';

export enum AppearancesTheme {
  System,
  Dark,
  Light
}

export class BackgroundState {
  readonly storageVersion  = 4;
  wallets: Wallet[];
  notificationsGlobalEnabled: boolean;
  locale: string | null;
  appearances: AppearancesTheme;
  abbreviatedNumber: boolean;
  hideBalance: boolean;
  chains: ChainConfig[];

  static default() {
    return new BackgroundState({
      wallets: [],
      notificationsGlobalEnabled: true,
      locale: 'auto',
      appearances: AppearancesTheme.System,
      abbreviatedNumber: true,
      hideBalance: false,
      chains: [], 
    });
  }

  constructor(data: Record<string, unknown>) {
    this.wallets = (data.wallets as Record<string, unknown>[] ?? []).map(
      (w) => new Wallet(w)
    );
    this.notificationsGlobalEnabled = data.notificationsGlobalEnabled as boolean;
    this.locale = data.locale as string | null ?? null;
    this.appearances = data.appearances as AppearancesTheme;
    this.abbreviatedNumber = data.abbreviatedNumber as boolean;
    this.hideBalance= data.hideBalance as boolean;
    this.chains = (data.chains as Record<string, unknown>[]).map(
      (c) => new ChainConfig(c)
    );
  }
}
