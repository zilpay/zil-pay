export interface LedgerPublicAddress {
  pubAddr: string;
  publicKey: string;
  index: number;
  name: string;
}

export interface EthSignature {
  v: number;
  r: string;
  s: string;
}

export interface AppConfiguration {
  version: string;
}
