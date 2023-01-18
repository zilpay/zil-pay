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

import { get } from 'svelte/store';
import Big from 'big.js';

import { Contracts } from 'config/contracts';

import gasStore from 'popup/store/gas';
import currencyStore from 'popup/store/currency';
import rateStore from 'popup/store/rate';

Big.PE = 99;


export class AvelyStake {
  static FEE_DEMON = 10;

  get gas() {
    return get(gasStore);
  }

  get localRate() {
    return get(rateStore)[get(currencyStore)];
  }

  getVirtualParams(pair: TokenValue[], { totalStaked, totalSupply }: StakeResponse) {
    const data = {
      rate: Big(0),
      converted: 0
    };

    if (!pair || pair.length < 1) {
      return data;
    }

    const [exactToken] = pair;
    const expectAmount = Big(exactToken.value);
    const localRate = Number(this.localRate) || 0;

    if (exactToken.meta.base16 === Contracts.ZERO_ADDRESS) {
      data.rate = Big(totalSupply).div(totalStaked).mul(expectAmount);
      console.log(Number(expectAmount));
      data.converted = Number(expectAmount) * localRate;
    } else {
      data.rate = Big(totalStaked).div(totalSupply).mul(expectAmount);
      data.converted = Number(data.rate) * localRate;
    }

    return data;
  }
}
