export interface NFTMetadata {
  name: string;
  symbol: string;
  totalSupply?: string;
  standard: NFTStandard;
  balances: Record<number, Record<string, NFTTokenInfo>>;
  contractAddress: string;
  baseURI?: string;
}

