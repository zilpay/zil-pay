import type { IChainConfigState } from "background/storage";
import { get } from "svelte/store";
import globalStore from "popup/store/global";
import { hashChainConfig } from "lib/utils/hashing";

export interface ChainData {
  mainnet: IChainConfigState[];
  testnet: IChainConfigState[];
}

export function getWalletChain(walletIndex: number) {
  const globalState = get(globalStore);
  const wallet = globalState.wallets[walletIndex];

  if (!wallet) {
    return;
  }

  return globalState.chains.find((c) => {
    const hash = hashChainConfig(c.chainIds, c.slip44, c.chain);

    return hash == wallet.defaultChainHash;
  });
}

export function getAccountChain(walletIndex: number) {
  const globalState = get(globalStore);
  const wallet = globalState.wallets[walletIndex];
  const accountIndex = wallet.selectedAccount;

  if (!wallet) {
    return;
  }

  return globalState.chains.find((c) => {
    const hash = hashChainConfig(c.chainIds, c.slip44, c.chain);

    return hash == wallet.accounts[accountIndex].chainHash;
  });
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
