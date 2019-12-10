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
  Message,
  MTypePopup
} from '../../../../lib/stream'

import { Background } from 'packages/background/background'

let background = null

describe('packages:background:Background', () => {
  it('Should can import', () => {
    expect(Background).toBeTruthy()
  })

  it('Should can init', () => {
    background = new Background()

    expect(background).toBeTruthy()
  })

  it('Try init popup', async() => {
    await Message
      .signal(MTypePopup.POPUP_INIT)
      .send()
    jest.advanceTimersByTime(5000)
  })
})
