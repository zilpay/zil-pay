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

export async function importPrivateKey(privKey: string, name: string) {
  const data = await new Message({
    type: MTypePopup.IMPORT_PRIVATE_KEY,
    payload: {
      name,
      privKey
    }
  }).send();
  const state = warpMessage(data) as WalletState;
  updateState(state);
  return state;
}

export async function getQrCOde(index: number) {
  const data = await new Message({
    type: MTypePopup.EXPORT_QR_CODE,
    payload: {
      index
    }
  }).send();
  return warpMessage(data);
}

export async function exportSecrePhrase(password: string) {
  const data = await new Message({
    type: MTypePopup.EXPORT_SEED,
    payload: {
      password
    }
  }).send();
  return warpMessage(data);
}

export async function exportPrivateKey(password: string) {
  const data = await new Message({
    type: MTypePopup.EXPORT_PRIVATE_KEY,
    payload: {
      password
    }
  }).send();
  return warpMessage(data);
}

export async function exportWalletQrcode(password: string) {
  const data = await new Message({
    type: MTypePopup.EXPORT_QR_CODE_WALLET,
    payload: {
      password
    }
  }).send();
  return warpMessage(data);
}

export async function changeAccountName(index: number, name: string) {
  const data = await new Message({
    type: MTypePopup.SET_ACCOUNT_NAME,
    payload: {
      index,
      name
    }
  }).send();
  const state = warpMessage(data) as WalletState;
  updateState(state);
  return state;
}

export async function removeAccount() {
  const data = await Message.signal(
    MTypePopup.RM_ACCOUNT
  ).send();
  const state = warpMessage(data) as WalletState;
  updateState(state);
  return state;
}
