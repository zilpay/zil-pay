import { ChainConfig } from './chain';
import { Wallet } from './wallet';

export class BackgroundState {
  wallets: Wallet[];
  notificationsGlobalEnabled: boolean;
  locale: string | null;
  appearances: number;
  abbreviatedNumber: boolean;
  chains: ChainConfig[];

  constructor(data: {
    wallets: Wallet[];
    notificationsGlobalEnabled: boolean;
    locale?: string | null;
    appearances: number;
    abbreviatedNumber: boolean;
    chains: ChainConfig[];
  }) {
    this.wallets = data.wallets;
    this.notificationsGlobalEnabled = data.notificationsGlobalEnabled;
    this.locale = data.locale ?? null;
    this.appearances = data.appearances;
    this.abbreviatedNumber = data.abbreviatedNumber;
    this.chains = data.chains;
  }
}
