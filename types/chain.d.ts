export interface EvmNativeCurrency {
  name: string;
  symbol: string;
  decimals: number;
}

export interface EvmAddChainParams {
  chainId: string;
  chainName: string;
  nativeCurrency: EvmNativeCurrency;
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  iconUrls?: string[];
}

export interface EvmAddChainRequest {
  params: EvmAddChainParams;
  domain: string;
  title: string;
  icon: string;
}
