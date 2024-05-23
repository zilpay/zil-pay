/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2024 ZilPay
 */

import { Runtime } from ".";


export function getExtensionURL(content: string) {
  return Runtime.runtime.getURL(content);
}
