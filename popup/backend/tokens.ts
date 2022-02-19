/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { ZRC2Info } from "types/token";
import { Message } from "lib/streem/message";
import { MTypePopup } from "lib/streem/stream-keys";
import { warpMessage } from "lib/utils/warp-message";
import { updateState } from './store-update';
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

export async function getTokens(limit = 40, offset = 0, type = 1) {
  const params = `?limit=${limit}&offset=${offset}&type=${type}`;
  const url = `${MAIN_API}/tokens${params}`;
  const res = await fetch(url);
  return await res.json();
}

export async function getNFTs(address: string) {
  // const url = `${MAIN_API}/nfts/${address}`;
  const url = `http://127.0.0.1:3000/api/v1/nfts/${address}`;
  const res = await fetch(url);
  return await res.json();
}
