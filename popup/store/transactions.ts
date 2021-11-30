/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { MessagePayload, TransactionForConfirm, StoredTx } from 'types/transaction';
import { writable } from 'svelte/store';

interface TxStore {
  forConfirm: TransactionForConfirm[],
  transactions: StoredTx[],
  message?: MessagePayload;
}
export default writable<TxStore>({
  forConfirm: [],
  transactions: [],
  message: undefined
});
