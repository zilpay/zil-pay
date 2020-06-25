/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import Vue from 'vue'
import VueRouter from 'vue-router'
import guard from './guard'

import Accounts from '@/pages/Accounts'
import Contacts from '@/pages/Contacts'
import Tokens from '@/pages/Tokens'
import Connect from '@/pages/Connect'
import Create from '@/pages/Create'
import Verify from '@/pages/Verify'
import Congratulation from '@/pages/Congratulation'
import FirstStart from '@/pages/FirstStart'
import Home from '@/pages/Home'
import LockScreen from '@/pages/LockScreen'
import Popup from '@/pages/Popup'
import SignMessage from '@/pages/SignMessage'

// Settings children pages.
import About from '@/pages/settings/About'
import Advanced from '@/pages/settings/Advanced'
import General from '@/pages/settings/General'
import Networks from '@/pages/settings/Networks'
import Restore from '@/pages/Restore'
import Security from '@/pages/settings/Security'
import Connections from '@/pages/settings/Connections'

// Popup children pages.
import TxData from '@/pages/popup/TxData'

// Accounts children pages.
import Import from '@/pages/accounts/Import'
import Export from '@/pages/accounts/Export'

Vue.use(VueRouter)

// route level code-splitting
// this generates a separate chunk (about.[hash].js) for this route
// which is lazy-loaded when the route is visited.
// @example component: () => import('Page/Home')

const routes = [
  /**
   * No guards routers.
   */
  {
    path: `/${FirstStart.name.toLowerCase()}`,
    name: FirstStart.name,
    component: FirstStart,
    meta: { requiresAuth: false }
  },
  {
    path: `/${Create.name.toLowerCase()}`,
    name: Create.name,
    component: Create,
    meta: { requiresAuth: false }
  },
  {
    path: `/${Congratulation.name.toLowerCase()}`,
    name: Congratulation.name,
    component: Congratulation,
    meta: { requiresAuth: false }
  },
  {
    path: `/${Verify.name.toLowerCase()}`,
    name: Verify.name,
    component: Verify,
    meta: { requiresAuth: false }
  },
  {
    path: `/${LockScreen.name.toLowerCase()}`,
    name: LockScreen.name,
    component: LockScreen,
    meta: { requiresAuth: false }
  },
  {
    path: `/${Restore.name.toLowerCase()}`,
    name: Restore.name,
    component: Restore
  },
  /**
   * Guards routers.
   */
  {
    path: `/${Accounts.name.toLowerCase()}`,
    name: Accounts.name,
    component: Accounts,
    meta: { requiresAuth: true }
  },
  {
    path: `/${Contacts.name.toLowerCase()}`,
    name: Contacts.name,
    component: Contacts,
    meta: { requiresAuth: true }
  },
  {
    path: `/${Tokens.name.toLowerCase()}`,
    name: Tokens.name,
    component: Tokens,
    meta: { requiresAuth: true }
  },
  {
    path: `/${Import.name.toLowerCase()}`,
    name: Import.name,
    component: Import,
    meta: { requiresAuth: true }
  },
  {
    path: `/${Export.name.toLowerCase()}`,
    name: Export.name,
    component: Export,
    meta: { requiresAuth: true }
  },
  {
    path: `/${Connect.name.toLowerCase()}`,
    name: Connect.name,
    component: Connect,
    meta: { requiresAuth: true }
  },
  {
    path: `/${SignMessage.name.toLowerCase()}`,
    name: SignMessage.name,
    component: SignMessage,
    meta: { requiresAuth: true }
  },
  {
    path: `/${Connections.name.toLowerCase()}`,
    name: Connections.name,
    component: Connections,
    meta: { requiresAuth: true }
  },
  {
    path: `/${Home.name.toLowerCase()}`,
    name: Home.name,
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: `/${Popup.name.toLowerCase()}`,
    name: Popup.name,
    component: Popup,
    meta: { requiresAuth: true }
  },
  {
    path: `/${TxData.name.toLowerCase()}`,
    name: TxData.name,
    component: TxData,
    meta: { requiresAuth: true }
  },
  {
    path: `/${About.name.toLowerCase()}`,
    name: About.name,
    component: About,
    meta: { requiresAuth: true }
  },
  {
    path: `/${Advanced.name.toLowerCase()}`,
    name: Advanced.name,
    component: Advanced,
    meta: { requiresAuth: true }
  },
  {
    path: `/${General.name.toLowerCase()}`,
    name: General.name,
    component: General,
    meta: { requiresAuth: true }
  },
  {
    path: `/${Networks.name.toLowerCase()}`,
    name: Networks.name,
    component: Networks,
    meta: { requiresAuth: true }
  },
  {
    path: `/${Security.name.toLowerCase()}`,
    name: Security.name,
    component: Security,
    meta: { requiresAuth: true }
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((...args) => guard(...args))

export default router
