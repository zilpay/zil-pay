/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { createLocalVue } from '@vue/test-utils'
import keys from 'src/filters/keys'
import { uuid } from 'uuidv4'

const localVue = createLocalVue()

localVue.filter('keys', keys)

describe('filters:keys', () => {
  it('Should can imported', () => {
    expect(keys).toBeTruthy()
  })

  it('keys should be function', () => {
    expect(typeof keys).toBe('function')
  })

  it('keys can call', () => {
    const TEST_ARRAY = [uuid(), uuid()]
    const TEST_OBJECT = {
      [TEST_ARRAY[0]]: uuid(),
      [TEST_ARRAY[1]]: uuid()
    }
    expect(keys(TEST_ARRAY)).toEqual(TEST_ARRAY)
    expect(keys(TEST_OBJECT)).toEqual(TEST_ARRAY)
  })
})
