import { WalletArgon2Params } from './argon';
import { CipherOrders } from '../../crypto/keychain';

export enum RatesApiOptions {
  CoinGecko
} 

export class WalletSettings {
  cipherOrders: CipherOrders[];
  argonParams: WalletArgon2Params;
  currencyConvert: string;
  ipfsNode: string | null;
  ensEnabled: boolean;
  tokensListFetcher: boolean;
  nodeRankingEnabled: boolean;
  maxConnections: number;
  requestTimeoutSecs: number;
  ratesApiOptions: RatesApiOptions;

  constructor(data: Record<string, unknown>) {
    this.cipherOrders = data.cipherOrders as CipherOrders[];
    this.argonParams = new WalletArgon2Params(data.argonParams as Record<string, unknown>);
    this.currencyConvert = data.currencyConvert as string;
    this.ipfsNode = data.ipfsNode as string || null;
    this.ensEnabled = data.ensEnabled as boolean;
    this.tokensListFetcher = data.tokensListFetcher as boolean;
    this.nodeRankingEnabled = data.nodeRankingEnabled as boolean;
    this.maxConnections = data.maxConnections as number;
    this.requestTimeoutSecs = data.requestTimeoutSecs as number;
    this.ratesApiOptions = data.ratesApiOptions as RatesApiOptions;
  }
}
