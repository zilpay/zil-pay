/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import sinonChrome from 'sinon-chrome'
import extension from 'extensionizer'
import { uuid } from 'uuidv4'

jest.useFakeTimers()

sinonChrome.runtime.id = uuid()

global.chrome = sinonChrome

extension.runtime = global.chrome.runtime

const { LocalStream } = require('lib/stream')

// setInterval(() => console.log('work'), 1000)

describe('lib:stream:LocalStream', () => {

  it('test import class LocalStream', () => {
    expect(LocalStream).toBeTruthy()
  })

  it('test import class LocalStream', () => {
    LocalStream.watch(console.log)
  })

  it('should be able send request', () => {
    LocalStream.send({
      type: 'test',
      payload: 'work'
    }).then((res) => console.log('work', res))
  })

})
jest.advanceTimersByTime(10000)