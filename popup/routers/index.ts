/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { wrap } from 'svelte-spa-router/wrap';
import guardStore from 'popup/store/guard';

import LockPage from '../pages/Lock.svelte';
import LetStarted from '../pages/LetStarted.svelte';
import Home from '../pages/Home.svelte';
import Loading from '../pages/Loading.svelte';
import Create from '../pages/Create.svelte';
import Restore from '../pages/Restore.svelte';
import SetupAccount from '../pages/SetupAccount.svelte';

export default {
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
  '/start': LetStarted,
  '/restore': Restore,
  '/create': Create,
  '/setup-account': wrap({
    component: SetupAccount
  }),

  // Catch-all
  // This is optional, but if present it must be the last
  '*': Loading
};
