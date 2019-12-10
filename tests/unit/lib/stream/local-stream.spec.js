/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
jest.useFakeTimers()

import 'tests/extension-sinnon'

import {
  LocalStream,
  MTypePopup,
  Message
} from 'lib/stream'

describe('lib:stream:LocalStream', () => {

  it('test import class LocalStream', () => {
    expect(LocalStream).toBeTruthy()
  })

  it('test import class LocalStream', () => {
    LocalStream.watch((request, response) => {
      response(true)

      expect(request).toEqual({
        type: MTypePopup.POPUP_INIT,
        payload: {}
      })
    })
  })

  it('should be able send request', () => {
    new Message({
      type: MTypePopup.POPUP_INIT,
      payload: {}
    }).send().then((res) => expect(res).toBeTruthy())

    jest.advanceTimersByTime(2000)
  })

})
