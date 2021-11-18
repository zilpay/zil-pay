/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import { Common } from 'config/common';
import { writable } from 'svelte/store';

export default writable<number>(Number(Common.TIME_BEFORE_LOCK));
