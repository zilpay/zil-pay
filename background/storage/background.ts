import type { IAddressBookRecord } from './book';
import { BrowserStorage, buildObject } from 'lib/storage';
import { ChainConfig, type IChainConfigState } from './chain';
import { Wallet, type IWalletState } from './wallet';
import { Fields } from 'config/fields';
import { migrateToV4 } from 'background/secure';
import { Themes } from 'config/theme';
import { Locales } from 'config/locale';

export interface IBackgroundState {
  storageVersion: number;
  wallets: IWalletState[];
  selectedWallet: number;
  notificationsGlobalEnabled: boolean;
  locale: Locales;
  appearances: Themes;
  abbreviatedNumber: boolean;
  hideBalance: boolean;
  tokensRow: boolean;
  chains: IChainConfigState[];
  book: IAddressBookRecord[];
}

export class BackgroundState implements IBackgroundState {
  readonly storageVersion  = 4;
  wallets: Wallet[];
  selectedWallet: number;
  notificationsGlobalEnabled: boolean;
  locale: Locales;
  appearances: Themes;
  abbreviatedNumber: boolean;
  hideBalance: boolean;
  tokensRow: boolean;
  chains: ChainConfig[];
  book: IAddressBookRecord[];

  static default() {
    return new BackgroundState({
      wallets: [],
      selectedWallet: -1,
      notificationsGlobalEnabled: true,
      locale: Locales.Auto,
      appearances: Themes.System,
      abbreviatedNumber: true,
      hideBalance: false,
      tokensRow: true,
      chains: [],
      storageVersion: 4,
      book: [],
    });
  }

  static async fromStorage() {
    const recordsv4 = await BrowserStorage.get<string>(Fields.STORAGE_V4);
    let state: BackgroundState;

    if (!recordsv4) {
      const oldRecords = await BrowserStorage.getAll<IBackgroundState>();

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

  constructor(data: IBackgroundState) {
    this.wallets = (data.wallets ?? []).map(
      (w) => new Wallet(w)
    );
    this.notificationsGlobalEnabled = data.notificationsGlobalEnabled;
    this.locale = data.locale ?? Locales.Auto;
    this.appearances = data.appearances;
    this.abbreviatedNumber = data.abbreviatedNumber;
    this.hideBalance = data.hideBalance;
    this.tokensRow = data.tokensRow;
    this.book = data.book ?? [];
    this.selectedWallet = Number(data.selectedWallet);
    this.chains = (data.chains).map(
      (c) => new ChainConfig(c)
    );
  }

  getChain(hash: number) {
    return this.chains.find((c) => c.hash() == hash);
  }

  async sync() {
    await BrowserStorage.set(
      buildObject(Fields.STORAGE_V4, JSON.stringify({
        ...this,
        selectedWallet: -1,
      })),
    );
  }

  toJSON(): IBackgroundState {
    return {
      storageVersion: this.storageVersion,
      wallets: this.wallets.map(w => w.toJSON()),
      selectedWallet: this.selectedWallet,
      notificationsGlobalEnabled: this.notificationsGlobalEnabled,
      locale: this.locale,
      appearances: this.appearances,
      abbreviatedNumber: this.abbreviatedNumber,
      hideBalance: this.hideBalance,
      tokensRow: this.tokensRow,
      book: this.book,
      chains: this.chains.map(c => c.toJSON()),
    };
  }
}
