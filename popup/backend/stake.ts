/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2023 ZilPay
 */
import type { StakeResponse } from "types/stake";

import { Message } from "lib/streem/message";
import { MTypePopup } from "lib/streem/stream-keys";
import { warpMessage } from "lib/utils/warp-message";


export async function getStakeProps() {
  const data = await Message.signal(MTypePopup.GET_STAKE_PROPS).send();
  return warpMessage(data) as StakeResponse;
}
