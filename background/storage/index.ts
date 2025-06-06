import { StorageMeta } from './meta';
import { AppState } from './app';
import { UserPreferences } from './preferences';
import { Vault } from './vault';
import { Wallet } from './wallet';
import { FToken } from './token';
import { Chain } from './chain';
import { Contact } from './contact';
import { ConnectedDApp } from './connection';
import { PendingConfirmation } from './pending-confirmation';

export class ZilPayStorageClass {
  meta: StorageMeta;
  userPreferences: UserPreferences;
  appState: AppState;
  vault: Vault;
  wallets: Wallet[];
  chains: Chain[];
  contacts: Contact[];
  ftokens: FToken[];
  connectedDapps: ConnectedDApp[];
  pendingConfirmations: PendingConfirmation[];
  currencyRates: { [currencyCode: string]: number };

  constructor(data: Record<string, unknown>) {}
}
