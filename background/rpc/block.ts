export interface EVMBlock {
  /** The hash of the block. null when it's a pending block. */
  hash: string;
  /** The hash of the parent block. */
  parentHash: string;
  /** The SHA3 of the uncles data in the block. */
  sha3Uncles: string;
  /** The address of the beneficiary to whom the mining rewards were given. */
  miner: string;
  /** The root of the state trie of the block. */
  stateRoot: string;
  /** The root of the transaction trie of the block. */
  transactionsRoot: string;
  /** The root of the receipts trie of the block. */
  receiptsRoot: string;
  /** The bloom filter for the logs of the block. null when it's a pending block. */
  logsBloom: string;
  /** The total difficulty of the chain until this block. */
  totalDifficulty: string;
  /** The block number. null when it's a pending block. */
  number: string;
  /** The maximum gas allowed in this block. */
  gasLimit: string;
  /** The total used gas by all transactions in this block. */
  gasUsed: string;
  /** The unix timestamp for when the block was collated. */
  timestamp: string;
  /** The "extra data" field of this block. */
  extraData: string;
  /** The hash of the generated proof-of-work. null when it's a pending block. */
  mixHash: string;
  /** The nonce of the generated proof-of-work. null when it's a pending block. */
  nonce: string;
  /** The size of this block in bytes. */
  size: string;
  /** The difficulty for this block. */
  difficulty: string;
  /** Array of transaction objects, or 32-byte transaction hashes. */
  transactions: string[];
  /** Array of uncle hashes. */
  uncles: string[];
  /** The root of the withdrawals trie of the block. */
  withdrawalsRoot?: string;
  /** An array of withdrawal objects. */
  withdrawals?: any[];
  /** The base fee per gas. */
  baseFeePerGas?: string;
  /** The gas used for blobs. */
  blobGasUsed?: string;
  /** The excess blob gas. */
  excessBlobGas?: string;
  /** The parent beacon block root. */
  parentBeaconBlockRoot?: string;
}
