/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import { BN } from '@zilliqa-js/util'

import { toZIL, fromZil } from '@/filters'

export default {
  methods: {
    /**
     * Calculate the insufficient funds.
     * @param {String, Number} amount The send amount.
     * @param {String} fee Tx gas fee.
     * @param {String} balance Account balance.
     */
    calcIsInsufficientFunds(amount, fee, balance) {
      try {
        const _amount = new BN(toZIL(amount))
        const _balance = new BN(balance)
        const _fee = new BN(toZIL(fee))
        const _txAmount = _fee.add(_amount)
        const _isInsufficientFunds = _balance.lt(_txAmount)

        if (_isInsufficientFunds) {
          return true
        }
      } catch (err) {
        return true
      }

      return false
    },
    /**
     * Calculate the max amount for current account.
     * @param {String} fee Tx gas fee.
     * @param {String} balance Account balance.
     */
    calcMaxAmount(fee, balance) {
      if (Number(balance) === 0) {
        return Number(balance)
      }

      const _balance = new BN(balance)
      const _fee = new BN(toZIL(fee))
      const _amount = _balance.sub(_fee)

      return fromZil(_amount, false)
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
