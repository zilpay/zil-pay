/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */

import type { Subscriber } from "node_modules/svelte/store";

export function storeToPromise<T>(subscribe: (this: void, run: Subscriber<T>) => Function): Promise<T> {
  return new Promise((resolve) => {
    const obs = subscribe((data) => {
      resolve(data);
      obs();
    });
  });
}
