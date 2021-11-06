/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { WalletState } from 'types/account';
import { Message } from "lib/streem/message";
import { MTypePopup } from "lib/streem/stream-keys";
import { warpMessage } from "lib/utils/warp-message";
import { updateState } from './store-update';

export async function getState() {
  const data = await Message.signal(
    MTypePopup.GET_WALLET_STATE
  ).send();
  const state = warpMessage(data) as WalletState;
  updateState(state);
  return state;
}

export async function unlockWallet(password: string) {
  const data = await new Message({
    type: MTypePopup.SET_PASSWORD,
    payload: {
      password
    }
  }).send();
  const state = warpMessage(data) as WalletState;
  updateState(state);
  return state;
}

export async function restorePhrase(seed: string, password: string) {
  const data = await new Message({
    type: MTypePopup.SET_SEED_AND_PASSWORD,
    payload: {
      seed,
      password
    }
  }).send();
  const state = warpMessage(data) as WalletState;
  updateState(state);
  return state;
}

export async function selectAccount(index: number) {
  const data = await new Message({
    type: MTypePopup.SELECT_ACCOUNT,
    payload: {
      index
    }
  }).send();
  const state = warpMessage(data) as WalletState;
  updateState(state);
  return state;
}

export async function createNextSeedAccount(name: string) {
  const data = await new Message({
    type: MTypePopup.CREATE_ACCOUNT_BY_SEED,
    payload: {
      name
    }
  }).send();
  const state = warpMessage(data) as WalletState;
  updateState(state);
  return state;
}

export async function balanceUpdate() {
  const data = await Message.signal(
    MTypePopup.UPDATE_BALANCE
  ).send();
  const state = warpMessage(data) as WalletState;
  updateState(state);
  return state;
}