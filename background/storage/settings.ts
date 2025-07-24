import { WalletHashParams, type IWalletHashParams } from './argon';
import { CipherOrders } from '../../crypto/keychain';
import type { RatesApiOptions } from 'config/api';

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

  constructor(data: IWalletSettingsState) {
    this.cipherOrders = data.cipherOrders;
    this.hashFnParams = new WalletHashParams(data.hashFnParams);
    this.currencyConvert = data.currencyConvert;
    this.ipfsNode = data.ipfsNode;
    this.ensEnabled = data.ensEnabled;
    this.tokensListFetcher = data.tokensListFetcher;
    this.nodeRankingEnabled = data.nodeRankingEnabled;
    this.maxConnections = data.maxConnections;
    this.requestTimeoutSecs = data.requestTimeoutSecs;
    this.ratesApiOptions = data.ratesApiOptions;
    this.sessionTime = data.sessionTime ?? 3600;
  }
}
