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

export const handler = Object.freeze(new Handler());
export const zilPay = Object.freeze(new ZilPay(handler.stream, handler.subject));
handler.initialized();
window['zilPay'] = zilPay;
