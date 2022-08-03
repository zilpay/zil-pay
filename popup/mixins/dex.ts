/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2022 ZilPay
 */
import type { ZRC2Token } from 'types/token';
import type { ParamItem } from 'types/transaction';

import { get } from 'svelte/store';
import Big from 'big.js';

import dexStore from 'popup/store/dex';
import zrcStore from 'popup/store/zrc';
import currencyStore from 'popup/store/currency';
import rateStore from 'popup/store/rate';
import walletStore from 'popup/store/wallet';
import gasStore from 'popup/store/gas';

import { Contracts } from 'config/contracts';
import { Runtime } from 'lib/runtime';
import { sendToSignTx } from 'app/backend/sign';
import { getLatestBlockNumber } from 'app/backend/netwrok';
import { getAllowancesForSwap } from 'app/backend/tokens';
import netwrok from 'app/store/netwrok';


Big.PE = 99;


export interface TokenValue {
  value: string;
  meta: ZRC2Token;
  converted?: number;
  approved: Big;
}

enum GasLimits {
  SwapExactZILForTokens = 2637,
  SwapExactTokensForZIL = 3163,
  SwapExactTokensForTokens = 4183,
  IncreaseAllowance = 600,
  Default = 5000
}

export class ZIlPayDex {
  public static FEE_DEMON = BigInt(10000);

  public get state() {
    return get(dexStore);
  }

  public get netwrok() {
    return get(netwrok).selected;
  }

  public get gas() {
    return get(gasStore);
  }

  public get tokens() {
    return get(zrcStore);
  }

  public get localRate() {
    return get(rateStore)[get(currencyStore)];
  }

  public get rewarded() {
    return this.state.rewarded;
  }

  public get account() {
    const { identities, selectedAddress } = get(walletStore);
    return identities[selectedAddress];
  }

  public get contract() {
    return this.state.contract[this.netwrok];
  }


  public async swap(pair: TokenValue[]) {
    const [exactToken, limitToken] = pair;
    const limit = this.#valueToBigInt(limitToken.value, limitToken.meta);
    const exact = this.#valueToBigInt(exactToken.value, exactToken.meta);
    const { blocknumber } = await getLatestBlockNumber();
    const deadlineBlock = blocknumber + this.state.blocks;
    const limitAfterSlippage = this.afterSlippage(limit);

    if (exactToken.meta.base16 === Contracts.ZERO_ADDRESS) {
      await this.swapExactZILForTokens(
        exact,
        limitAfterSlippage,
        limitToken.meta.base16,
        deadlineBlock
      );

      return;
    } else if (limitToken.meta.base16 === Contracts.ZERO_ADDRESS && exactToken.meta.base16 !== Contracts.ZERO_ADDRESS) {
      const approved = exactToken.approved.gte(Big(exactToken.value));

      await this.swapExactTokensForZIL(
        exact,
        limitAfterSlippage,
        exactToken.meta.base16,
        deadlineBlock
      );

      if (!approved) {
        const balance = this.account.zrc2[exactToken.meta.base16];
        await this.increaseAllowance(this.contract, balance, exactToken.meta.base16);
      }

      return;
    } else if (limitToken.meta.base16 !== Contracts.ZERO_ADDRESS && exactToken.meta.base16 !== Contracts.ZERO_ADDRESS) {
      const approved = exactToken.approved.gte(Big(exactToken.value));

      await this.swapExactTokensForTokens(
        exact,
        limitAfterSlippage,
        deadlineBlock,
        exactToken.meta.base16,
        limitToken.meta.base16
      );

      if (!approved) {
        const balance = this.account.zrc2[exactToken.meta.base16];
        await this.increaseAllowance(this.contract, balance, exactToken.meta.base16);
      }

      return;
    }

    throw new Error('incorrect Pair');
  }


