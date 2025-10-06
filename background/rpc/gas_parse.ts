import { TransactionRequest } from 'crypto/tx';
import { EvmMethods, ZilMethods } from 'config/jsonrpc';
import { buildNonceRequest } from 'background/rpc/nonce_parser';
import { RpcProvider, type JsonRPCRequest } from 'background/rpc/provider';
import { TypeOf } from 'lib/types';
import type { Address } from 'crypto/address';

export interface GasFeeHistory {
  maxFee: bigint;
  priorityFee: bigint;
  baseFee: bigint;
}

export interface RequiredTxParams {
  gasPrice: bigint;
  maxPriorityFee: bigint;
  feeHistory: GasFeeHistory;
  txEstimateGas: bigint;
  blobBaseFee: bigint;
  nonce: number;
}

export interface FeeHistoryResult {
  baseFeePerGas: string[];
  reward: string[][];
  oldestBlock: string;
  gasUsedRatio: number[];
}

export const EIP1559 = 1559;
export const EIP4844 = 4844;

class NetworkError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NetworkError';
    }
}

class TransactionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TransactionError';
    }
}

export function buildFeeHistoryRequest(blockCount: number, percentiles: number[]): JsonRPCRequest {
    return RpcProvider.buildPayload(EvmMethods.FeeHistory, [`0x${blockCount.toString(16)}`, 'latest', percentiles]);
}

export function buildEvmEstimateGasRequest(tx: TransactionRequest): JsonRPCRequest {
    if (tx.scilla || !tx.evm) {
        throw new NetworkError("Zilliqa network doesn't support gas estimation or EVM transaction is missing");
    }
    
    try {
        return RpcProvider.buildPayload(EvmMethods.EstimateGas, [tx.evm]);
    } catch (e: any) {
        throw new TransactionError(`Failed to serialize transaction: ${e.message}`);
    }
}

export async function buildBatchGasRequest(
  tx: TransactionRequest,
  blockCount: number,
  percentiles: number[],
  features: number[],
  sender: Address,
): Promise<JsonRPCRequest[]> {
    const requests: JsonRPCRequest[] = [];

    if (tx.scilla) {
        const zilAddress = await sender.toZilBech32();
        requests.push(await buildNonceRequest(sender.type, zilAddress));
        requests.push(RpcProvider.buildPayload(ZilMethods.GetMinimumGasPrice, []));
        return requests;
    } else if (tx.evm) {
        const ethAddress = await sender.toEthChecksum();
        requests.push(await buildNonceRequest(sender.type, ethAddress));
        requests.push(RpcProvider.buildPayload(EvmMethods.GasPrice, []));

        const requestEstimateGas = RpcProvider.buildPayload(EvmMethods.EstimateGas, [tx.toJSON()]);
        requests.push(requestEstimateGas);

        if (features.includes(EIP1559)) {
            requests.push(RpcProvider.buildPayload(EvmMethods.MaxPriorityFeePerGas, []));
            requests.push(buildFeeHistoryRequest(blockCount, percentiles));
        }

        if (features.includes(EIP4844)) {
            requests.push(RpcProvider.buildPayload(EvmMethods.BlobBaseFee, []));
        }

        return requests;
    }
    
    throw new TransactionError('unsupported transaction.');
}

export function processParseFeeHistoryRequest(feeHistoryValue: FeeHistoryResult): GasFeeHistory {
    const lastBaseFeeStr = feeHistoryValue.baseFeePerGas[feeHistoryValue.baseFeePerGas.length - 1];
    if (!lastBaseFeeStr) {
        throw new Error('baseFeePerGas not found or empty in fee history');
    }
    const baseFee = BigInt(lastBaseFeeStr);
    const lastRewardArr = feeHistoryValue.reward[feeHistoryValue.reward.length - 1];

    if (!lastRewardArr || !TypeOf.isArray(lastRewardArr) || !TypeOf.isString(lastRewardArr[1])) {
        throw new Error('reward not found or has invalid format in fee history');
    }

    const priorityFee = BigInt(lastRewardArr[1]);
    const maxFee = baseFee * 2n + priorityFee;

    return {
        maxFee,
        priorityFee,
        baseFee,
    };
}

