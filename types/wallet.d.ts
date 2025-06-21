export interface RequiredSettings {
  cipherOrders: CipherOrders[];
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

export interface RequiredHashSettings {
  memory: number;
  iterations: number;
  threads: number;
  secret: string;
  hashType: HashTypes;
  hashSize: ShaAlgorithms;
}

export interface SetPasswordPayload {
  cipherOrders: CipherOrders[];
  walletIndex: number;
  hashSettings: RequiredHashSettings;
  currentPassword: string;
  newPassword: string;
}

export interface WalletFromPrivateKeyParams {
  key: string;
  walletName: string;
  accountName: string;
  hashSettings: RequiredHashSettings;
  chainHash: number;
  password: string;
  settings: RequiredSettings;
}
