/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import Big from 'big.js'
import CalcMixin, { gasFee } from 'src/mixins/calc'
import { DEFAULT_TOKEN } from 'config'

console.log(CalcMixin, DEFAULT_TOKEN)

const { methods } = CalcMixin

describe('filters:keys', () => {
  it('shoul import CalcMixin', () => {
    expect(CalcMixin).toBeTruthy()
  })

  it('try calc gasFee', () => {
    expect(methods.calcFee(1, 1000)).toBe('0.001')
    expect(methods.calcFee(9432, 23478)).toBe('221.444496')
    expect(methods.calcFee(8765, 1233)).toBe('10.807245')
  })

  it('try calc calcIsInsufficientFunds', () => {
    const gasPrice = 1000
    const gasLimit = 1
    const _balance = Big('850934578493659202')
    const { _fee } = gasFee(gasPrice, gasLimit)
    const amount = String(_balance.sub(_fee))

    expect(methods.calcIsInsufficientFundsUint(
      amount,
      gasLimit,
      gasPrice,
      _balance,
      DEFAULT_TOKEN.symbol,
      DEFAULT_TOKEN.decimals
    )).toBeFalsy()

    expect(methods.calcIsInsufficientFundsUint(
      String(Number(amount) + 1),
      gasLimit,
      gasPrice,
      _balance,
      DEFAULT_TOKEN.symbol,
      DEFAULT_TOKEN.decimals
    )).toBeFalsy()
  })
})
