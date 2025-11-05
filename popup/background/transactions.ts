import type { BackgroundState } from "background/storage";
import type { BuildTokenTransferParams } from "types/tx";

import { MTypePopup } from "config/stream";
import { warpMessage, type SendResponseParams } from "lib/popup/warp-message";
import { Message } from "lib/streem/message";
import globalStore from "popup/store/global";
import type { RequiredTxParams } from "types/gas";
import type { IHistoricalTransactionState } from "background/rpc/history_tx";

export async function buildTokenTransfer(params: BuildTokenTransferParams) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.BUILD_TOKEN_TRANSFER,
    payload: params,
  }).send();
  
  const resolve = warpMessage(data) as BackgroundState;
  globalStore.set(resolve);
  return resolve;
}

export async function estimateGas(confirmIndex: number, walletIndex: number, accountIndex: number) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.ESTIMATE_GAS,
    payload: {
      confirmIndex,
      walletIndex,
      accountIndex,
    },
  }).send();

  const resolve = warpMessage(data) as RequiredTxParams;
  return {
    gasPrice: BigInt(resolve.gasPrice),
    maxPriorityFee: BigInt(resolve.maxPriorityFee.toString()),
    feeHistory: {
      maxFee: BigInt(resolve.feeHistory.maxFee),
      priorityFee: BigInt(resolve.feeHistory.priorityFee),
      baseFee: BigInt(resolve.feeHistory.baseFee),
    },
    txEstimateGas: BigInt(resolve.txEstimateGas),
    blobBaseFee: BigInt(resolve.blobBaseFee),
    nonce: resolve.nonce,
  } as RequiredTxParams;
}

export async function checkTransactionsHistory(walletIndex: number) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.CHECK_TRANSACTIONS_HISTORY,
    payload: {
      walletIndex,
    },
  }).send();

  const resolve = warpMessage(data) as IHistoricalTransactionState[];

  return resolve;
}

export async function signConfrimTx(
  confirmIndex: number,
  walletIndex: number,
  accountIndex: number,
  signature?: string,
) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.SIGN_TX_AND_SEND,
    payload: {
      confirmIndex,
      walletIndex,
      accountIndex,
      signature,
    },
  }).send();

  const resolve = warpMessage(data) as IHistoricalTransactionState;

  return resolve;
}

export async function genRLPTx(confirmIndex: number, walletIndex: number, accountIndex: number, path?: string) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.GEN_RLP_TX,
    payload: {
      path,
      confirmIndex,
      walletIndex,
      accountIndex,
    },
  }).send();

  const resolve = warpMessage(data) as string[];

  return resolve;
}

export async function rejectConfirm(index: number, walletIndex: number) {
  const data = await new Message<SendResponseParams>({
    type: MTypePopup.REJECT_CONFIRM,
    payload: {
      index,
      walletIndex,
    },
  }).send();
  
  warpMessage(data);
}




