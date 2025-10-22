export interface NFTTokenMetadata {
  image?: string;
  name?: string;
  attributes?: any[];
}

export interface NFTTokenInfo {
  id: string;
  url?: string;
  meta?: NFTTokenMetadata;
}

export interface NFTMetadata {
  name: string;
  symbol: string;
  totalSupply?: string;
  standard: NFTStandard;
  balances: Record<number, Record<string, NFTTokenInfo>>;
  contractAddress: string;
  baseURI?: string;
}

