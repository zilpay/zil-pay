/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { GuardType } from 'types/account';
import { writable } from 'svelte/store';
import { ShaAlgorithms } from 'config/sha-algoritms';

export default writable<GuardType>({
  isEnable: false,
  isReady: false,
  algorithm: ShaAlgorithms.sha256,
  iteractions: 0
});
