/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { createLocalVue } from '@vue/test-utils'
import fromZil from 'src/filters/from-zil'

const localVue = createLocalVue()

localVue.filter('from-zil', fromZil)

describe('filters:from-zil', () => {
  it('Should can imported', () => {
    expect(fromZil).toBeTruthy()
  })

  it('fromZil should be function', () => {
    expect(typeof fromZil).toBe('function')
  })

  it('fromZil can convert', () => {
    const TEST_NUMBER = '9999999999999999999999999999999999999'

    expect(String(fromZil(TEST_NUMBER, 12, false))).toBe('0.015346547231')
    expect(String(fromZil(TEST_NUMBER, 12))).toBe('0.015')
  })
})
