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

import { uuid } from 'uuidv4'

import { LocalStream } from 'lib/stream'
import { Message } from 'lib/stream/message'

describe('lib:stream:message:Message', () => {

  it('test import class Message', () => {
    expect(Message).toBeTruthy()
  })

  it('test recieve messages', () => {
    LocalStream.watch((request, response) => {
      response(request.data)

      expect(request.data instanceof Message).toBeTruthy()
    })
  })

  it('test init class Message', () => {
    const msg = {
      type: uuid(),
      payload: {
        random: uuid()
      }
    }
    const message = new Message(msg)

    expect(message).toBeTruthy()
    expect(message.send).toBeTruthy()
    expect(message.type).toEqual(msg.type)
    expect(message.payload).toEqual(msg.payload)

    message.send().then(res => expect(res).toEqual(msg))
  })

  it('should have static method signal', () => {
    expect(Message.signal).toBeTruthy()
  })

  it('try send signal', () => {
    const testTypeMsg = '@/test-app/test-msg'

    Message
      .signal(testTypeMsg)
      .send()
      .then(res => {
        expect(res instanceof Message).toBeTruthy()
        return res
      })
      .then(res => expect(res).toEqual({
        type: testTypeMsg,
        payload: {},
        domain: undefined,
      }))
      .then(() => jest.advanceTimersByTime(5000))
      .catch(() => jest.advanceTimersByTime(5000))
  })
})
