/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import 'tests/extension-sinnon'

import { v4 as uuid } from 'uuid'
import { SecureMessage } from 'lib/stream/message'

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
