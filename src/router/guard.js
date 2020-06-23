/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import LockScreen from '@/pages/LockScreen'
import FirstPage from '@/pages/FirstStart'
import HomePage from '@/pages/Home'

import walletStore from '@/store/wallet'

import { Background } from '@/services'

const bgScript = new Background()

/**
 * Common guard for routers.
 * More info [Navigation Guards](https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards).
 * @param {*} to the target Route Object being navigated to.
 * @param {*} from the current route being navigated away from.
 * @param {Function} next this function must be called to resolve the hook.
 * The action depends on the arguments provided to.
 */
export default async function guard(to, from, next) {
  let { isReady, isEnable } = walletStore.STORE.state

  if (isReady === null || isEnable === null) {
    let data = null

    try {
      data = await bgScript.getAuthData()
    } catch (rejectedData) {
      data = rejectedData
    }

    isReady = data.isReady
    isEnable = data.isEnable
  }

  if (to.matched.some(record => record.meta.requiresAuth) || !to.name) {
    // this route requires auth, check if logged in
    // if not, redirect to login page.
    if (to.name && isReady && isEnable) {
      return next()
    }
    if (isReady && isEnable) {
      return next({
        name: HomePage.name
      })
    } else if (!isReady) {
      return next({
        name: FirstPage.name
      })
    } else if (!isEnable) {
      return next({
        name: LockScreen.name
      })
    }
  }

  return next() // make sure to always call next()!
}
