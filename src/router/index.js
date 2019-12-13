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

import Accounts from '@/pages/Accounts'
import Connect from '@/pages/Connect'
import CreateAcc from '@/pages/CreateAcc'
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
import Restore from '@/pages/settings/Restore'
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
    path: '/FirstStart',
    name: 'FirstStart',
    component: FirstStart
  },
  {
    path: '/CreateAcc',
    name: 'CreateAcc',
    component: CreateAcc
  },
  {
    path: '/LockScreen',
    name: 'LockScreen',
    component: LockScreen
  },
  /**
   * Guards routers.
   */
  {
    path: '/Accounts',
    name: 'Accounts',
    component: Accounts,
    children: {
      path: '/Import',
      name: 'Import',
      component: Import
    }
  },
  {
    path: '/Connect',
    name: 'Connect',
    component: Connect
  },
  {
    path: '/Dapps',
    name: 'Dapps',
    component: Dapps
  },
  {
    path: '/Home',
    name: 'Home',
    component: Home
  },
  {
    path: '/Popup',
    name: 'Popup',
    component: Popup,
    children: {
      path: '/TxData',
      name: 'TxData',
      component: TxData
    }
  },
  {
    path: '/Receive',
    name: 'Receive',
    component: Receive
  },
  {
    path: '/Send',
    name: 'Send',
    component: Send
  },
  {
    path: '/Settings',
    name: 'Settings',
    component: Settings,
    children: [
      {
        path: '/About',
        name: 'About',
        component: About
      },
      {
        path: '/Advanced',
        name: 'Advanced',
        component: Advanced
      },
      {
        path: '/General',
        name: 'General',
        component: General
      },
      {
        path: '/Networks',
        name: 'Networks',
        component: Networks
      },
      {
        path: '/Restore',
        name: 'Restore',
        component: Restore
      },
      {
        path: '/Security',
        name: 'Security',
        component: Security
      }
    ]
  },
  {
    path: '/TxInfo',
    name: 'TxInfo',
    component: TxInfo
  },
  {
    path: '*',
    redirect: '/FirstStart'
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