  public async swapExactZILForTokens(exact: bigint, limit: bigint, token: string, deadlineBlock: number) {
    const tag = 'SwapExactZILForTokens';
    const params = [
      {
        vname: 'token_address',
        type: 'ByStr20',
        value: token
      },
      {
        vname: 'min_token_amount',
        type: 'Uint128',
        value: String(limit)
      },
      {
        vname: 'deadline_block',
        type: 'BNum',
        value: String(deadlineBlock)
      },
      {
        vname: 'recipient_address',
        type: 'ByStr20',
        value: this.account.base16
      }
    ];
    return this.#sendParams(params, tag, GasLimits.SwapExactZILForTokens, String(exact), this.contract);
  }

  public async swapExactTokensForZIL(exact: bigint, limit: bigint, token: string, deadlineBlock: number) {
    const tag = 'SwapExactTokensForZIL';
    const params = [
      {
        vname: 'token_address',
        type: 'ByStr20',
        value: token
      },
      {
        vname: 'token_amount',
        type: 'Uint128',
        value: String(exact)
      },
      {
        vname: 'min_zil_amount',
        type: 'Uint128',
        value: String(limit)
      },
      {
        vname: 'deadline_block',
        type: 'BNum',
        value: String(deadlineBlock)
      },
      {
        vname: 'recipient_address',
        type: 'ByStr20',
        value: this.account.base16
      }
    ];

    return this.#sendParams(params, tag, GasLimits.SwapExactTokensForZIL, String(0), this.contract);
  }

  public async swapExactTokensForTokens(exact: bigint, limit: bigint, deadlineBlock: number, inputToken: string, outputToken: string) {
    const tag = 'SwapExactTokensForTokens';
    const params = [
      {
        vname: 'token0_address',
        type: 'ByStr20',
        value: inputToken
      },
      {
        vname: 'token1_address',
        type: 'ByStr20',
        value: outputToken
      },
      {
        vname: 'token0_amount',
        type: 'Uint128',
        value: String(exact)
      },
      {
        vname: 'min_token1_amount',
        type: 'Uint128',
        value: String(limit)
      },
      {
        vname: 'deadline_block',
        type: 'BNum',
        value: String(deadlineBlock)
      },
      {
        vname: 'recipient_address',
        type: 'ByStr20',
        value: this.account.base16
      }
    ];

    return this.#sendParams(params, tag, GasLimits.SwapExactTokensForTokens, String(0), this.contract);
  }

  public async increaseAllowance(spender: string, amount: string, token: string) {
    const tag = 'IncreaseAllowance';
    const params = [
      {
        vname: 'spender',
        type: 'ByStr20',
        value: spender.toLowerCase()
      },
      {
        vname: 'amount',
        type: 'Uint128',
        value: amount
      }
    ];

    return this.#sendParams(params, tag, GasLimits.IncreaseAllowance, String(0), token);
  }

  public async isAllowed(pair: TokenValue[]) {
    const [exactToken] = pair;

    if (exactToken.meta.base16 === Contracts.ZERO_ADDRESS) {
      return Big(-1);
    }

    const allowances = Big(await getAllowancesForSwap(exactToken.meta.base16));
    return allowances.div(this.toDecimails(exactToken.meta.decimals));
  }


  public afterSlippage(amount: bigint) {
    if (this.state.slippage <= 0) {
      return amount;
    }

    const _slippage = ZIlPayDex.FEE_DEMON - BigInt(this.state.slippage * 100);

    return amount * _slippage / ZIlPayDex.FEE_DEMON;
  }

  public calcBigSlippage(value: string, slippage: number) {
    if (slippage <= 0 || !value || value === '0') {
      return Big(value).round(9).toString();
    }

    const amount = Big(value);
    const demon = Big(String(ZIlPayDex.FEE_DEMON));
    const slip = demon.sub(slippage * 100);

    return amount.mul(slip).div(demon).round(7).toString();
  }

