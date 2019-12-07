/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import fetch from 'cross-fetch'
import {
  HTTPProvider,
  composeMiddleware
} from '@zilliqa-js/core'

const DEFAULT_HEADERS = { 'Content-Type': 'application/json' }

/**
 * Override send method, have something problem with  FireFox.
 * Disabled referal method.
 */
HTTPProvider.prototype.send = async function(method, ...params) {
  const [tReq, tRes] = this.getMiddleware(method)
  const reqMiddleware = composeMiddleware(...tReq)
  const resMiddleware = composeMiddleware(...tRes)

  const req = reqMiddleware(this.buildPayload(method, ...params))
  const response = await fetch(req.url, {
    method: 'POST',
    cache: 'no-cache',
    mode: 'cors',
    redirect: 'follow',
    body: JSON.stringify(req.payload),
    headers: {
      ...DEFAULT_HEADERS,
      ...((req.options && req.options.headers) || {}),
    }
  })
  const body = await response.json()
  const result = {
    ...body,
    req
  }

  return resMiddleware(result)
}

export default HTTPProvider
