/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2023 ZilPay
 */
import type { TokenValue } from './dex';
import type { StakeResponse } from 'types/stake';
import type { ParamItem } from 'types/transaction';

import { get } from 'svelte/store';
import Big from 'big.js';

import { Contracts } from 'config/contracts';

import gasStore from 'popup/store/gas';
import currencyStore from 'popup/store/currency';
import rateStore from 'popup/store/rate';
import zrcStore from 'popup/store/zrc';

import { sendToSignTx } from 'app/backend/sign';
import { Runtime } from 'lib/runtime';
import { toDecimals } from 'app/filters/units';


Big.PE = 99;

enum GasLimits {
  DelegateStake = 3000,
  WithdrawStakeAmt = 3000,
  Default = 5000
}

export class AvelyStake {
  static FEE_DEMON = 10;
  static MIN = 10;

  get gas() {
    return get(gasStore);
  }

  get localRate() {
    return get(rateStore)[get(currencyStore)];
  }

  get stZIL() {
    return get(zrcStore).find((t) => t.symbol === 'stZIL');
  }

  get zil() {
    return get(zrcStore)[0];
  }


  getVirtualParams(pair: TokenValue[], { totalStaked, totalSupply }: StakeResponse) {
    const data = {
      rate: Big(0),
      converted: 0,
      gasLimit: GasLimits.Default
    };

    if (!pair || pair.length < 1) {
      return data;
    }

    const [exactToken] = pair;
    const expectAmount = Big(exactToken.value);
    const localRate = Number(this.localRate) || 0;

    if (exactToken.meta.base16 === Contracts.ZERO_ADDRESS) {
      data.rate = Big(totalSupply).div(totalStaked).mul(expectAmount).round(9);
      data.converted = Number(expectAmount) * localRate;
    } else {
      data.rate = Big(totalStaked).div(totalSupply).mul(expectAmount).round(9);
      data.converted = Number(data.rate) * localRate;
    }

    return data;
  }

  async call(pair: TokenValue[]) {
    if (!pair || pair.length < 1) {
      return;
    }

    const [exactToken] = pair;
    const expectAmount = exactToken.value;

    if (exactToken.meta.base16 === Contracts.ZERO_ADDRESS) {
      await this.delegateStake(String(expectAmount));
    } else {
      await this.withdrawStakeOrder(String(expectAmount));
    }
  }

  async completeWithdrawal() {
    const contract = this.stZIL.base16;
    const tag = 'CompleteWithdrawal';
    const params = [];

    return this.#sendParams(params, tag, GasLimits.DelegateStake, String(0), contract, tag);
  }

  async delegateStake(zil: string) {
    const amount = toDecimals(zil, this.zil.decimals).toString();
    const contract = this.stZIL.base16;
    const tag = 'DelegateStake';
    const params = [];

    return this.#sendParams(params, tag, GasLimits.DelegateStake, amount, contract, 'DelegateStake');
  }

  async withdrawStakeOrder(stZIL: string) {
    const amount = toDecimals(stZIL, this.stZIL.decimals).toString();
    const contract = this.stZIL.base16;
    const tag = 'WithdrawTokensAmt';
    const params = [
      {
        vname: 'amount',
        type: "Uint128",
        value: amount
      }
    ];

    return this.#sendParams(params, tag, GasLimits.WithdrawStakeAmt, String(0), contract, 'WithdrawStakeOrder');
  }

  #sendParams(params: ParamItem[], tag: string, gasLimit: GasLimits, amount: string, toAddr: string, title: string) {
    const gasPrice = this.gas.gasPrice + 100;
    return sendToSignTx({
      amount,
      title,
      gasLimit,
      toAddr,
      data: JSON.stringify({
        params,
        _tag: tag
      }),
      code: '',
      gasPrice,
      icon: Runtime.extension.getURL('/icons/icon128.png')
    });
  }
}
