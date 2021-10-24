/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { wrap } from 'svelte-spa-router/wrap';
import guardStore, { GuardType } from 'popup/store/guard';

import LockPage from '../pages/Lock.svelte';
import LetStarted from '../pages/LetStarted.svelte';
import Home from '../pages/Home.svelte';
import Loading from '../pages/Loading.svelte';

export default {
  '/': Loading,
  '/home': wrap({
    component: Home,
    conditions: [
      async () => {
        guardStore.subscribe(console.log)();

        return true;
      }
    ]
  }),
  '/lock': wrap({
    component: LockPage,
    conditions: [
      async () => {
        guardStore.subscribe(console.log)();

        return true;
      }
    ]
  }),
  '/start': wrap({
    component: LetStarted,
    conditions: [
      async () => {
        guardStore.subscribe(console.log)();

        return true;
      }
    ]
  }),

  // Catch-all
  // This is optional, but if present it must be the last
  '*': Home
};
