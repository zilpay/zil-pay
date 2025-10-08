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

