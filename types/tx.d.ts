import type { IFTokenState } from "background/storage";

export interface BuildTokenTransferParams {
  walletIndex: number;
  accountIndex: number;
  tokenAddr: string;
  to: string;
  amount: string;
}

export interface TransactionRequestScilla {
  chainId?: number;
  nonce?: string | number;
  gasPrice?: string | number;
  gasLimit?: string | number;
  priority?: boolean;
  code?: string;
  data?: string;
  toAddr: string;
  amount: string;
}

export interface TransactionReceiptScilla extends TransactionRequestScilla {
  hash: string;
  version: string;
  signature: string;
  nonce: string;
  senderPubKey: string;
  senderAddr: string;
  gasPrice: string;
  gasLimit: string;
  receipt?: {
    accepted: boolean;
    gas_used: string;
    cumulative_gas_used: string;
    cumulative_gas: string;
    epoch_num: string;
    event_logs?: unknown;
    errors?: unknown;
    success?: boolean;
    exceptions?: {
      line: number;
      message: string;
    }[];
  };
}

export interface TransactionRequestEVM {
  nonce?: number;
  from?: string;
  to?: string;
  value?: string;
  gasLimit?: number;
  data?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  gasPrice?: string;
  chainId?: number;
  accessList?: AccessListItem[];
  blobVersionedHashes?: string[];
  maxFeePerBlobGas?: string;
}

export interface Log {
  address: string;
  blockHash: string;
  blockNumber: string;
  blockTimestamp: string;
  data: string;
  logIndex: string;
  removed: boolean;
  topics: string[];
  transactionHash: string;
  transactionIndex: string;
}

export interface TransactionReceiptEVM {
  accessList?: { address: string; storageKeys: string[] }[];
  blockHash?: string;
  blockNumber?: string;
  chainId?: string;
  contractAddress?: string | null;
  cumulativeGasUsed?: string;
  effectiveGasPrice?: string;
  from: string;
  gas?: string;
  gasPrice?: string;
  gasUsed?: string;
  input?: string;
  logs?: Log[];
  logsBloom?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  nonce?: string;
  status?: string;
  to: string;
  transactionHash: string;
  transactionIndex?: string;
  type: string;
  value?: string;
}

export interface AccessListItem {
  address: string;
  storageKeys: string[];
}

export interface FTState extends IFTokenState {
  balances: undefined;
  value?: string;
  recipient?: string;
}

export interface TransactionMetadata {
  chainHash: number;
  icon?: string;
  title?: string;
  token: FTState;
}

