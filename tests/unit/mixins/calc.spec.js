/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
// import Big from 'big.js'
import CalcMixin from 'src/mixins/calc'
import { DEFAULT_GAS_FEE } from 'config'

const { methods } = CalcMixin

describe('mixin:calc', () => {
  it('shoul import CalcMixin', () => {
    expect(CalcMixin).toBeTruthy()
  })

  it('try calc gasFee', () => {
    expect(methods.calcFee(1, 1000)).toBe('0.001')
    expect(methods.calcFee(9432, 23478)).toBe('221.444496')
    expect(methods.calcFee(8765, 1233)).toBe('10.807245')
  })

  it('calc:calcMaxAmount', () => {
    const { calcMaxAmount } = methods
    const { gasPrice, gasLimit } = DEFAULT_GAS_FEE
    const balance = '99999999999999999999999999999'
    const decimals = '6'
    const symbol = 'test'

    console.log(calcMaxAmount(
      gasLimit, gasPrice, balance, decimals, symbol
    ))
  })
})
