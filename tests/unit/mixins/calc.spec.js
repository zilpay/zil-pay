/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import Big from 'big.js'
import { v4 } from 'uuid'
import CalcMixin from 'src/mixins/calc'
import { DEFAULT_GAS_FEE, DEFAULT_TOKEN } from 'config'
import { toBech32Address } from '@zilliqa-js/crypto/dist/bech32'

const NIL_ADDRESS = '0x0000000000000000000000000000000000000000'
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
    const balance = '99999999999999999999'
    const decimals = '18'
    const symbol = 'test'
    const result = calcMaxAmount(
      gasLimit, gasPrice, balance, decimals, symbol
    )

    expect(result).toBe('99.999999999999999999')
  })

  it('calc:calcMaxAmount', () => {
    const { calcMaxAmount } = methods
    const { gasPrice, gasLimit } = DEFAULT_GAS_FEE
    const balance = '99999999999999999999'
    const decimals = '18'
    const symbol = 'test'
    const result = calcMaxAmount(
      gasLimit, gasPrice, balance, decimals, symbol
    )

    expect(result).toBe('99.999999999999999999')
  })

  it('calc:buildPaymentTx native token', () => {
    const data = {
      ...DEFAULT_GAS_FEE,
      toAddr: NIL_ADDRESS,
      nonce: 0,
      amount: '53453453453',
      cancel: false
    }

    expect(methods.buildTxParams(data, DEFAULT_TOKEN)).toEqual({
      nonce: data.nonce,
      toAddr: data.toAddr,
      cancel: data.cancel,
      amount: Big(data.amount).mul(10 ** 12).toString(),
      gasPrice: Big(data.gasPrice).mul(10 ** 6).toString(),
      gasLimit: String(data.gasLimit),
      code: '',
      data: '',
      icon: '/icons/icon128.png',
      priority: false,
      uuid: false
    })
  })

  it('calc:buildPaymentTx custom token', () => {
    const token = {
      balance: '99',
      decimals: '18',
      name: v4(),
      symbol: v4(),
      address: NIL_ADDRESS
    }
    const data = {
      ...DEFAULT_GAS_FEE,
      toAddr: NIL_ADDRESS,
      nonce: 0,
      amount: '434543543',
      cancel: false
    }

    expect(methods.buildTxParams(data, token)).toEqual({
      data: JSON.stringify({
        _tag: 'Transfer',
        params: [
          {
            vname: 'to',
            type: 'ByStr20',
            value: data.toAddr.toLowerCase()
          },
          {
            vname: 'amount',
            type: 'Uint128',
            value: String(Big(data.amount).mul(10 ** token.decimals).toString())
          }
        ]
      }),
      toAddr: toBech32Address(data.toAddr),
      symbol: token.symbol,
      amount: '0',
      gasPrice: '1000000000',
      gasLimit: '9000',
      code: '',
      decimals: token.decimals,
      icon: '/icons/icon128.png',
      priority: false,
      uuid: false
    })
  })
})
