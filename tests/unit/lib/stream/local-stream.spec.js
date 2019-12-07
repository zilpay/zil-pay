/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
jest.useFakeTimers()

require('../../../extension-sinnon')

const { LocalStream } = require('lib/stream')

describe('lib:stream:LocalStream', () => {

  it('test import class LocalStream', () => {
    expect(LocalStream).toBeTruthy()
  })

  it('test import class LocalStream', () => {
    LocalStream.watch((request, response) => {
      response(true)

      expect(request).toEqual({
        data: {
          type: 'test',
          payload: 'work'
        }
      })
    })
  })

  it('should be able send request', () => {
    LocalStream.send({
      type: 'test',
      payload: 'work'
    }).then((res) => expect(res).toBeTruthy())

    jest.advanceTimersByTime(2000)
  })

})
