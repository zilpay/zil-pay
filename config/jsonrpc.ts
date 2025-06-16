/**
 * Enum for Zilliqa JSON-RPC methods.
 */
export enum ZilMethods {
  GetSmartContractInit = "GetSmartContractInit",
  GetBalance = "GetBalance",
  GetSmartContractSubState = "GetSmartContractSubState",
  GetNetworkId = "GetNetworkId",
  GetPendingTxn = "GetPendingTxn",
  GetTransaction = "GetTransaction",
  CreateTransaction = "CreateTransaction",
  GetTransactionStatus = "GetTransactionStatus",
  GetLatestTxBlock = "GetLatestTxBlock",
  GetTxBlock = "GetTxBlock",
  GetRecentTransactions = "GetRecentTransactions",
  GetMinimumGasPrice = "GetMinimumGasPrice",
}

/**
 * Enum for EVM-compatible JSON-RPC methods.
 */
export enum EvmMethods {
  // State Methods
  GetBalance = "eth_getBalance",
  GetStorageAt = "eth_getStorageAt",
  GetTransactionCount = "eth_getTransactionCount",
  GetBlockTransactionCountByHash = "eth_getBlockTransactionCountByHash",
  GetBlockTransactionCountByNumber = "eth_getBlockTransactionCountByNumber",
  GetCode = "eth_getCode",
  Call = "eth_call",
  EstimateGas = "eth_estimateGas",

  // Block Methods
  BlockNumber = "eth_blockNumber",
  GetBlockByHash = "eth_getBlockByHash",
  GetBlockByNumber = "eth_getBlockByNumber",
  GetBlockReceipts = "eth_getBlockReceipts",

  // Transaction Methods
  SendRawTransaction = "eth_sendRawTransaction",
  GetTransactionByHash = "eth_getTransactionByHash",
  GetTransactionByBlockHashAndIndex = "eth_getTransactionByBlockHashAndIndex",
  GetTransactionByBlockNumberAndIndex = "eth_getTransactionByBlockNumberAndIndex",
  GetTransactionReceipt = "eth_getTransactionReceipt",

  // Account Methods
  Accounts = "eth_accounts",
  GetProof = "eth_getProof",

  // Chain State
  ChainId = "eth_chainId",
  NetworkVersion = "net_version",
  Syncing = "eth_syncing",
  GasPrice = "eth_gasPrice",
  MaxPriorityFeePerGas = "eth_maxPriorityFeePerGas",
  FeeHistory = "eth_feeHistory",
  BlobBaseFee = "eth_blobBaseFee",

  // Filter Methods
  NewFilter = "eth_newFilter",
  NewBlockFilter = "eth_newBlockFilter",
  NewPendingTransactionFilter = "eth_newPendingTransactionFilter",
  UninstallFilter = "eth_uninstallFilter",
  GetFilterChanges = "eth_getFilterChanges",
  GetFilterLogs = "eth_getFilterLogs",
  GetLogs = "eth_getLogs",

  // Contract Methods
  Sign = "eth_sign",
  SignTransaction = "eth_signTransaction",
}
