/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
require('tests/extension-sinnon')

import { uuid } from 'uuidv4'

const { SecureMessage } = require('lib/stream/message')

describe('lib:stream:message:SecureMessage', () => {

  it('test import class SecureMessage', () => {
    expect(SecureMessage).toBeTruthy()
  })

  it('test init class SecureMessage', () => {
    const msg = {
      type: uuid(),
      payload: {
        random: uuid()
      }
    }
    const message = new SecureMessage(msg)

    expect(message).toBeTruthy()
    expect(message.send).toBeTruthy()
    expect(message.type).toEqual(msg.type)
    expect(message.payload).toEqual(msg.payload)
  })

})
