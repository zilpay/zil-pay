/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { get } from 'svelte/store';
import guardStore from 'popup/store/guard';
import loadedStore from 'app/store/loaded';
import { getState } from 'popup/backend';

export const routerGuard = async () => {
  const loaded = get(loadedStore);
  if (!loaded) {
    await getState();
  }
  const guard = get(guardStore);

  return guard.isEnable && guard.isReady;
}
