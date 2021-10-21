/*
 * Project: ZilPay-wallet
 * Author: Rinat(hiccaru)
 * -----
 * Modified By: the developer formerly known as Rinat(hiccaru) at <lich666black@gmail.com>
 * -----
 * Copyright (c) 2021 ZilPay
 */
import type { TabStream } from 'lib/streem/tab-stream';
import type { Subject } from './subject';

import { ZilliqaUtils } from './crypto/zilliqa-utils';
import { HTTPProvider } from './provider';
import { CryptoUtils } from './crypto/utils';
import { Blockchain } from './blockchain';
import { Wallet } from './wallet';

export class ZilPay {
  public utils = ZilliqaUtils;
  public crypto = CryptoUtils;
  public provider: HTTPProvider;
  public blockchain: Blockchain;
  public wallet: Wallet;

  constructor(stream: TabStream, subject: Subject) {
    this.provider = new HTTPProvider(stream, subject);
    this.wallet = new Wallet(stream, subject);
    this.blockchain = new Blockchain(this.provider, this.wallet);
  }
}
