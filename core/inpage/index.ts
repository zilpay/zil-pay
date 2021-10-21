/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { Handler } from './handler';
import { ZilPay } from './zilpay';

const handler = Object.freeze(new Handler());
handler.initialized();
window['zilPay'] = Object.freeze(new ZilPay(handler.stream, handler.subject));

console.log(window['zilPay']);
