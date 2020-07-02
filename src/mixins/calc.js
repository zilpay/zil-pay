/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import Big from 'big.js'
import { DEFAULT_TOKEN } from 'config'
import { fromZil } from '@/filters'


const _li = Big(10 ** 6)

function gasFee(gasPrice, gasLimit) {
  const _gasPrice = Big(gasPrice).round()
  const _gasLimit = Big(gasLimit).round()
  const _fee = _gasLimit.mul(_gasPrice)
  const fee = _fee.div(_li)

  return {
    _fee,
    fee
  }
}

export default {
  methods: {
    /**
     * Calculate the insufficient funds.
     * @param {String, Number} amount The send amount.
     * @param {String} fee Tx gas fee.
     * @param {String} balance Account balance.
     */
    calcIsInsufficientFunds(amount, gasLimit, gasPrice, balance, symbol, decimals) {
      try {
        let _fee = Big(0)

        if (symbol === DEFAULT_TOKEN.symbol) {
          _fee = gasFee(gasPrice, gasLimit)._fee
        }

        const _fact = Big(10 ** decimals)
        const _Famount = Big(amount)
        const _balance = Big(balance).round()
        const _amount = _Famount.mul(_fact).round()
        const _txAmount = _fee.add(_amount)

        return _balance.lt(_txAmount)
      } catch (err) {
        return true
      }
    },
    /**
     * Calculate the max amount for current account.
     * @param {String} fee Tx gas fee.
     * @param {String} balance Account balance.
     */
    calcMaxAmount(gasLimit, gasPrice, balance, decimals, symbol) {
      if (Number(balance) === 0) {
        return String(balance)
      }

      try {
        let _fee = Big(0)

        if (symbol === DEFAULT_TOKEN.symbol) {
          _fee = gasFee(gasPrice, gasLimit)._fee
        }

        const _balance = Big(balance).round()
        const _amount = _balance.sub(_fee)

        return fromZil(_amount, decimals, false)
      } catch (err) {
        return '0'
      }
    },
    /**
     * Calculate gas fee amount.
     * @param {Number} gasLimit Int.
     * @param {Number} gasPrice Li.
     */
    calcFee(gasLimit, gasPrice) {
      return String(gasFee(gasPrice, gasLimit).fee)
    }
  }
}
