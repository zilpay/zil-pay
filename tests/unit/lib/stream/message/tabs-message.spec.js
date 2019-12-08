/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import 'tests/extension-sinnon'

import { uuid } from 'uuidv4'

import { TabsMessage } from 'lib/stream/message'

describe('lib:stream:message:TabsMessage', () => {

  it('test import class TabsMessage', () => {
    expect(TabsMessage).toBeTruthy()
  })

  it('test init class TabsMessage', () => {
    const msg = {
      type: uuid(),
      payload: {
        random: uuid()
      }
    }
    const message = new TabsMessage(msg)

    expect(message).toBeTruthy()
    expect(message.send).toBeTruthy()
    expect(message.type).toEqual(msg.type)
    expect(message.payload).toEqual(msg.payload)
  })

  it('should have static method tabs', () => {
    expect(TabsMessage.tabs).toBeTruthy()
  })

})