  public getRealAmount(pair: TokenValue[]) {
    let data = {
      amount: Big(0),
      converted: 0,
      gas: GasLimits.Default
    };
    const [exactToken, limitToken] = pair;
    const cashback = this.rewarded !== String(limitToken.meta.base16).toLowerCase()
      && this.rewarded !== String(exactToken.meta.base16).toLowerCase();
    const exactAmount = Big(exactToken.value);
    const bigAmount = exactAmount.mul(this.toDecimails(exactToken.meta.decimals)).round();
    const _amount = BigInt(String(bigAmount));
    const localRate = Number(this.localRate) || 0;

    if (exactToken.meta.base16 === Contracts.ZERO_ADDRESS) {
      const pool = limitToken.meta.pool.map(BigInt);
      const _limitAmount = this.#zilToTokens(_amount, pool, cashback);
      const bigLimitAmount = Big(String(_limitAmount));

      data.amount = bigLimitAmount.div(this.toDecimails(limitToken.meta.decimals));
      data.converted = localRate * Number(exactToken.value);
      data.gas = GasLimits.SwapExactZILForTokens;

      return data;
    } else if (limitToken.meta.base16 === Contracts.ZERO_ADDRESS && exactToken.meta.base16 !== Contracts.ZERO_ADDRESS) {
      const pool = exactToken.meta.pool.map(BigInt);
      const _limitAmount = this.#tokensToZil(_amount, pool, cashback);
      const bigLimitAmount = Big(String(_limitAmount));

      data.amount = bigLimitAmount.div(this.toDecimails(limitToken.meta.decimals));
      data.converted = localRate * Number(data.amount);
      data.gas = GasLimits.SwapExactTokensForZIL;

      if (exactToken.approved.lt(exactAmount)) {
        data.gas += GasLimits.IncreaseAllowance;
      }

      return data;
    } else if (limitToken.meta.base16 !== Contracts.ZERO_ADDRESS && exactToken.meta.base16 !== Contracts.ZERO_ADDRESS) {
      const [ZIL] = this.tokens;
      const inputPool = exactToken.meta.pool.map(BigInt);
      const outputPool = limitToken.meta.pool.map(BigInt);
      const [zils, _limitAmount] = this.#tokensToTokens(_amount, inputPool, outputPool, cashback);
      const bigLimitAmount = Big(String(_limitAmount));
      const zilAmount = Big(String(zils)).div(this.toDecimails(ZIL.decimals));

      data.converted = localRate * Number(zilAmount);
      data.amount = bigLimitAmount.div(this.toDecimails(limitToken.meta.decimals));
      data.gas = GasLimits.SwapExactTokensForTokens;

      if (exactToken.approved.lt(exactAmount)) {
        data.gas += GasLimits.IncreaseAllowance;
      }

      return data;
    }

    return data;
  }

