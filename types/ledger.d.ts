export interface LedgerPublicAddress {
  pubAddr: string;
  publicKey: string;
  index: number;
  name: string;
  slip44: number;
}

export interface AppConfiguration {
  version: string;
}
