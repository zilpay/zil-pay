import { WalletHashParams, type IWalletHashParams } from './argon';
import type { RatesApiOptions } from 'config/api';
import { GasSpeed } from 'config/gas';
import type { CipherOrders } from 'config/keychain';

export interface IWalletSettingsState {
  cipherOrders: CipherOrders[];
  hashFnParams: IWalletHashParams;
  currencyConvert: string;
  ensEnabled: boolean;
  tokensListFetcher: boolean;
  ratesApiOptions: RatesApiOptions;
  sessionTime: number;
  gasOption: GasSpeed;
}

export class WalletSettings implements IWalletSettingsState {
  cipherOrders: CipherOrders[];
  hashFnParams: WalletHashParams;
  currencyConvert: string;
  ensEnabled: boolean;
  tokensListFetcher: boolean;
  ratesApiOptions: RatesApiOptions;
  sessionTime: number;
  gasOption: GasSpeed;

  constructor(data: IWalletSettingsState) {
    this.cipherOrders = data.cipherOrders;
    this.hashFnParams = new WalletHashParams(data.hashFnParams);
    this.currencyConvert = data.currencyConvert;
    this.ensEnabled = data.ensEnabled;
    this.gasOption = data.gasOption ?? GasSpeed.Market;
    this.tokensListFetcher = data.tokensListFetcher;
    this.ratesApiOptions = data.ratesApiOptions;
    this.sessionTime = data.sessionTime ?? 3600;
  }

  toJSON(): IWalletSettingsState {
    return {
      cipherOrders: this.cipherOrders,
      hashFnParams: this.hashFnParams.toJSON(),
      currencyConvert: this.currencyConvert,
      ensEnabled: this.ensEnabled,
      tokensListFetcher: this.tokensListFetcher,
      ratesApiOptions: this.ratesApiOptions,
      sessionTime: this.sessionTime,
      gasOption: this.gasOption
    };
  }
}
