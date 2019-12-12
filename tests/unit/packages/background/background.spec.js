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

// import { FIELDS, ZILLIQA } from 'config'
// import { BrowserStorage } from 'lib/storage'
// import {
//   Message,
//   MTypePopup
// } from 'lib/stream'

import { Background } from 'packages/background/background'

// const browserStorage = new BrowserStorage()
let background = null

describe('packages:background:Background', () => {

  it('Should can import', () => {
    expect(Background).toBeTruthy()
  })

  it('Should can init', () => {
    background = new Background()

    expect(background).toBeTruthy()
  })

  // it('Should recieve reject wallet data', () => {
  //   return Message
  //     .signal(MTypePopup.POPUP_INIT)
  //     .send()
  //     .then(res => res.reject)
  //     .then(reject => {
  //       expect(reject.isEnable).toBeFalsy()
  //       expect(reject.isReady).toBeFalsy()
  //       expect(reject.networkStatus).toBeTruthy()
  //       expect(reject.config).toEqual(ZILLIQA)
  //     })
  // })

  // it('Should store in browser storage', async() => {
  //   const configFromStore = await browserStorage.get(FIELDS.CONFIG)

  //   expect(configFromStore).toBeTruthy()
  // })

  // afterEach(() => {
  //   jest.advanceTimersByTime(1000)
  // })
})