  public getVirtualParams(pair: TokenValue[]) {
    const data = {
      rate: Big(0),
      impact: 0,
      converted: 0
    };

    if (!pair || pair.length < 1) {
      return data;
    }

    const [exactToken, limitToken] = pair;
    const expectAmount = Big(exactToken.value);
    const limitAmount = Big(limitToken.value);
    const localRate = Number(this.localRate) || 0;

    if (exactToken.meta.base16 === Contracts.ZERO_ADDRESS) {
      const zilReserve = Big(limitToken.meta.pool[0]).div(this.toDecimails(exactToken.meta.decimals));
      const tokenReserve = Big(limitToken.meta.pool[1]).div(this.toDecimails(limitToken.meta.decimals));
      const rate = zilReserve.div(tokenReserve);

      data.rate = tokenReserve.div(zilReserve);
      data.impact = this.calcPriceImpact(expectAmount, limitAmount, rate);
      data.converted = localRate;
    } else if (limitToken.meta.base16 === Contracts.ZERO_ADDRESS && exactToken.meta.base16 !== Contracts.ZERO_ADDRESS) {
      const zilReserve = Big(exactToken.meta.pool[0]).div(this.toDecimails(limitToken.meta.decimals));
      const tokenReserve = Big(exactToken.meta.pool[1]).div(this.toDecimails(exactToken.meta.decimals));
      const rate = tokenReserve.div(zilReserve);

      data.rate = zilReserve.div(tokenReserve);
      data.impact = this.calcPriceImpact(expectAmount, limitAmount, rate);
      data.converted = localRate * Number(data.rate);
    } else if (limitToken.meta.base16 !== Contracts.ZERO_ADDRESS && exactToken.meta.base16 !== Contracts.ZERO_ADDRESS) {
      const [ZIL] = this.tokens;

      const inputZils = Big(exactToken.meta.pool[0]).div(this.toDecimails(ZIL.decimals));
      const inputTokens = Big(exactToken.meta.pool[1]).div(this.toDecimails(exactToken.meta.decimals));
      const outpuZils = Big(limitToken.meta.pool[0]).div(this.toDecimails(ZIL.decimals));
      const outputTokens = Big(limitToken.meta.pool[1]).div(this.toDecimails(limitToken.meta.decimals));

      const inputRate = inputTokens.div(inputZils);
      const outpuRate = outputTokens.div(outpuZils);
      const rate = inputRate.div(outpuRate);

      data.converted = localRate * Number(inputRate);
      data.rate = outpuRate.div(inputRate);
      data.impact = this.calcPriceImpact(expectAmount, limitAmount, rate);
    }

    if (expectAmount.gt(0) && limitAmount.gt(0)) {
      data.rate = limitAmount.div(expectAmount);
      data.converted = localRate * Number(data.rate);

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


  #sendParams(params: ParamItem[], tag: string, gasLimit: GasLimits, amount: string, toAddr: string) {
    const gasPrice = this.gas.gasPrice + 100;
    return sendToSignTx({
      amount,
      gasLimit,
      toAddr,
      data: JSON.stringify({
        params,
        _tag: tag
      }),
      code: '',
      gasPrice,
      icon: Runtime.extension.getURL('/icons/icon128.png'),
      title: 'Swap'
    });
  }

  #valueToBigInt(amount: string, token: ZRC2Token) {
    return BigInt(
      Big(amount).mul(this.toDecimails(token.decimals)).round().toString()
    );
  }

  #zilToTokens(amount: bigint, inputPool: bigint[], cashback: boolean) {
    const [zilReserve, tokenReserve] = inputPool;
    const amountAfterFee = (this.state.protocolFee === 0 || !cashback) ?
      amount : amount - (amount / BigInt(this.state.protocolFee));
    return this.#outputFor(amountAfterFee, BigInt(zilReserve), BigInt(tokenReserve));
  }

  #tokensToZil(amount: bigint, inputPool: bigint[], cashback: boolean) {
    const [zilReserve, tokenReserve] = inputPool;
    const zils = this.#outputFor(amount, BigInt(tokenReserve), BigInt(zilReserve));

    return (this.state.protocolFee === 0 || !cashback) ?
      zils : zils - (zils / BigInt(this.state.protocolFee));
  }

  #tokensToTokens(amount: bigint, inputPool: bigint[], outputPool: bigint[], cashback: boolean) {
    const [inputZilReserve, inputTokenReserve] = inputPool;
    const [outputZilReserve, outputTokenReserve] = outputPool;
    const zilIntermediateAmount = this.#outputFor(
      amount,
      BigInt(inputTokenReserve),
      BigInt(inputZilReserve),
      ZIlPayDex.FEE_DEMON
    );
    const zils = (this.state.protocolFee === 0 || !cashback) ?
      zilIntermediateAmount : zilIntermediateAmount - (zilIntermediateAmount / BigInt(this.state.protocolFee));

    return [
      zils,
      this.#outputFor(zils, BigInt(outputZilReserve), BigInt(outputTokenReserve))
    ]
  }

  #outputFor(exactAmount: bigint, inputReserve: bigint, outputReserve: bigint, fee: bigint = BigInt(this.state.liquidityFee)) {
    const exactAmountAfterFee = exactAmount * fee;
    const numerator = exactAmountAfterFee * outputReserve;
    const inputReserveAfterFee = inputReserve * ZIlPayDex.FEE_DEMON;
    const denominator = inputReserveAfterFee + exactAmountAfterFee;

    return numerator / denominator;
  }
}
