/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */

export enum RPCMethod {
  // Network-related methods
  GetNetworkId = 'GetNetworkId',

  // Blockchain-related methods
  GetBlockchainInfo = 'GetBlockchainInfo',
  GetShardingStructure = 'GetShardingStructure',
  GetDSBlock = 'GetDsBlock',
  GetLatestDSBlock = 'GetLatestDsBlock',
  GetNumDSBlocks = 'GetNumDSBlocks',
  GetDSBlockRate = 'GetDSBlockRate',
  DSBlockListing = 'DSBlockListing',
  GetTxBlock = 'GetTxBlock',
  GetLatestTxBlock = 'GetLatestTxBlock',
  GetNumTxBlocks = 'GetNumTxBlocks',
  GetTxBlockRate = 'GetTxBlockRate',
  TxBlockListing = 'TxBlockListing',
  GetNumTransactions = 'GetNumTransactions',
  GetTransactionRate = 'GetTransactionRate',
  GetCurrentMiniEpoch = 'GetCurrentMiniEpoch',
  GetCurrentDSEpoch = 'GetCurrentDSEpoch',
  GetPrevDifficulty = 'GetPrevDifficulty',
  GetPrevDSDifficulty = 'GetPrevDSDifficulty',
  GetTotalCoinSupply = 'GetTotalCoinSupply',
  GetMinerInfo = 'GetMinerInfo',

  // Transaction-related methods
  CreateTransaction = 'CreateTransaction',
  GetTransaction = 'GetTransaction',
  GetTransactionStatus = 'GetTransactionStatus',
  GetRecentTransactions = 'GetRecentTransactions',
  GetTransactionsForTxBlock = 'GetTransactionsForTxBlock',
  GetTransactionsForTxBlockEx = 'GetTransactionsForTxBlockEx',
  GetTxnBodiesForTxBlock = 'GetTxnBodiesForTxBlock',
  GetTxnBodiesForTxBlockEx = 'GetTxnBodiesForTxBlockEx',
  GetNumTxnsTxEpoch = 'GetNumTxnsTxEpoch',
  GetNumTxnsDSEpoch = 'GetNumTxnsDSEpoch',
  GetMinimumGasPrice = 'GetMinimumGasPrice',

  // Contract-related methods
  GetContractAddressFromTransactionID = 'GetContractAddressFromTransactionID',
  GetSmartContracts = 'GetSmartContracts',
  GetSmartContractCode = 'GetSmartContractCode',
  GetSmartContractInit = 'GetSmartContractInit',
  GetSmartContractState = 'GetSmartContractState',
  GetSmartContractSubState = 'GetSmartContractSubState',
  GetStateProof = 'GetStateProof',

  // Account-related methods
  GetBalance = 'GetBalance',

  //// deprecated /////
  GetPendingTxn = 'GetPendingTxn',
  GetPendingTxns = 'GetPendingTxns'
  //// deprecated /////
}
