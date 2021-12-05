/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */

import { TypeOf } from "lib/type/type-checker";

type RuntimeType = typeof globalThis.chrome;

const hasWindow = TypeOf.isUndefined(globalThis.window);
const hasBrowser = TypeOf.isUndefined(globalThis.browser);

function runtime() {
  if (hasBrowser) {
    return globalThis.browser;
  }

  if (hasWindow) {
    return globalThis.window;
  }

  return globalThis.chrome;
}

export const Runtime: RuntimeType = runtime();
