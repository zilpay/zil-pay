import { RpcProvider, type JsonRPCRequest, type JsonRPCResponse } from './provider';
import { EvmMethods, ZilMethods } from 'config/jsonrpc';
import { HistoricalTransaction } from './history_tx';
import { TransactionReceipt } from 'crypto/tx';
import { hexToUint8Array, stripHexPrefix } from 'lib/utils/hex';
import { TransactionStatus } from 'config/tx';
import { TypeOf } from 'lib/types';
import { Address } from 'crypto/address';
import { ZILLIQA } from 'config/slip44';

const MINUTES_IN_SECONDS = 10 * 60;

export async function buildSendSignedTxRequest(tx: TransactionReceipt): Promise<JsonRPCRequest> {
  if (tx.scilla) {
    return RpcProvider.buildPayload(ZilMethods.CreateTransaction, [await tx.scilla.toJSON()]);
  } else if (tx.evm) {
    const encodedTx = tx.evm.toHex(true);
    return RpcProvider.buildPayload(EvmMethods.SendRawTransaction, [encodedTx]);
  }
  
  throw new Error('Invalid transaction type');
}

export function buildPayloadTxReceipt(tx: HistoricalTransaction): JsonRPCRequest {
  if (tx.scilla) {
    return RpcProvider.buildPayload(ZilMethods.GetTransaction, [stripHexPrefix(tx.scilla.hash)]);
  } else if (tx.evm) {
    return RpcProvider.buildPayload(EvmMethods.GetTransactionReceipt, [tx.evm.transactionHash]);
  }
  
  throw new Error('Invalid chain type');
}

export async function processTxReceiptResponse(
  response: JsonRPCResponse<any>,
  tx: HistoricalTransaction
): Promise<void> {
  if (response.error) {
    const now = Math.floor(Date.now() / 1000);
    const cutoff = now - MINUTES_IN_SECONDS;

    if (tx.timestamp < cutoff) {
      tx.status = TransactionStatus.Failed;
    }

    return;
  }

  if (!response.result) {
    throw new Error(`No tx`);
  }

  const result = response.result;

  if (tx.scilla) {
    tx.scilla = result;

    if (tx.scilla!.senderPubKey) {
      const pubKeyBytes = hexToUint8Array(tx.scilla!.senderPubKey);
      const addr = await Address.fromPubKey(pubKeyBytes, ZILLIQA);

      tx.scilla!.senderAddr = await addr.toZilBech32();
    }

    if (tx.scilla?.receipt?.success) {
      tx.status = TransactionStatus.Success;
    } else {
      tx.status = TransactionStatus.Failed;
    }
  } else if (tx.evm) {
    tx.evm = result;

    if (result.status === "0x1") {
      tx.status = TransactionStatus.Success;
    } else if (result.status === "0x0") {
      tx.status = TransactionStatus.Failed;
    }
  }
}

export function processTxSendResponse(
  response: JsonRPCResponse<any>,
  tx: TransactionReceipt
): string {
  let hash: string | undefined;

  if (response.error) {
    throw new Error(`RPC Error: ${response.error.message}`);
  }

  if (!response.result) {
    throw new Error('Invalid response: missing result');
  }

  if (tx.scilla) {
    hash = response.result.TranID;
  } else if (tx.evm) {
    hash = response.result;
  }

  if (!TypeOf.isString(hash)) {
    throw new Error('Invalid tx hash');
  }

  return hash!;
}
