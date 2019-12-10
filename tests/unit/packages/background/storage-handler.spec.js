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

import { TypeChecker } from 'lib/type'
import { BrowserStorage, BuildObject } from 'lib/storage'
import { browserStorageHandler } from 'packages/background/storage-handler'

const browserStorage = new BrowserStorage()

describe('packages:background:browserStorageHandler', () => {
  it('Should be import browserStorageHandler function', () => {
    expect(browserStorageHandler).toBeTruthy()
  })

  it('Should be function', () => {
    expect(new TypeChecker(browserStorageHandler).isFunction).toBeTruthy()
  })

  it('Should can subscribe', () => {
    BrowserStorage.subscribe(data => {
      browserStorageHandler(data)

      expect(data.newValue).toEqual({
        test: { test: 1 }
      })
      expect(data.oldValue).toBeFalsy()
    })
  })

  it('test set some data', () => {
    browserStorage.set(
      new BuildObject('test', { test: 1 })
    )

    jest.advanceTimersByTime(2000)
  })

})
