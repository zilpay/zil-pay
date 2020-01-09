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
import Connect from '@/pages/Connect'
import Create from '@/pages/Create'
import Dapps from '@/pages/Dapps'
import FirstStart from '@/pages/FirstStart'
import Home from '@/pages/Home'
import LockScreen from '@/pages/LockScreen'
import Popup from '@/pages/Popup'
import Receive from '@/pages/Receive'
import Send from '@/pages/Send'
import Settings from '@/pages/Settings'
import TxInfo from '@/pages/TxInfo'

// Settings children pages.
import About from '@/pages/settings/About'
import Advanced from '@/pages/settings/Advanced'
import General from '@/pages/settings/General'
import Networks from '@/pages/settings/Networks'
import Restore from '@/pages/Restore'
import Security from '@/pages/settings/Security'

// Popup children pages.
import TxData from '@/pages/popup/TxData'

// Accounts children pages.
import Import from '@/pages/accounts/Import'

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
    meta: { requiresAuth: true },
    children: [
      {
        path: `/${Import.name.toLowerCase()}`,
        name: Import.name,
        component: Import
      }
    ]
  },
  {
    path: `/${Connect.name.toLowerCase()}`,
    name: Connect.name,
    component: Connect,
    meta: { requiresAuth: true }
  },
  {
    path: `/${Dapps.name.toLowerCase()}`,
    name: Dapps.name,
    component: Dapps,
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
    meta: { requiresAuth: true },
    children: [
      {
        path: `/${TxData.name.toLowerCase()}`,
        name: TxData.name,
        component: TxData
      }
    ]
  },
  {
    path: `/${Receive.name.toLowerCase()}`,
    name: Receive.name,
    component: Receive,
    meta: { requiresAuth: true }
  },
  {
    path: `/${Send.name.toLowerCase()}`,
    name: Send.name,
    component: Send,
    meta: { requiresAuth: true }
  },
  {
    path: `/${Settings.name.toLowerCase()}`,
    name: Settings.name,
    component: Settings,
    meta: { requiresAuth: true },
    children: [
      {
        path: `/${About.name.toLowerCase()}`,
        name: About.name,
        component: About
      },
      {
        path: `/${Advanced.name.toLowerCase()}`,
        name: Advanced.name,
        component: Advanced
      },
      {
        path: `/${General.name.toLowerCase()}`,
        name: General.name,
        component: General
      },
      {
        path: `/${Networks.name.toLowerCase()}`,
        name: Networks.name,
        component: Networks
      },
      {
        path: `/${Security.name.toLowerCase()}`,
        name: Security.name,
        component: Security
      }
    ]
  },
  {
    path: `/${TxInfo.name.toLowerCase()}`,
    name: TxInfo.name,
    component: TxInfo,
    meta: { requiresAuth: true }
  },
  {
    path: '*',
    redirect: `/${Home.name.toLowerCase()}`
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((...args) => guard(...args))

export default router
