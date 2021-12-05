/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { Runtime } from 'lib/runtime';

export async function closePopup() {
  try {
    window.close();
  } catch {
    ////
  }

  try {
    const { id } = await Runtime.windows.getCurrent();
    Runtime.windows.remove(id, console.error);
  } catch {
    ////
  }
}
