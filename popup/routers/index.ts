/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { wrap } from 'svelte-spa-router/wrap';
import { routerGuard } from './guard';

import LockPage from '../pages/Lock.svelte';
import LetStarted from '../pages/LetStarted.svelte';
import Home from '../pages/Home.svelte';
import History from '../pages/History.svelte';
import Confirm from '../pages/Confirm.svelte';
import SignMessage from '../pages/SignMessage.svelte';
import Create from '../pages/Create.svelte';
import Restore from '../pages/Restore.svelte';
import SetupAccount from '../pages/SetupAccount.svelte';
import WalletCreated from '../pages/WalletCreated.svelte';
import PhraseVerify from '../pages/PhraseVerify.svelte';
import Accounts from '../pages/Accounts.svelte';
import AddAccount from '../pages/AddAccount.svelte';
import RestorePrivKey from '../pages/RestorePrivKey.svelte';
import Send from '../pages/Send.svelte';
import AppConnect from '../pages/Connect.svelte';
import TokenList from '../pages/TokenList.svelte';
import LedgerConnect from '../pages/ledger/LedgerConnect.svelte';
import DeviceFinder from '../pages/ledger/DeviceFinder.svelte';

import Swap from '../pages/Swap.svelte';
import Collect from '../pages/Collect.svelte';

import Netwrok from '../pages/settings/Netwrok.svelte';
import Settings from '../pages/Settings.svelte';
import About from '../pages/settings/About.svelte';
import Account from '../pages/settings/Account.svelte';
import Advanced from '../pages/settings/Advanced.svelte';
import Connections from '../pages/settings/Connections.svelte';
import Contacts from '../pages/settings/Contacts.svelte';
import Security from '../pages/settings/Security.svelte';
import General from '../pages/settings/General.svelte';

export default {
  '/': wrap({
    component: Home,
    conditions: [
      routerGuard
    ]
  }),
  '/history': wrap({
    component: History,
    conditions: [
      routerGuard
    ]
  }),
  '/swap': wrap({
    component: Swap,
    conditions: [
      routerGuard
    ]
  }),
  '/collect': wrap({
    component: Collect,
    conditions: [
      routerGuard
    ]
  }),
  '/confirm/:index?': wrap({
    component: Confirm,
    conditions: [
      routerGuard
    ]
  }),
  '/sign-message': wrap({
    component: SignMessage,
    conditions: [
      routerGuard
    ]
  }),
  '/app-connect': wrap({
    component: AppConnect,
    conditions: [
      routerGuard
    ]
  }),
  '/tokens-list': wrap({
    component: TokenList,
    conditions: [
      routerGuard
    ]
  }),
  '/accounts': wrap({
    component: Accounts,
    conditions: [
      routerGuard
    ]
  }),
  '/send/:type/:index/:bech32?': wrap({
    component: Send,
    conditions: [
      routerGuard
    ]
  }),
  '/add-account': wrap({
    component: AddAccount,
    conditions: [
      routerGuard
    ]
  }),
  '/ledger-connect/:id': wrap({
    component: LedgerConnect,
    conditions: [
      routerGuard
    ]
  }),
  '/ledger-device-finder': wrap({
    component: DeviceFinder,
    conditions: [
      routerGuard
    ]
  }),
  '/import-privkey': wrap({
    component: RestorePrivKey,
    conditions: [
      routerGuard
    ]
  }),
  '/settings': wrap({
    component: Settings,
    conditions: [
      routerGuard
    ]
  }),
  '/created': wrap({
    component: WalletCreated,
    conditions: [
      routerGuard
    ]
  }),
  '/netwrok': wrap({
    component: Netwrok,
    conditions: [
      routerGuard
    ]
  }),
  '/account': wrap({
    component: Account,
    conditions: [
      routerGuard
    ]
  }),
  '/general': wrap({
    component: General,
    conditions: [
      routerGuard
    ]
  }),
  '/contacts': wrap({
    component: Contacts,
    conditions: [
      routerGuard
    ]
  }),
  '/advanced': wrap({
    component: Advanced,
    conditions: [
      routerGuard
    ]
  }),
  '/connections': wrap({
    component: Connections,
    conditions: [
      routerGuard
    ]
  }),
  '/security': wrap({
    component: Security,
    conditions: [
      routerGuard
    ]
  }),
  '/about': wrap({
    component: About,
    conditions: [
      routerGuard
    ]
  }),
  '/lock': LockPage,
  '/start': LetStarted,
  '/restore': Restore,
  '/create': Create,
  '/verify': PhraseVerify,
  '/setup-account': SetupAccount
};
