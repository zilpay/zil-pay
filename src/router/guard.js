/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import Create from '@/pages/Create.vue'

/**
 * Common guard for routers.
 * More info [Navigation Guards](https://router.vuejs.org/guide/advanced/navigation-guards.html#global-before-guards).
 * @param {*} to the target Route Object being navigated to.
 * @param {*} from the current route being navigated away from.
 * @param {*} next this function must be called to resolve the hook. The action depends on the arguments provided to.
 */
export default function guard(to, from, next) {
  next(Create.name)
}
