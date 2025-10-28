import { get } from "svelte/store";
import { MTypePopup } from "config/stream";
import { warpMessage, type SendResponseParams } from "lib/popup/warp-message";
import { Message } from "lib/streem/message";
import globalStore from "popup/store/global";
import type { IConfirmState } from "background/storage/confirm";
import type { IWeb3ConnectionPermissions, IWeb3ConnectionState } from "background/storage";
 

export async function responseToConnect(
  uuid: string,
  walletIndex: number,
  approve: boolean,
  permissions: IWeb3ConnectionPermissions,
) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.RESPONSE_TO_DAPP,
    payload: { uuid, walletIndex, approve, permissions },
  }).send();
  
  const resolve = warpMessage(data) as IConfirmState[];
  const currentState = get(globalStore);

  globalStore.set({
    ...currentState,
    wallets: currentState.wallets.map((wallet, index) => 
      index === walletIndex 
        ? { ...wallet, confirm: resolve }
        : wallet
    )
  });

  return resolve;
}

export async function disconnectWallet(
  domain: string,
  walletIndex: number,
) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.DISCONNECT_WALLET,
    payload: {
      domain,
      walletIndex,
    },
  }).send();
  
  const resolve = warpMessage(data) as IWeb3ConnectionState[];
  const currentState = get(globalStore);

  globalStore.set({
    ...currentState,
    connections: {
      list: resolve,
    },
  });

  return resolve;
}

