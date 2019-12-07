/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { uuid } from 'uuidv4'

require('tests/extension-sinnon')

const { Message } = require('lib/stream/message')

describe('lib:stream:message:Message', () => {

  it('test import class Message', () => {
    expect(Message).toBeTruthy()
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
  })

  it('should have static method signal', () => {
    expect(Message.signal).toBeTruthy()
  })

})
