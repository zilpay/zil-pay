export interface LedgerVersion {
  version: string;
}

export interface LedgerPublicAddress {
  pubAddr: string;
  publicKey: string;
}

export interface MessagePayload {
  hash: string;
}

export interface LedgerEthAddress {
  publicKey: string;
  address: string;
  chainCode?: string;
}

export interface EthSignature {
  v: number;
  r: string;
  s: string;
}

export interface AppConfiguration {
  version: string;
}
