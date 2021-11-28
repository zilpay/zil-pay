/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { WalletState } from 'types/account';
import guardStore from 'popup/store/guard';
import walletStore from 'popup/store/wallet';
import netStore from 'popup/store/netwrok';
import themeStore from 'popup/store/theme';
import appStore from 'popup/store/apps';
import contactsStore from 'popup/store/contacts';
import currencyStore from 'popup/store/currency';
import gasStore from 'popup/store/gas';
import rateStore from 'popup/store/rate';
import ssnStore from 'popup/store/ssn';
import transactionsStore from 'popup/store/transactions';
import zrcStore from 'app/store/zrc';
import localeStore from 'popup/store/locale';
import timeLock from 'popup/store/lock-time';
import addressFormatStore from 'popup/store/format';
import promtStore from 'app/store/promt';
import phishingStore from 'app/store/phishing';

export function updateState(state: WalletState) {
  document.body.setAttribute('theme', state.theme);
  console.log(state);
  guardStore.set(state.guard);
  walletStore.set(state.wallet);
  netStore.set(state.netwrok);
  themeStore.set(state.theme);
  localeStore.set(state.locale);
  appStore.set(state.apps);
  contactsStore.set(state.contacts);
  currencyStore.set(state.currency);
  gasStore.set(state.gas);
  rateStore.set(state.rate);
  ssnStore.set(state.ssn);
  transactionsStore.set(state.transactions);
  zrcStore.set(state.zrc2);
  timeLock.set(state.lockTime);
  addressFormatStore.set(state.format);
  promtStore.set(state.popup);
  phishingStore.set(state.phishing);
}
