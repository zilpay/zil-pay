export interface EVMBlock {
  hash: string;
  parentHash: string;
  sha3Uncles: string;
  miner: string;
  stateRoot: string;
  transactionsRoot: string;
  receiptsRoot: string;
  logsBloom: string;
  totalDifficulty: string;
  number: string;
  gasLimit: string;
  gasUsed: string;
  timestamp: string;
  extraData: string;
  mixHash: string;
  nonce: string;
  size: string;
  difficulty: string;
  transactions: string[];
  uncles: string[];
  withdrawalsRoot?: string;
  withdrawals?: any[];
  baseFeePerGas?: string;
  blobGasUsed?: string;
  excessBlobGas?: string;
  parentBeaconBlockRoot?: string;
}
