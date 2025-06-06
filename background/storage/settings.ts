import { WalletArgon2Params } from "./argon";

export class WalletSettings {
  cipherOrders: Uint8Array;
  argonParams: WalletArgon2Params;
  currencyConvert: string;
  ipfsNode: string | null;
  ensEnabled: boolean;
  tokensListFetcher: boolean;
  nodeRankingEnabled: boolean;
  maxConnections: number;
  requestTimeoutSecs: number;
  ratesApiOptions: number;

  constructor(data: {
    cipherOrders: Uint8Array;
    argonParams: WalletArgon2Params;
    currencyConvert: string;
    ipfsNode?: string | null;
    ensEnabled: boolean;
    tokensListFetcher: boolean;
    nodeRankingEnabled: boolean;
    maxConnections: number;
    requestTimeoutSecs: number;
    ratesApiOptions: number;
  }) {
    this.cipherOrders = data.cipherOrders;
    this.argonParams = data.argonParams;
    this.currencyConvert = data.currencyConvert;
    this.ipfsNode = data.ipfsNode ?? null;
    this.ensEnabled = data.ensEnabled;
    this.tokensListFetcher = data.tokensListFetcher;
    this.nodeRankingEnabled = data.nodeRankingEnabled;
    this.maxConnections = data.maxConnections;
    this.requestTimeoutSecs = data.requestTimeoutSecs;
    this.ratesApiOptions = data.ratesApiOptions;
  }
}
