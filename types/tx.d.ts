export interface MinScillaParams {
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

export interface TokenTransferMetadata {
  decimals: number;
  symbol: string;
  name: string;
  to: string;
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

export interface AccessListItem {
  address: string;
  storageKeys: string[];
}
