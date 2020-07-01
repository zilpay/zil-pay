/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { BN, units } from '@zilliqa-js/util'

import { fromZil } from '@/filters'

export default {
  methods: {
    /**
     * Calculate the insufficient funds.
     * @param {String, Number} amount The send amount.
     * @param {String} fee Tx gas fee.
     * @param {String} balance Account balance.
     */
    calcIsInsufficientFunds(amount, gasLimit, gasPrice, balance) {
      try {
        const _gasLimit = new BN(gasLimit)
        const _gasPrice = new BN(gasPrice)
        const _fee = units.toQa(_gasLimit.mul(_gasPrice), units.Units.Li)
        const _amount = new BN(amount)
        const _balance = new BN(balance)
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
    calcMaxAmount(gasLimit, gasPrice, balance, decimals) {
      if (Number(balance) === 0) {
        return Number(balance)
      }

      const _gasLimit = new BN(gasLimit)
      const _gasPrice = new BN(gasPrice)
      const _fee = units.toQa(_gasLimit.mul(_gasPrice), units.Units.Li)
      const _balance = new BN(balance)
      const _amount = _balance.sub(_fee)

      return fromZil(_amount, decimals, false)
    },
    /**
     * Calculate gas fee amount.
     * @param {Number} gasLimit Int.
     * @param {Number} gasPrice Li.
     */
    calcFee(gasLimit, gasPrice) {
      const factor = Math.pow(10, -6) // 10 ^ -6
      const amount = gasLimit * gasPrice * factor

      return amount.toFixed(3)
    }
  }
}
