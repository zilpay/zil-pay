import type { BackgroundState, IChainConfigState, IFTokenState } from "background/storage";

import { get } from "svelte/store";
import { MTypePopup } from "config/stream";
import { warpMessage, type SendResponseParams } from "lib/popup/warp-message";
import { Message } from "lib/streem/message";
import globalStore from "popup/store/global";
 

export async function ftBalanceUpdate(walletIndex: number) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.WALLET_BALANCE_UPDATE,
    payload: { walletIndex },
  }).send();
  
  const resolve = warpMessage(data) as IFTokenState[];
  const currentState = get(globalStore);

  globalStore.set({
    ...currentState,
    wallets: currentState.wallets.map((wallet, index) => 
      index === walletIndex 
        ? { ...wallet, tokens: resolve }
        : wallet
    )
  });

  return resolve;
}

export async function fetchFTMeta(walletIndex: number, contract: string) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.FT_GET_META,
    payload: { walletIndex, contract },
  }).send();
  
  const resolve = warpMessage(data) as IFTokenState;
  const state = get(globalStore);
  const token = state.wallets[state.selectedWallet]?.tokens[0];

  if (token) {
    resolve.logo = token.logo;
  }
  return resolve;
}

export async function changeChainProvider(walletIndex: number, chainIndex: number) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.SWICH_CHAIN,
    payload: { walletIndex, chainIndex },
  }).send();
  
  const resolve = warpMessage(data) as BackgroundState;

  globalStore.set(resolve);

  return resolve;
}

export async function removeChainProvider(chainHash: number) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.REMOVE_CHAIN,
    payload: {
      chainHash,
    },
  }).send();
  
  const resolve = warpMessage(data) as IChainConfigState[];
  const currentState = get(globalStore);

  globalStore.set({
    ...currentState,
    chains: resolve,
  });

  return resolve;
}

export async function addEthereumChainResponse(
  uuid: string,
  walletIndex: number,
  approve: boolean,
) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.EVM_RESPONSE_ADD_ETHEREUM_CHAIN,
    payload: { uuid, walletIndex, approve, },
  }).send();
  
  const resolve = warpMessage(data) as IChainConfigState[];
  const currentState = get(globalStore);

  globalStore.set({
    ...currentState,
    chains: resolve,
  });

  return resolve;
}

