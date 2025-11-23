import type { IFTokenState } from "background/storage";

import { get } from "svelte/store";
import { MTypePopup } from "config/stream";
import { warpMessage, type SendResponseParams } from "lib/popup/warp-message";
import { Message } from "lib/streem/message";
import globalStore from "popup/store/global";
import type { NFTMetadata } from "types/token";
 

const RATES_CACHE_KEY = 'zilpay_last_rates_update';
const RATES_THROTTLE_MS = 10 * 60 * 1000;

function shouldUpdateRates(): boolean {
  const lastUpdate = localStorage.getItem(RATES_CACHE_KEY);
  if (!lastUpdate) return true;

  const lastUpdateTime = parseInt(lastUpdate, 10);
  const now = Date.now();
  
  return (now - lastUpdateTime) >= RATES_THROTTLE_MS;
}

export async function ftUpdateRates(walletIndex: number) {
  if (!shouldUpdateRates()) {
    return;
  }

  const data = await new Message<SendResponseParams>({
    type: MTypePopup.FT_UPDATE_RATES,
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

  localStorage.setItem(RATES_CACHE_KEY, Date.now().toString());

  return resolve;
}

export async function fetchNFTMeta(walletIndex: number, contract: string) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.NFT_GET_META,
    payload: { walletIndex, contract },
  }).send();

  const resolve = warpMessage(data) as NFTMetadata;

  return resolve;
}

export async function tokensAutoHints() {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.FT_AUTO_HINTS_TOKENS,
    payload: {},
  }).send();

  const resolve = warpMessage(data) as IFTokenState[];
  return resolve;
}

export async function addEthereumWatchAssetResponse(
  uuid: string,
  walletIndex: number,
  approve: boolean,
) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.EVM_RESPONSE_WATCH_ASSET,
    payload: { uuid, walletIndex, approve, },
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

