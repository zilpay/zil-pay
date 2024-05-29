/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { inject } from './inject';
import { startStream } from './stream';

export async function startBrowserContent() {
  startStream();
  await inject('inpage.js');
}
