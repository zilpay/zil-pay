/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { createLocalVue } from '@vue/test-utils'
import toAddress from 'src/filters/to-address'
import { ADDRESS_FORMAT_VARIANTS } from 'src/config'

const localVue = createLocalVue()
const TEST_ADDRES = '0xE8A997e359AC2A1e891dBDf7fc7558623bB0eaD2'

localVue.filter('to-address', toAddress)

describe('filters:to-address', () => {
  it('Should can imported', () => {
    expect(toAddress).toBeTruthy()
  })

  it('toAddress should be function', () => {
    expect(typeof toAddress).toBe('function')
  })

  it('toAddress should able convert address', () => {
    expect(
      toAddress(TEST_ADDRES, ADDRESS_FORMAT_VARIANTS.bech32)
    ).toBe('zil1az...taxf4q')
    expect(
      toAddress(TEST_ADDRES, ADDRESS_FORMAT_VARIANTS.bech32, false)
    ).toBe('zil1az5e0c6e4s4pazgahhmlca2cvgamp6kjtaxf4q')
  })
})
