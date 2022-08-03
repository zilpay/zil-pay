/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { DexState } from 'types/dex';

import { BLOCKS, SLIPPAGE } from 'config/dex';
import { writable } from 'svelte/store';
import { Contracts } from 'config/contracts';

export default writable<DexState>({
  liquidityFee: 0,
  rewarded: Contracts.ZERO_ADDRESS,
  protocolFee: 0,
  slippage: SLIPPAGE,
  blocks: BLOCKS,
  contract: {}
});
