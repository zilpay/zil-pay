import { RpcProvider, type JsonRPCRequest, type JsonRPCResponse } from './provider';
import { EvmMethods, ZilMethods } from 'config/jsonrpc';
import { HistoricalTransaction, TransactionStatus } from './history_tx';
import { TransactionReceipt } from 'crypto/tx';
import { Address } from 'crypto/address';
import { ZILLIQA } from 'config/slip44';
import { stripHexPrefix } from 'lib/utils/hex';

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
  if (tx.chain_type === 'Scilla') {
    return RpcProvider.buildPayload(ZilMethods.GetTransactionStatus, [stripHexPrefix(tx.transaction_hash)]);
  } else if (tx.chain_type === 'EVM') {
    return RpcProvider.buildPayload(EvmMethods.GetTransactionReceipt, [tx.transaction_hash]);
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
      tx.error = response.error.message;
    }
    return;
  }

  if (!response.result) {
    throw new Error(`No transaction found with hash: ${tx.transaction_hash}`);
  }

  const result = response.result;

  if (tx.chain_type === 'Scilla') {
    const amount = result.amount ? BigInt(result.amount) : tx.amount;
    const gasLimit = result.gasLimit ? BigInt(result.gasLimit) : tx.gasLimit || 0n;
    const gasPrice = result.gasPrice ? BigInt(result.gasPrice) : tx.gasPrice || 0n;
    const nonce = result.nonce ? BigInt(result.nonce) : tx.nonce;
    const statusCode = result.status ? Number(result.status) : null;
    const pubKey = result.senderAddr;

    tx.amount = amount;
    tx.gasLimit = gasLimit;
    tx.gasPrice = gasPrice;
    tx.nonce = nonce;
    tx.fee = gasPrice * gasLimit;

    if (statusCode) {
      tx.status_code = statusCode;
      switch (statusCode) {
        case 1:
        case 2:
        case 4:
        case 5:
        case 6:
          tx.status = TransactionStatus.Pending;
          break;
        case 3:
          tx.status = TransactionStatus.Success;
          break;
        default:
          tx.status = TransactionStatus.Failed;
      }
    }

    if (tx.status === TransactionStatus.Pending) {
      const now = Math.floor(Date.now() / 1000);
      const cutoff = now - MINUTES_IN_SECONDS;

      if (tx.timestamp < cutoff) {
        tx.status = TransactionStatus.Failed;
        tx.error = 'timeout';
      }
    }

    if (pubKey) {
      tx.sender = await (await Address.fromPubKey(pubKey, ZILLIQA)).toZilBech32();
    }
  } else if (tx.chain_type === 'EVM') {
    tx.sender = result.from;
    tx.contract_address = result.contractAddress || null;

    if (result.to) {
      tx.recipient = result.to;
    }

    tx.block_number = result.blockNumber ? BigInt(result.blockNumber) : null;
    tx.gasUsed = result.gasUsed ? BigInt(result.gasUsed) : null;
    tx.blobGasUsed = result.blobGasUsed ? BigInt(result.blobGasUsed) : null;
    tx.blobGasPrice = result.blobGasPrice ? BigInt(result.blobGasPrice) : null;
    tx.effectiveGasPrice = result.effectiveGasPrice ? BigInt(result.effectiveGasPrice) : null;

    const isSuccess = result.status === '0x1' || result.status === 1;
    tx.status = isSuccess ? TransactionStatus.Success : TransactionStatus.Failed;

    let totalCost = BigInt(result.gasUsed || 0) * BigInt(result.effectiveGasPrice || 0);

    if (result.blobGasUsed && result.blobGasPrice) {
      totalCost += BigInt(result.blobGasUsed) * BigInt(result.blobGasPrice);
    }

    tx.fee = totalCost;
  }
}

export function processTxSendResponse(
  response: JsonRPCResponse<any>,
  tx: TransactionReceipt
): void {
  if (response.error) {
    throw new Error(`RPC Error: ${response.error.message}`);
  }

  if (!response.result) {
    throw new Error('Invalid response: missing result');
  }

  if (tx.scilla) {
    const result = response.result;
    const info = result.Info || '';
    const txId = result.TranID;

    if (!txId) {
      throw new Error('Invalid transaction hash');
    }

    tx.metadata.hash = txId;
    tx.metadata.info = info;
  } else if (tx.evm) {
    const hash = response.result;

    if (typeof hash !== 'string') {
      throw new Error('Invalid transaction hash');
    }

    tx.metadata.hash = hash;
  }
}
