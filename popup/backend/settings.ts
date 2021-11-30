/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { Message } from "lib/streem/message";
import { MTypePopup } from "lib/streem/stream-keys";
import { warpMessage } from "lib/utils/warp-message";
import { updateState } from './store-update';
import { Formats } from 'config/formats';
import { Common } from "config/common";

export async function changeCurrency(currency: string) {
  const data = await new Message({
    type: MTypePopup.CHANGE_CURRENCY,
    payload: {
      currency
    }
  }).send();
  const state = warpMessage(data);
  updateState(state);
  return state;
}

export async function resetCurrency() {
  const data = await Message
    .signal(MTypePopup.RESET_CURRENCY)
    .send();
  const state = warpMessage(data);
  updateState(state);
  return state;
}

export async function changeTheme(theme: string) {
  const data = await new Message({
    type: MTypePopup.SET_THEME,
    payload: {
      theme
    }
  }).send();
  const state = warpMessage(data);
  updateState(state);
  return state;
}

export async function resetTheme() {
  const data = await Message
    .signal(MTypePopup.RESET_THEME)
    .send();
  const state = warpMessage(data);
  updateState(state);
  return state;
}

export async function changeLocale(locale: string) {
  const data = await new Message({
    type: MTypePopup.SET_LOCALE,
    payload: {
      locale
    }
  }).send();
  const state = warpMessage(data);
  updateState(state);
  return state;
}

export async function resetLocale() {
  const data = await Message
    .signal(MTypePopup.RESET_LOCALE)
    .send();
  const state = warpMessage(data);
  updateState(state);
  return state;
}

export async function changeLockTimer(h = Common.TIME_BEFORE_LOCK) {
  const data = await new Message({
    type: MTypePopup.SET_LOCK_TIME,
    payload: {
      h
    }
  }).send();
  const state = warpMessage(data);
  updateState(state);
  return state;
}

export async function changeAddressFormat(format = Formats.Bech32) {
  const data = await new Message({
    type: MTypePopup.SET_ADDRESS_FORMAT,
    payload: {
      format
    }
  }).send();
  const state = warpMessage(data);
  updateState(state);
  return state;
}

export async function changePromtEnabled(enabled = true) {
  const data = await new Message({
    type: MTypePopup.SET_PROMT_ENABLED,
    payload: {
      enabled
    }
  }).send();
  const state = warpMessage(data);
  updateState(state);
  return state;
}

export async function setPhishingDetection(enabled = true) {
  const data = await new Message({
    type: MTypePopup.SET_PHISHING_DETECTION,
    payload: {
      enabled
    }
  }).send();
  const state = warpMessage(data);
  updateState(state);
  return state;
}

export async function fromBech32(bech32: string) {
  const data = await new Message({
    type: MTypePopup.FROM_BECH32,
    payload: {
      bech32
    }
  }).send();
  return warpMessage(data);;
}
