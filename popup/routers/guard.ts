/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { get } from 'svelte/store';
import { push } from 'svelte-spa-router';

import appStore from 'popup/store/apps';
import guardStore from 'popup/store/guard';
import transactionsStore from 'popup/store/transactions';
import cipherStore from 'popup/store/cipher';

const confirmRouter = '/app-connect';
const confirmTx = '/confirm';

export const routerGuard = (e: { location: string; }) => {
  const guard = get(guardStore);
  const apps = get(appStore);
  const txns = get(transactionsStore);
  const cipher = get(cipherStore);

  if (!guard.isReady) {
    push('/start');
  }

  if (guard.isReady && !guard.isEnable) {
    push('/lock');
  }

  if (apps.confirmApp && e.location !== confirmRouter && guard.isEnable) {
    push(confirmRouter);
    return guard.isEnable && guard.isReady;
  } else if (txns.message && guard.isEnable) {
    push('/sign-message');
    return guard.isEnable && guard.isReady;
  } else if (txns.forConfirm.length !== 0 && guard.isEnable && e.location !== '/netwrok') {
    push(confirmTx);
    return guard.isEnable && guard.isReady;
  } else if (confirmTx === e.location && txns.forConfirm.length === 0) {
    push('/');
    return guard.isEnable && guard.isReady;
  } else if (cipher.decryptParams) {
    push('/decrypt');
    return guard.isEnable && guard.isReady;
  } else if (cipher.encryptParams) {
    push('/encrypt');
    return guard.isEnable && guard.isReady;
  } else if (confirmTx === e.location && txns.forConfirm.length === 0) {
    push('/');
    return guard.isEnable && guard.isReady;
  }

  return guard.isEnable && guard.isReady;
}
