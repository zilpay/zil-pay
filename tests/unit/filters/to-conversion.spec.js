/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { createLocalVue } from '@vue/test-utils'
import toConversion from 'src/filters/to-conversion'

const localVue = createLocalVue()

localVue.filter('to-conversion', toConversion)

describe('filters:to-conversion', () => {
  it('Should can imported', () => {
    expect(toConversion).toBeTruthy()
  })

  it('toConversion should be function', () => {
    expect(typeof toConversion).toBe('function')
  })

  it('toConversion should able conver currency', () => {
    expect(String(toConversion('10000000000', 0.1, 12))).toBe('0.001')
  })
})
