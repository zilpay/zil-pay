/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2022 ZilPay
 */
import type { ZRC2Token } from 'types/token';

import { get } from 'svelte/store';
import Big from 'big.js';

import dexStore from 'popup/store/dex';
import zrcStore from 'popup/store/zrc';

import { Contracts } from 'config/contracts';

export interface TokenValue {
  value: string;
  meta: ZRC2Token;
}

export class ZIlPayDex {
  public static FEE_DEMON = BigInt(10000);

  public get state() {
    return get(dexStore);
  }

  public get tokens() {
    return get(zrcStore);
  }

  public getRealAmount(pair: TokenValue[]) {
    const [exactToken, limitToken] = pair;
    const bigAmount = Big(exactToken.value).mul(this.toDecimails(exactToken.meta.decimals)).round();
    const _amount = BigInt(String(bigAmount));

    if (exactToken.meta.base16 === Contracts.ZERO_ADDRESS) {
      const pool = limitToken.meta.pool.map(BigInt);
      const _limitAmount = this.#zilToTokens(_amount, pool);
      const bigLimitAmount = Big(String(_limitAmount));

      return bigLimitAmount.div(this.toDecimails(limitToken.meta.decimals));
    } else if (limitToken.meta.base16 === Contracts.ZERO_ADDRESS && exactToken.meta.base16 !== Contracts.ZERO_ADDRESS) {
      const pool = exactToken.meta.pool.map(BigInt);
      const _limitAmount = this.#tokensToZil(_amount, pool);
      const bigLimitAmount = Big(String(_limitAmount));

      return bigLimitAmount.div(this.toDecimails(limitToken.meta.decimals));
    } else if (limitToken.meta.base16 !== Contracts.ZERO_ADDRESS && exactToken.meta.base16 !== Contracts.ZERO_ADDRESS) {
      const inputPool = exactToken.meta.pool.map(BigInt);
      const outputPool = limitToken.meta.pool.map(BigInt);
      const _limitAmount = this.#tokensToTokens(_amount, inputPool, outputPool);
      const bigLimitAmount = Big(String(_limitAmount));

      return bigLimitAmount.div(this.toDecimails(limitToken.meta.decimals));
    }

    throw new Error('Incorrect Pair');
  }

  public getVirtualParams(pair: TokenValue[]) {
    const data = {
      rate: Big(0),
      impact: 0
    };

    if (!pair || pair.length < 1) {
      return data
    }

    const [exactToken, limitToken] = pair;
    const expectAmount = Big(exactToken.value);
    const limitAmount = Big(limitToken.value)

    if (exactToken.meta.base16 === Contracts.ZERO_ADDRESS) {
      const zilReserve = Big(limitToken.meta.pool[0]).div(this.toDecimails(exactToken.meta.decimals));
      const tokenReserve = Big(limitToken.meta.pool[1]).div(this.toDecimails(limitToken.meta.decimals));
      const rate = zilReserve.div(tokenReserve);

      data.rate = tokenReserve.div(zilReserve);
      data.impact = this.calcPriceImpact(expectAmount, limitAmount, rate);

      return data;
    } else if (limitToken.meta.base16 === Contracts.ZERO_ADDRESS && exactToken.meta.base16 !== Contracts.ZERO_ADDRESS) {
      const zilReserve = Big(exactToken.meta.pool[0]).div(this.toDecimails(limitToken.meta.decimals));
      const tokenReserve = Big(exactToken.meta.pool[1]).div(this.toDecimails(exactToken.meta.decimals));
      const rate = tokenReserve.div(zilReserve);

      data.rate = zilReserve.div(tokenReserve);
      data.impact = this.calcPriceImpact(expectAmount, limitAmount, rate);

      return data;
    } else if (limitToken.meta.base16 !== Contracts.ZERO_ADDRESS && exactToken.meta.base16 !== Contracts.ZERO_ADDRESS) {
      const [ZIL] = this.tokens;

      const inputZils = Big(exactToken.meta.pool[0]).div(this.toDecimails(ZIL.decimals));
      const inputTokens = Big(exactToken.meta.pool[1]).div(this.toDecimails(exactToken.meta.decimals));
      const outpuZils = Big(limitToken.meta.pool[0]).div(this.toDecimails(ZIL.decimals));
      const outputTokens = Big(limitToken.meta.pool[1]).div(this.toDecimails(limitToken.meta.decimals));

      const inputRate = inputTokens.div(inputZils);
      const outpuRate = outputTokens.div(outpuZils);
      const rate = inputRate.div(outpuRate);

      data.rate = outpuRate.div(inputRate);
      data.impact = this.calcPriceImpact(expectAmount, limitAmount, rate);

      return data;
    }

    return data;
  }

  public calcPriceImpact(priceInput: Big, priceOutput: Big, currentPrice: Big) {
    try {
      const nextPrice = priceInput.div(priceOutput);
      const priceDiff = nextPrice.sub(currentPrice);
      const value = priceDiff.div(currentPrice);
      const _100 = Big(100);
      const imact = value.mul(_100).round(3).toNumber();
      const percent = Math.abs(imact);

      return percent > 100 ? 100 : percent;
    } catch {
      return 0;
    }
  }

  public toDecimails(decimals: number) {
    return Big(10).pow(decimals);
  }


  #zilToTokens(amount: bigint, inputPool: bigint[]) {
    const [zilReserve, tokenReserve] = inputPool;
    const amountAfterFee = this.state.protocolFee === 0 ? amount : amount - (amount / BigInt(this.state.protocolFee));
    return this.#outputFor(amountAfterFee, BigInt(zilReserve), BigInt(tokenReserve));
  }

  #tokensToZil(amount: bigint, inputPool: bigint[]) {
    const [zilReserve, tokenReserve] = inputPool;
    const zils = this.#outputFor(amount, BigInt(tokenReserve), BigInt(zilReserve));

    return this.state.protocolFee === 0 ? zils : zils - (zils / BigInt(this.state.protocolFee));
  }

  #tokensToTokens(amount: bigint, inputPool: bigint[], outputPool: bigint[]) {
    const [inputZilReserve, inputTokenReserve] = inputPool;
    const [outputZilReserve, outputTokenReserve] = outputPool;
    const zilIntermediateAmount = this.#outputFor(
      amount,
      BigInt(inputTokenReserve),
      BigInt(inputZilReserve),
      ZIlPayDex.FEE_DEMON
    );
    const zils = this.state.protocolFee === 0 ?
      zilIntermediateAmount : zilIntermediateAmount - (zilIntermediateAmount / BigInt(this.state.protocolFee));

    return this.#outputFor(zils, BigInt(outputZilReserve), BigInt(outputTokenReserve));
  }

  #outputFor(exactAmount: bigint, inputReserve: bigint, outputReserve: bigint, fee: bigint = BigInt(this.state.liquidityFee)) {
    const exactAmountAfterFee = exactAmount * fee;
    const numerator = exactAmountAfterFee * outputReserve;
    const inputReserveAfterFee = inputReserve * ZIlPayDex.FEE_DEMON;
    const denominator = inputReserveAfterFee + exactAmountAfterFee;

    return numerator / denominator;
  }
}
