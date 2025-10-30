import type { BackgroundState, IWalletState } from "background/storage";

import { get } from "svelte/store";
import { MTypePopup } from "config/stream";
import { Themes } from "config/theme";
import { warpMessage, type SendResponseParams } from "lib/popup/warp-message";
import { Message } from "lib/streem/message";
import { themeDetect } from "popup/mixins/theme";
import globalStore from "popup/store/global";
import type { AccountFromBip39Params, IKeyPair, WalletAddressInfo, WalletFromBip39Params, WalletFromPrivateKeyParams } from "types/wallet";
 
export async function getGlobalState() {
  const data = await Message.signal<SendResponseParams>(MTypePopup.GET_GLOBAL_STATE).send();
  let resolve = warpMessage(data) as BackgroundState;

  try {
    let theme = resolve.appearances;

    if (resolve.appearances == Themes.System) {
      theme = themeDetect();
    }

    document.body.setAttribute("theme", theme);
    globalStore.set(resolve);
  } catch {
    ///
  }

  return resolve;
}

export async function generateKeyPair(slip44: number) {
  const data =    await new Message<SendResponseParams>({
    type: MTypePopup.GEN_KEYPAIR,
    payload: {
      slip44,
    },
  }).send();
  let resolve = warpMessage(data) as IKeyPair;
  return resolve;
}

export async function getAllAddressesByChain(walletIndex: number, accountIndex: number) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.GET_ALL_ACCOUNTS_BY_CHAIN,
    payload: {
      walletIndex,
      accountIndex,
    },
  }).send();
  let resolve = warpMessage(data) as WalletAddressInfo[];
  return resolve;
}

export async function fromRpivKey(slip44: number, key: string) {
  const data =    await new Message<SendResponseParams>({
    type: MTypePopup.FROM_PRIV_KEY,
    payload: {
      slip44,
      key,
    },
  }).send();
  let resolve = warpMessage(data) as IKeyPair;
  return resolve;
}

export async function validateBip39Checksum(phrase: string, wordList: string[]) {
  const data =    await new Message<SendResponseParams>({
    type: MTypePopup.VALIDATE_BIP39_CHECK_SUM,
    payload: {
      phrase,
      wordList,
    },
  }).send();
  let resolve = warpMessage(data) as boolean;
  return resolve;
}



export async function generateBip39Words(count: number, wordList: string[]) {
  const data =    await new Message<SendResponseParams>({
    type: MTypePopup.GEN_BIP39,
    payload: {
      count,
      wordList
    },
  }).send();
  let resolve = warpMessage(data) as string;

  return resolve;
}


export async function setGlobalState() {
  const globalState = get(globalStore);

   await new Message({
    type: MTypePopup.SET_GLOBAL_STATE,
    payload: globalState,
  }).send();
}

export async function walletFromPrivateKey(payload: WalletFromPrivateKeyParams) {
  const data =    await new Message<SendResponseParams>({
    payload,
    type: MTypePopup.WALLET_FROM_PRIVATE_KEY,
  }).send();
  let resolve = warpMessage(data) as BackgroundState;

  globalStore.set(resolve);

  return resolve;
}

export async function walletFromBip39Mnemonic(payload: WalletFromBip39Params) {
  const data =    await new Message<SendResponseParams>({
    payload,
    type: MTypePopup.WALLET_FROM_BIP39,
  }).send();
  let resolve = warpMessage(data) as BackgroundState;

  globalStore.set(resolve);

  return resolve;
}

export async function addNextBip39Account(payload: AccountFromBip39Params) {
  const data =    await new Message<SendResponseParams>({
    payload,
    type: MTypePopup.ADD_NEXT_BIP39_ACCOUNT,
  }).send();
  let resolve = warpMessage(data) as BackgroundState;

  globalStore.set(resolve);

  return resolve;
}


export async function unlockWallet(password: string, walletIndex: number) {
  const data = await new Message<SendResponseParams>({
    payload: {
      walletIndex,
      password,
    },
    type: MTypePopup.UNLOCK_WALLET,
  }).send();
  let resolve = warpMessage(data) as BackgroundState;

  globalStore.set(resolve);

  return resolve;
}

export async function destroyWallet(password: string, walletIndex: number) {
  const data = await new Message<SendResponseParams>({
    payload: {
      walletIndex,
      password,
    },
    type: MTypePopup.DESTROY_WALLET,
  }).send();
  let resolve = warpMessage(data) as BackgroundState;

  globalStore.set(resolve);

  return resolve;
}

export async function logout(walletIndex: number) {
  const data = await new Message<SendResponseParams>({
    payload: {
      walletIndex,
    },
    type: MTypePopup.LOG_OUT,
  }).send();
  let resolve = warpMessage(data) as BackgroundState;

  globalStore.set(resolve);

  return resolve;
}

export async function exportbip39Words(password: string, walletIndex: number) {
  const data = await new Message<SendResponseParams>({
    payload: {
      walletIndex,
      password,
    },
    type: MTypePopup.REVEAL_BIP39,
  }).send();
  let resolve = warpMessage(data) as string;

  return resolve;
}

export async function exportKeyPair(password: string, walletIndex: number, accountIndex: number) {
  const data = await new Message<SendResponseParams>({
    payload: {
      walletIndex,
      password,
      accountIndex,
    },
    type: MTypePopup.REVEAL_KEY,
  }).send();
  let resolve = warpMessage(data) as IKeyPair;

  return resolve;
}

export async function selectAccount(walletIndex: number, accountIndex: number) {
  const data = await new Message<SendResponseParams>({
    payload: {
      walletIndex,
      accountIndex,
    },
    type: MTypePopup.SELECT_ACCOUNT,
  }).send();
  let resolve = warpMessage(data) as IWalletState[];
  const currentState = get(globalStore);

  globalStore.set({
    ...currentState,
    wallets: resolve,
  });

  return resolve;
}

