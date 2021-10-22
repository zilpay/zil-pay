/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */

export interface TxBlock {
  TxBlock: {
    body: {
      BlockHash: string;
      HeaderSign: string;
      MicroBlockInfos: {
        MicroBlockHash: string;
        MicroBlockShardId: number;
        MicroBlockTxnRootHash: string;
      }[];
    };
    header: {
      BlockNum: string;
      DSBlockNum: string;
      GasLimit: string;
      GasUsed: string;
      MbInfoHash: string;
      MinerPubKey: string;
      NumMicroBlocks: number;
      NumPages: number;
      NumTxns: number;
      PrevBlockHash: string;
      Rewards: string;
      StateDeltaHash: string;
      StateRootHash: string;
      Timestamp: string;
      TxnFees: string;
      Version: number;
    };
  };
  TxHashes: Array<string[]>;
}
