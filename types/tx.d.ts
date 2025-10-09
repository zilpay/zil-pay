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
  gasPrice: string;
  gasLimit: string;
  receipt: {
    accepted: boolean;
    gas_used: string;
    cumulative_gas_used: string;
    cumulative_gas: string;
    epoch_num: string;
    event_logs: unknown;
    errors: unknown;
    exceptions: {
      line: number;
      message: string;
    }[];
  };
}

export interface TokenTransferMetadata {
  decimals: number;
  symbol: string;
  name: string;
  to: string;
  amount: string;
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

export interface TransactionReceiptEVM extends TransactionRequestEVM {
  sig: string;
  hash: string;
  type?: number;
}

export interface AccessListItem {
  address: string;
  storageKeys: string[];
}

export interface TransactionMetadata {
  chainHash: number;
  info?: string;
  icon?: string;
  title?: string;
}

