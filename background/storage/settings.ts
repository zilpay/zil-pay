import { WalletHashParams, type IWalletHashParams } from './argon';
import { CipherOrders } from '../../crypto/keychain';
import type { RatesApiOptions } from 'config/api';
import { GasSpeed } from 'config/gas';

export interface IWalletSettingsState {
  cipherOrders: CipherOrders[];
  hashFnParams: IWalletHashParams;
  currencyConvert: string;
  ipfsNode: string | null;
  ensEnabled: boolean;
  tokensListFetcher: boolean;
  nodeRankingEnabled: boolean;
  maxConnections: number;
  requestTimeoutSecs: number;
  ratesApiOptions: RatesApiOptions;
  sessionTime: number;
  gasOption: GasSpeed;
}

export class WalletSettings implements IWalletSettingsState {
  cipherOrders: CipherOrders[];
  hashFnParams: WalletHashParams;
  currencyConvert: string;
  ipfsNode: string | null;
  ensEnabled: boolean;
  tokensListFetcher: boolean;
  nodeRankingEnabled: boolean;
  maxConnections: number;
  requestTimeoutSecs: number;
  ratesApiOptions: RatesApiOptions;
  sessionTime: number;
  gasOption: GasSpeed;

  constructor(data: IWalletSettingsState) {
    this.cipherOrders = data.cipherOrders;
    this.hashFnParams = new WalletHashParams(data.hashFnParams);
    this.currencyConvert = data.currencyConvert;
    this.ipfsNode = data.ipfsNode;
    this.ensEnabled = data.ensEnabled;
    this.gasOption = data.gasOption ?? GasSpeed.Market;
    this.tokensListFetcher = data.tokensListFetcher;
    this.nodeRankingEnabled = data.nodeRankingEnabled;
    this.maxConnections = data.maxConnections;
    this.requestTimeoutSecs = data.requestTimeoutSecs;
    this.ratesApiOptions = data.ratesApiOptions;
    this.sessionTime = data.sessionTime ?? 3600;
  }

  toJSON(): IWalletSettingsState {
    return {
      cipherOrders: this.cipherOrders,
      hashFnParams: this.hashFnParams.toJSON(),
      currencyConvert: this.currencyConvert,
      ipfsNode: this.ipfsNode,
      ensEnabled: this.ensEnabled,
      tokensListFetcher: this.tokensListFetcher,
      nodeRankingEnabled: this.nodeRankingEnabled,
      maxConnections: this.maxConnections,
      requestTimeoutSecs: this.requestTimeoutSecs,
      ratesApiOptions: this.ratesApiOptions,
      sessionTime: this.sessionTime,
      gasOption: this.gasOption
    };
  }
}
