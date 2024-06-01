/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { startStream } from './stream';
import { inject } from './inject';

export async function startBrowserContent() {
  startStream();
  inject('inpage.js');
}

