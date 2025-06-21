import { BrowserStorage, buildObject } from 'lib/storage';
import { ChainConfig } from './chain';
import { Wallet } from './wallet';
import { Fields } from 'config/fields';
import { migrateToV4 } from 'background/secure';

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

  static async fromStorage() {
    const recordsv4 = await BrowserStorage.get<string>(Fields.STORAGE_V4);
    let state: BackgroundState;

    if (!recordsv4) {
      const oldRecords = await BrowserStorage.getAll();

      if (oldRecords) {
        try {
          state = migrateToV4(oldRecords);
          await BrowserStorage.clear();
          await state.sync();
        } catch {
          state = BackgroundState.default();
        }
      } else {
        state = BackgroundState.default();
      }
    } else {
      try {
        state = new BackgroundState(JSON.parse(recordsv4));
      } catch {
        state = BackgroundState.default();
      }
    }

    return state;
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

  getChain(hash: number) {
    return this.chains.find((c) => c.hash() == hash);
  }

  async sync() {
    await BrowserStorage.set(
      buildObject(Fields.STORAGE_V4, JSON.stringify(this)),
    );
  }
}
