/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2022 ZilPay
 */

export interface DexState {
  liquidityFee: number;
  protocolFee: number;
  slippage: number;
  blocks: number;
  rewarded: string;
  contract: {
    [net: string]: string;
  }
}
