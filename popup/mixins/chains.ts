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

export interface Chain {
  name: string;
  chain: string;
  logo: string;
  rpc: string[];
  features: string[];
  ftokens: FToken[];
  chainIds: number[];
  infoURL: string;
  shortName: string;
  slip44: number;
  explorers: Explorer[];
  networkId?: number;
  ens?: string;
}

export interface ChainData {
  mainnet: Chain[];
  testnet: Chain[];
}

export async function getChains(): Promise<ChainData> {
  try {
    const baseUrl = "/chains";
    const [mainnetResponse, testnetResponse] = await Promise.all([
      fetch(`${baseUrl}/mainnet.json`),
      fetch(`${baseUrl}/testnet.json`) 
    ]);
  
    const mainnet = await mainnetResponse.json() as Chain[];
    const testnet = testnetResponse.ok ? await testnetResponse.json() as Chain[] : [];

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
