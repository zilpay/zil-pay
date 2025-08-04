import type { IChainConfigState } from "background/storage";

export interface Explorer {
  name: string;
  url: string;
  icon: string;
  standard: string;
}

export interface FToken {
  native: boolean;
  logo: string;
  addr: string;
  name: string;
  symbol: string;
  decimals: number;
}

export interface ChainData {
  mainnet: IChainConfigState[];
  testnet: IChainConfigState[];
}

export async function getChains(): Promise<ChainData> {
  try {
    const baseUrl = "/chains";
    const [mainnetResponse, testnetResponse] = await Promise.all([
      fetch(`${baseUrl}/mainnet.json`),
      fetch(`${baseUrl}/testnet.json`) 
    ]);
  
    const mainnet = await mainnetResponse.json() as IChainConfigState[];
    const testnet = testnetResponse.ok ? await testnetResponse.json() as IChainConfigState[] : [];

    return {
      mainnet,
      testnet
    };
  } catch (error) {
    return {
      mainnet: [],
      testnet: []
    };
  }
}
