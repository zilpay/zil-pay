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
import 'packages/inpage'

const { window } = global

require('packages/content')

describe('packages:content:BrowserContent', () => {
  beforeAll(() => {
    require('packages/inpage')
  })

  it('Should be injected script', () => {
    expect(window.zilPay).toBeTruthy()
  })

  it('end', () => {
    // expect(BrowserContent).toBeTruthy()

    jest.advanceTimersByTime(1000)
  })
})
