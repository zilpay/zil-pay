/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { SSN } from 'types/ssn';
import { writable } from 'svelte/store';

export default writable({
  selected: 0,
  list: [] as SSN[]
});
