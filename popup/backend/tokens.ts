/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { ZRC2Info, ZRCNFT } from "types/token";
import { Message } from "lib/streem/message";
import { MTypePopup } from "lib/streem/stream-keys";
import { warpMessage } from "lib/utils/warp-message";
import { updateState } from './store-update';
import nftListStore from 'popup/store/nft-list';

import { MAIN_API } from 'config/api-list';

export async function getZRC2State(address: string) {
  const data = await new Message({
    type: MTypePopup.GET_ZRC2_STATE,
    payload: {
      address
    }
  }).send();
  const state = warpMessage(data);
  return state;
}

export async function addZRC2Token(token: ZRC2Info) {
  const data = await new Message({
    type: MTypePopup.ADD_ZRC2_TOKEN,
    payload: token
  }).send();
  const state = warpMessage(data);
  updateState(state);
  return state;
}

export async function getAllowancesForSwap(token: string) {
  const data = await new Message({
    type: MTypePopup.GET_ZRC2_ALLOWANCES_FOR_SWAP,
    payload: token
  }).send();
  return warpMessage(data);
}

export async function removeZRC2Token(index: number) {
  const data = await new Message({
    type: MTypePopup.RM_TOKEN,
    payload: {
      index
    }
  }).send();
  const state = warpMessage(data);
  updateState(state);
  return state;
}

export async function getTokens(limit = 40, offset = 0) {
  const params = `?limit=${limit}&offset=${offset}&type=1`;
  const url = `${MAIN_API}/tokens${params}`;
  const res = await fetch(url);
  return await res.json();
}

export async function updateNFTList() {
  const data = await Message.signal(MTypePopup.UPDATE_NFT_LIST).send();
  const state = warpMessage(data);
  nftListStore.set(state);
  return state;
}

export async function getNFTList() {
  const data = await Message.signal(MTypePopup.GET_NFT_LIST).send();
  const state = warpMessage(data);
  nftListStore.set(state);
  return state;
}

export async function fetchNFTToken(addr: string) {
  const data = await new Message({
    type: MTypePopup.FETCH_NFT,
    payload: [addr]
  }).send();
  const [state] = warpMessage(data);
  return state;
}

export async function addNFTToken(payload: ZRCNFT) {
  const data = await new Message({
    type: MTypePopup.ADD_NFT,
    payload: payload
  }).send();
  const state = warpMessage(data);
  nftListStore.set(state);
  return state;
}

export async function removeNFTToken(index: number) {
  const data = await new Message({
    type: MTypePopup.REMOVE_NFT,
    payload: index
  }).send();
  const state = warpMessage(data);
  nftListStore.set(state);
  return state;
}

