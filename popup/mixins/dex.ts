/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2022 ZilPay
 */
import { get } from 'svelte/store';

import dexStore from 'popup/store/dex';

import { Contracts } from 'config/contracts';

export class ZIlPayDex {
  public static FEE_DEMON = BigInt(10000);

  public get state() {
    return get(dexStore);
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
