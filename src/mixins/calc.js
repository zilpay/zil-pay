/*
 * Project: ZilPay-wallet
 * Author: Rinat(lich666dead)
 * -----
 * Modified By: the developer formerly known as Rinat(lich666dead) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2019 ZilPay
 */
import Big from 'big.js'
import BN from 'bn.js'
import { isBech32 } from '@zilliqa-js/util/dist/validation'
import { fromBech32Address, toBech32Address } from '@zilliqa-js/crypto/dist/bech32'

import { DEFAULT_TOKEN } from 'config'
import { fromZil } from '@/filters'

Big.PE = 99

const DEFAULT_ICON = '/icons/icon128.png'
const _li = Big(10 ** 6)

export function gasFee(gasPrice, gasLimit) {
  const _gasPrice = Big(gasPrice).round()
  const _gasLimit = Big(gasLimit).round()
  const _fee = _gasLimit.mul(_gasPrice)
  const fee = _fee.div(_li)

  return {
    _fee: _fee.mul(_li),
    fee
  }
}

export default {
  methods: {
    toLi(value) {
      const _value = Big(value).round()
      return _value.div(_li)
    },
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
    calcIsInsufficientFundsUint(amount, gasLimit, gasPrice, balance, symbol) {
      try {
        let _fee = Big(0)

        if (symbol === DEFAULT_TOKEN.symbol) {
          _fee = gasFee(gasPrice, gasLimit)._fee
        }

        const _balance = Big(balance).round()
        const _amount = Big(amount)
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
    },
    /**
     * Build transaction params for send.
     * @param {Object} data - Transaction data.
     * @param {Object} token - Object of token.
     */
    buildPaymentTx(data, _amount) {
      const _gasPrice = Big(data.gasPrice).round()
      const { toAddr, nonce, gasLimit, cancel } = data

      return {
        nonce,
        toAddr,
        cancel,
        amount: String(_amount),
        gasPrice: String(_gasPrice.mul(_li)),
        gasLimit: String(gasLimit),
        code: '',
        data: '',
        icon: DEFAULT_ICON,
        priority: false,
        uuid: false
      }
    },
    /**
     * Build token transfer params.
     * @param {Object} param0 - txObject.
     * @param {Object} token - Object of token.
     */
    buildTokenTxParams({ toAddr }, token, _amount) {
      const data = JSON.stringify({
        _tag: 'Transfer',
        params: [
          {
            vname: 'to',
            type: 'ByStr20',
            value: isBech32(toAddr) ? fromBech32Address(toAddr).toLowerCase() : toAddr.toLowerCase()
          },
          {
            vname: 'amount',
            type: 'Uint128',
            value: String(_amount)
          }
        ]
      })
      const address = token.proxy_address ? token.proxy_address : token.address

      return {
        data,
        toAddr: toBech32Address(address),
        symbol: token.symbol,
        amount: String(0),
        gasPrice: String(1000000000),
        gasLimit: String(9000),
        code: '',
        decimals: token.decimals,
        icon: DEFAULT_ICON,
        priority: false,
        uuid: false
      }
    },
    buildTxParams(data, token) {
      const _ten = new BN(10)
      const _decimals = new BN(token.decimals)
      const _qa = _ten.pow(_decimals)
      const _Famount = new BN(data.amount)
      const _amount = _Famount.mul(_qa)

      if (DEFAULT_TOKEN.symbol === token.symbol) {
        return this.buildPaymentTx(data, _amount)
      }

      return this.buildTokenTxParams(data, token, _amount)
    }
  }
}
