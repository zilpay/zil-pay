/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { CipherState } from 'types/cipher';
import { writable } from 'svelte/store';

export default writable<CipherState>({
  encryptParams: undefined,
  decryptParams: undefined
});
